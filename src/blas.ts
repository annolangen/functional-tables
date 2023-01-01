const M = 4;

// Returns the dot product of two vectors x and y, each given with a
// base Float64Array, stride, and offset.
export function blasDot(
  n: number,
  x: Float64Array,
  strideX: number,
  offsetX: number,
  y: Float64Array,
  strideY: number,
  offsetY: number,
) {
  let ix = offsetX;
  let iy = offsetY;
  let s = 0.0;
  if (strideX !== 1 || strideY !== 1) {
    for (let i = n; --i >= 0; ) {
      s += x[ix] * y[iy];
      ix += strideX;
      iy += strideY;
    }
    return s;
  }
  const m = n % M;
  for (let i = m; --i >= 0; ) {
    s += x[ix] * y[iy];
    ix += 1;
    iy += 1;
  }
  for (let i = m; i < n; i += M) {
    s +=
      x[ix] * y[iy] +
      x[ix + 1] * y[iy + 1] +
      x[ix + 2] * y[iy + 2] +
      x[ix + 3] * y[iy + 3];
    ix += M;
    iy += M;
  }
  return s;
}

// Multiplies x by a constant alpha and adds the result to y. Each
// vector is given as base Float64Array, stride, and offset.
export function blasAxpy(
  n: number,
  alpha: number,
  x: Float64Array,
  strideX: number,
  offsetX: number,
  y: Float64Array,
  strideY: number,
  offsetY: number,
) {
  let ix = offsetX;
  let iy = offsetY;
  if (strideX !== 1 || strideY !== 1) {
    for (let i = n; --i >= 0; ) {
      y[iy] += alpha * x[ix];
      ix += strideX;
      iy += strideY;
    }
    return;
  }
  const m = n % M;
  for (let i = m; --i >= 0; ) {
    y[iy] += alpha * x[ix];
    ix += 1;
    iy += 1;
  }
  for (let i = m; i < n; i += M) {
    y[iy] += alpha * x[ix];
    y[iy + 1] += alpha * x[ix + 1];
    y[iy + 2] += alpha * x[ix + 2];
    y[iy + 3] += alpha * x[ix + 3];
    ix += M;
    iy += M;
  }
  return;
}
