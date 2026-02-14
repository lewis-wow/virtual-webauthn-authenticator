export const validateShape = (data: unknown, shape: unknown): boolean => {
  if (data === shape) return true;

  if (
    typeof data !== 'object' ||
    data === null ||
    typeof shape !== 'object' ||
    shape === null
  ) {
    return false;
  }

  const dataRecord = data as Record<string, unknown>;
  const validationRecord = shape as Record<string, unknown>;

  return Object.keys(validationRecord).every(
    (key) =>
      Object.prototype.hasOwnProperty.call(dataRecord, key) &&
      dataRecord[key] === validationRecord[key],
  );
};
