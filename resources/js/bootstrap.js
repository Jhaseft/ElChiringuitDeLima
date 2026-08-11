import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Usar el token CSRF de la cookie XSRF-TOKEN, que Laravel REFRESCA en cada
// respuesta (por eso nunca queda obsoleto). Antes se leía del <meta>, que se
// quedaba con el token viejo tras regenerar la sesión (login/registro) y
// provocaba 419 en el siguiente POST (p. ej. cerrar sesión).
window.axios.defaults.withXSRFToken = true;
window.axios.interceptors.request.use((config) => {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    if (match) {
        // La cookie viene URL-encoded; Laravel espera el valor decodificado.
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(match[1]);
    }
    // Se deja de enviar X-CSRF-TOKEN (del <meta>) para que no pise a la cookie.
    delete config.headers['X-CSRF-TOKEN'];
    return config;
});
