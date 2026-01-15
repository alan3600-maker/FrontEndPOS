export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  /**
   * Caja (POS terminal) por defecto para entorno local.
   * En prod lo ideal es que el usuario elija una caja, o se asigne por dispositivo.
   */
  defaultCajaId: 1
};