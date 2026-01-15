/**
 * Generates a random integer between min and max (inclusive).
 * @param min - The lower bound (inclusive).
 * @param max - The upper bound (inclusive).
 * @returns A random integer.
 */
export const randomInt = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
