export const environment = {
  production: false,
  // Sem Docker: `php artisan serve --port=8000`. Com Docker/nginx local, use porta 80 (sem :8000).
  apiUrl: 'http://api.portalfornecedor.local:8000/api',
};
