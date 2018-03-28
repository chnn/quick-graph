export const truncate = (text, k = 5) => {
  if (!text) {
    return "";
  }

  if (text.length < k + 2) {
    return text;
  }

  return `${text.slice(0, k)}...`;
};

export const extentBy = (xs, key = x => x) => {
  let min, max;
  let minValue = Infinity;
  let maxValue = -Infinity;

  for (const x of xs) {
    const value = key(x);

    if (value > maxValue) {
      max = x;
      maxValue = value;
    }

    if (value < minValue) {
      min = x;
      minValue = value;
    }
  }

  return [min, max];
};

export const midpoint = ([x0, y0], [x1, y1]) => {
  return [x0 + (x1 - x0) / 2, y0 + (y1 - y0) / 2];
};

export const orthUnitVector = ([x, y]) => {
  const norm = Math.sqrt(x * x + y * y);

  // Multiply [x, y] by Pi / 2 rotation matrix, then normalize to unit length
  return [-y / norm, x / norm];
};
