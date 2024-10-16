export const simulateError = async () => {
    const random = Math.random();
    if (random > 0.7) throw new Error('Simulando error de microservici');
  };
  