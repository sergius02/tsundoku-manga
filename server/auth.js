const AUTH_USERNAME = process.env.AUTH_USERNAME;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

export function validateCredentials(username, password) {
  if (!AUTH_USERNAME || !AUTH_PASSWORD) {
    console.error('AUTH_USERNAME and AUTH_PASSWORD environment variables must be set');
    return false;
  }

  return username === AUTH_USERNAME && password === AUTH_PASSWORD;
}

export function isAuthConfigured() {
  return !!(AUTH_USERNAME && AUTH_PASSWORD);
}