# Redis — Plan de mejoras (velocidad + escala)

> Objetivo: que la app se sienta **instantánea** y que el backend **aguante muchos
> usuarios** sin martillar MySQL ni bloquear los procesos PHP.

## Principio (leer primero)

Son **dos capas complementarias**, no se reemplazan:

- **Caché del app (AsyncStorage + memoria):** evita el viaje por red → pintado
  instantáneo y offline. **Se queda como está.**
- **Redis (servidor):** que la API responda desde RAM (no MySQL) y que el trabajo
  lento salga del request. **Esto es lo nuevo.**

La app **nunca** habla directo con Redis (sería inseguro y RN no mantiene conexiones
persistentes). La app llama a la API de Laravel; **Laravel usa Redis por detrás.**

En móvil, el costo grande es el viaje por red (lo cubre el caché del app). Redis gana
en: (1) las peticiones que sí se hacen, (2) proteger MySQL en escala, (3) sacar trabajo
lento del request.

---

## Config previa (.env del backend)

```env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis        # opcional (panel web)
REDIS_CLIENT=phpredis        # o predis
REDIS_HOST=...
REDIS_PASSWORD=...
REDIS_PORT=6379
```

---

## Cómo funciona el TTL (patrón cache-aside)

Todo el caché usa el patrón **cache-aside** con `Cache::remember`:

```
valor = Redis.GET(llave)
si HIT  → devuelve (RAM, ~0.5 ms)
si MISS → corre la query a MySQL, Redis.SET(llave, resultado, TTL), devuelve
```

- **TTL = red de seguridad.** Si por lo que sea no se invalida a mano, el dato caduca
  solo y se recalcula.
- **Observer = frescura real.** Cuando el dato cambia (admin/scheduler), un Observer
  **borra la llave** al instante → el siguiente request trae lo nuevo sin esperar el TTL.
- Combinar ambos (cinturón + tirantes): frescura inmediata + auto-recuperación.

**Regla de TTL por tipo de dato:**

| Tipo de dato | TTL sugerido | Frescura principal |
| --- | --- | --- |
| Cambia solo por admin (bancos, métodos, config, banners, catálogo TC) | largo (12–24 h) o `forever` | Observer al editar |
| Tipo de cambio | ~6–10 min (algo > worker de 5 min) | Observer de `TipoCambio` |
| Por-usuario (resumen, historial, saldo) | corto (5–10 min) | invalidar al escribir |

---

## Bloque A — Caché de lecturas globales

Datos que se leen mucho y cambian poco. Se cachean con TTL largo y se invalidan por
Observer cuando el admin edita.

| Endpoint | Llave | TTL | Se invalida en |
| --- | --- | --- | --- |
| `/api/tipo-cambio/historial` | `tc_historial` | 6–10 min | Observer `TipoCambio@created` |
| `/operacion/listar-bancos` | `bancos_all` | 24 h | Observer `Bank` |
| `/api/transfer-methods` | `transfer_methods` | 24 h | Observer `TransferMethod` |
| `/api/config/transfer` | `config_transfer` | 24 h | al guardar `Configuracion` |
| Banners (Home) | `banners_activos` | 24 h | Observer `Banner` |
| Catálogo TC Puntos | `tcpuntos_catalogo` | 24 h | Observer productos/categorías |

**Ejemplo (endpoint):**

```php
// /api/tipo-cambio/historial
public function historial() {
    $data = Cache::remember('tc_historial', now()->addMinutes(8), function () {
        return TipoCambio::orderBy('created_at')->get();
    });
    return response()->json($data);
}
```

**Ejemplo (Observer que da la frescura):**

```php
// App\Observers\TipoCambioObserver
public function created(TipoCambio $tc) {
    Cache::forget('tc_historial');
}
// registrar en AppServiceProvider::boot(): TipoCambio::observe(TipoCambioObserver::class);
```

Con esto: 10.000 lecturas en 5 min = casi todas HIT (RAM), MySQL ni se entera; y al
cambiar el TC, el Observer limpia y el siguiente request trae lo nuevo.

**Cambios en el app:** ninguno. Las mismas peticiones, solo que responden más rápido.

---

## Bloque B — Caché por-usuario

Datos propios del usuario que cambian cuando **él** hace algo. Llave por usuario +
invalidar en la escritura.

| Dato | Llave | TTL | Se invalida cuando |
| --- | --- | --- | --- |
| Resumen Home (SUM/COUNT) | `resumen:user:{id}` | 10 min | crea/completa transferencia |
| Historial transferencias | `transfers:user:{id}` | 10 min | crea transferencia |
| Saldo/Historial TC Puntos | `tcpuntos:user:{id}` | 10 min | gana/canjea puntos |

**Ejemplo:**

```php
public function resumen(Request $request) {
    $id = $request->user()->id;
    $data = Cache::remember("resumen:user:{$id}", now()->addMinutes(10), function () use ($id) {
        return /* el SUM/COUNT de hoy */;
    });
    return response()->json($data);
}

// al crear la transferencia:
Cache::forget("resumen:user:{$userId}");
Cache::forget("transfers:user:{$userId}");
```

Quita las queries pesadas (SUM, COUNT, joins) de cada refresh/pull-to-refresh.

**Cambios en el app:** ninguno.

---

## Bloque C — Colas (queues) con Redis ⭐ (el salto para muchos usuarios)

### El problema hoy
Hay trabajo **lento que corre dentro del request** y el usuario espera:
- Enviar el correo del código de registro (`Mail::to()->send`) → segundos.
- Subir imágenes a Cloudinary: QR y **comprobantes** de la transferencia (varias fotos).
- Push notifications.
- Proxy del chat a n8n.

Con muchos usuarios, cada request "ocupa" un proceso PHP durante todo ese tiempo →
se saturan y la app se siente lenta o da timeouts.

### Cómo funciona una cola (internamente)
```
Request → dispatch(Job)   →  Redis (lista de trabajos)  →  worker (queue:work)
   ↑ responde YA                                            corre el Job por detrás
```
- `dispatch()` **empuja** el trabajo a una lista en Redis y **responde de inmediato**.
- Un proceso aparte (`php artisan queue:work`, mantenido vivo por **Supervisor** o
  **Horizon**) **saca** trabajos de Redis y los ejecuta.
- Reintentos automáticos, backoff y `failed_jobs` si algo falla.

### Ejemplo 1 — correo de registro (async)
**Antes (síncrono):** el usuario espera a que salga el mail.
```php
Mail::to($request->email)->send(new VerifyCodeEmail($code)); // bloquea
```
**Después (encolado):**
```php
// El Mailable implementa ShouldQueue, o:
Mail::to($request->email)->queue(new VerifyCodeEmail($code)); // vuelve al instante
```
El request responde "código enviado" en ~5 ms; el worker manda el correo por detrás.

### Ejemplo 2 — comprobantes de la transferencia (async)
**Antes:** `crearTransferencia` sube N fotos a Cloudinary **dentro** del request →
puede tardar segundos con varias imágenes.

**Después:**
1. Se crea la transferencia con `status = 'pending'` y se guardan los archivos temporales.
2. Se despacha un Job:
```php
// Job
class SubirComprobantes implements ShouldQueue {
    public function __construct(public int $transferId, public array $paths) {}
    public function handle() {
        foreach ($this->paths as $p) {
            $url = (new UploadApi())->upload($p, ['folder' => "comprobantes/{$this->transferId}"]);
            // asociar $url['secure_url'] a la transferencia
        }
    }
}
// en el controller:
SubirComprobantes::dispatch($transfer->id, $paths);
return response()->json(['transfer_number' => $transfer->number]); // responde YA
```
El usuario ve "operación registrada" al instante; las fotos suben en background.

> ⚠️ Qué debe seguir **síncrono**: lo que necesita el resultado antes de responder.
> Ej.: el **QR** en `guardarCuenta` necesita el `secure_url` para guardarse → ese se
> queda síncrono (o se responde "procesando"). Los comprobantes NO lo necesitan.

### Ejemplo 3 — push notifications
```php
EnviarPush::dispatch($userId, $titulo, $mensaje); // fuera del request
```

### Infra necesaria
- `QUEUE_CONNECTION=redis`.
- Un worker vivo: `php artisan queue:work --tries=3` bajo **Supervisor** (o **Horizon**
  para dashboard + métricas).
- Tabla `failed_jobs` para reintentos.

### Cambios en el app
- **Registro:** ninguno (igual espera el código por correo; solo que el request vuelve
  más rápido).
- **Transferencia con comprobantes async:** el app ya navega al historial tras
  responder. Solo hay que asegurar que el mensaje de éxito diga algo tipo
  *"Operación registrada, estamos procesando tus comprobantes"* y que el historial
  muestre `pending` hasta que el worker termine. Cambio mínimo de copy, sin lógica nueva.

---

## Bloque D — Concurrencia y anti-abuso (Redis atómico)

### Rate limiting
Ya existen `ratelimit` y `AuthRateLimiter`. Respaldados en Redis, los contadores son
**atómicos y compartidos entre instancias**: si mañana hay 2–3 servidores tras un
balanceador, el límite sigue siendo correcto (con caché local por-servidor, no).

### Candados (`Cache::lock`) — anti doble-gasto
Para el **canje de TC Puntos** o descuento de stock, evita carreras si el usuario toca
dos veces rápido o hay concurrencia:
```php
$lock = Cache::lock("canje:user:{$id}", 10);
if (! $lock->get()) {
    return response()->json(['message' => 'Procesando, espera un momento.'], 429);
}
try {
    // validar saldo, descontar puntos, crear canje (atómico)
} finally {
    $lock->release();
}
```
Redis garantiza que solo un proceso gane el lock.

**Cambios en el app:** ninguno.

---

## Bloque E — Bonus

- **Sesiones** del panel web en Redis (`SESSION_DRIVER=redis`) — el app usa tokens, no
  aplica; útil solo para escalar el panel.
- **Broadcasting** (Reverb/Echo con Redis Pub/Sub) — solo si algún día quieres push en
  tiempo real. Hoy no hace falta: el esquema on-demand + confirm ya cubre el TC.

---

## Nota sobre `/version` (aclaración)
`/version` **no** es la versión de la app. Era un marcador del **tipo de cambio** en
Redis para que el app preguntara "¿cambió?" con pocos bytes. Es **opcional** y como el
historial es chico, se puede omitir. No se implementa salvo que quieras ahorrar datos.

---

## Roadmap por impacto

1. **Bloque A + Observers** — respuestas instantáneas y MySQL protegido. Bajo esfuerzo,
   alto impacto. **Sin tocar el app.**
2. **Bloque C (colas)** — lo que más ayuda a aguantar picos de usuarios (registro,
   transferencia, push). Esfuerzo medio. Cambio mínimo de copy en el app.
3. **Bloque B (caché por-usuario)** — quita queries pesadas del resumen/historial.
4. **Bloque D (rate limit Redis + locks)** — correctness bajo carga y multi-instancia.

## Resumen: ¿qué cambia en el app?
- Bloques A, B, D: **nada**. La app queda igual y solo recibe respuestas más rápidas.
- Bloque C: **cambio mínimo de copy** (mensaje "procesando comprobantes" + estado
  `pending` en historial) si se hace la subida async. Sin lógica nueva.

La app ya es rápida por su caché local; Redis hace rápido y resistente el backend.
