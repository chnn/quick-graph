export const midpoint = ([x0, y0], [x1, y1]) => {
  return [x0 + (x1 - x0) / 2, y0 + (y1 - y0) / 2];
};

export const orthUnitVector = ([x, y]) => {
  const norm = Math.sqrt(x * x + y * y);

  // Multiply [x, y] by Pi / 2 rotation matrix, then normalize to unit length
  return [-y / norm, x / norm];
};
