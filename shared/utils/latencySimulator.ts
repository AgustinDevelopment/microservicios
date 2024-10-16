export const simulateLatency = async (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  