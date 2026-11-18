// Production build: the API is expected on the same origin behind a reverse
// proxy (e.g. nginx `location /api/ { proxy_pass http://django; }`).
// Change to an absolute URL if the API is hosted on a different domain.
export const environment = {
  production: true,
  apiUrl: '/api',
};
