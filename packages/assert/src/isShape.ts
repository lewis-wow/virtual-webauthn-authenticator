export const isShape = (data: unknown, shape: unknown): boolean => {
  if (data === shape) return true;

  if (
    typeof data !== 'object' ||
    data === null ||
    typeof shape !== 'object' ||
    shape === null
  ) {
    return false;
  }

  if (Array.isArray(shape)) {
    if (!Array.isArray(data) || data.length !== shape.length) return false;
    return shape.every((item, index) => isShape(data[index], item));
  }

  const dataRecord = data as Record<string, unknown>;
  const shapeRecord = shape as Record<string, unknown>;

  return Object.keys(shapeRecord).every(
    (key) =>
      Object.prototype.hasOwnProperty.call(dataRecord, key) &&
      isShape(dataRecord[key], shapeRecord[key]),
  );
};
