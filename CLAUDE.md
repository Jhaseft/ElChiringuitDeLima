# TransferCash — Backend (Laravel 12)

Guía de trabajo para este proyecto. Complementa a la app móvil (Expo) que vive en
otro repo. Aquí viven la API (`routes/api.php`), el panel admin web (Inertia + React
en `resources/js`) y la base de datos.

---

## 1. Base de datos: producción y pruebas (OBLIGATORIO)

Hay **dos** bases de datos MySQL:

| Conexión (config/database.php) | Uso        | Variables en `.env`      |
| ------------------------------ | ---------- | ------------------------ |
| `mysql` (default)              | Producción | `DB_*`                   |
| `mysql_pruebas`                | Pruebas    | `DB_PRUEBAS_*`           |

**Regla:** **todo cambio de esquema (migraciones: crear/alterar/eliminar tablas o
columnas) se aplica en LAS DOS bases.** La de pruebas existe para probar el cambio
antes de tocar producción. Orden recomendado:

```bash
# 1) Primero SIEMPRE en pruebas (segura):
php artisan migrate --database=mysql_pruebas

# 2) Verificar que quedó bien; luego en producción:
php artisan migrate
```

- Rollback igual en ambas: `php artisan migrate:rollback --database=mysql_pruebas`
  y luego `php artisan migrate:rollback`.
- La conexión por defecto **no** cambia: `mysql_pruebas` solo se usa pasando
  `--database=mysql_pruebas` explícitamente. Nunca editar las claves `DB_*` para
  “apuntar a pruebas”; usar siempre las `DB_PRUEBAS_*` vía la conexión aparte.
- Toda migración debe ser **no destructiva y reversible**: columnas nuevas
  `nullable`, `up()` idempotente (`Schema::hasColumn(...)`) y `down()` que revierte.
  Si un cambio puede romper datos existentes, **no** ejecutarlo: proponerlo primero.

---

## 2. Bloqueo de usuarios (referencia)

Un admin puede bloquear el acceso de un usuario a la app. Piezas:

- Columnas `users.blocked_at` (timestamp) y `users.blocked_reason`. `blocked_at`
  NULL = usuario activo. **No** son mass-assignable (se asignan explícitamente,
  como `kyc_status`).
- `User::isBlocked()` — helper.
- Middleware `notblocked` (`EnsureUserNotBlocked`) en el grupo `auth:sanctum`
  (`routes/api.php`): corta a un usuario ya logueado y le revoca el token.
- Los 4 logins (`AppNative::login/loginGoogle/loginApple`) rechazan con 403 antes
  de emitir token.
- Panel: `AdminUserMediaController::block/unblock` + botón en
  `resources/js/Components/admin/Users/AdminUserMediaTable.jsx`.

Bloquear = `blocked_at = now()` + `tokens()->delete()` (cierra la sesión activa).
