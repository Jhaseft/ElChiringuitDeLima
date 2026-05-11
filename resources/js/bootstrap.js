import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Read token fresh from meta on each request instead of caching it at startup.
// This prevents stale CSRF token issues after OAuth redirects (e.g. Google login on Safari).
window.axios.interceptors.request.use((config) => {
    const csrfMeta = document.head.querySelector('meta[name="csrf-token"]');
    if (csrfMeta) {
        config.headers['X-CSRF-TOKEN'] = csrfMeta.content;
    }
    return config;
});
