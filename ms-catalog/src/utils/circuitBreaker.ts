import CircuitBreaker from 'opossum';

const options = {
  timeout: 5000, // Tiempo máximo de espera antes de que la promesa se rechace
  errorThresholdPercentage: 50, // Porcentaje de fallos permitidos
  resetTimeout: 30000 // Tiempo que permanece abierto antes de intentar cerrarse
};

export const createCircuitBreaker = (action: (...args: unknown[]) => Promise<unknown>) => {
  return new CircuitBreaker(action, options);
};