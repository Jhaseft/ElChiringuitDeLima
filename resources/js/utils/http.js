import axios from "axios";

// Cliente que usa la cookie XSRF-TOKEN (que Laravel refresca en cada respuesta)
// en lugar del <meta name="csrf-token"> estático. En iOS/Safari el <meta> se
// queda viejo por el bfcache (la página se restaura desde memoria al navegar
// atrás o volver desde otra app), lo que provoca el error "CSRF token mismatch".
// No usa el interceptor global de bootstrap.js a propósito, para no reinyectar
// ese <meta> viejo.
const client = axios.create({
  withCredentials: true,
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { Accept: "application/json" },
});

// Refresca la cookie XSRF-TOKEN y reintenta una sola vez ante un 419.
async function withCsrfRetry(request) {
  try {
    return await request();
  } catch (err) {
    if (err?.response?.status === 419) {
      await client.get("/sanctum/csrf-cookie");
      return await request();
    }
    throw err;
  }
}

export function apiPost(url, data, config) {
  return withCsrfRetry(() => client.post(url, data, config));
}

export function apiDelete(url, config) {
  return withCsrfRetry(() => client.delete(url, config));
}

// Extrae un mensaje legible de un error de axios (incluye errores de validación 422).
export function getApiErrorMessage(err, fallback = "Error en el servidor") {
  const res = err?.response;
  if (res?.status === 419) {
    return "Tu sesión expiró. Recarga la página e inténtalo de nuevo.";
  }
  if (res?.status === 422 && res.data?.errors) {
    return Object.keys(res.data.errors)
      .map((k) => res.data.errors[k].join("\n"))
      .join("\n");
  }
  return res?.data?.message || err?.message || fallback;
}
