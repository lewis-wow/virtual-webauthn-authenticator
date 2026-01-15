export const delayPromise = (delayMs: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
};
