export const isNullish = (val: unknown): val is undefined | null => {
  return val === undefined || val === null;
};
