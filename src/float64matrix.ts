import { blasDot } from './blas';

// Extension of Float64Array that also indicates a column count to
// interpret it as a matrix in row major order.
export type Float64Matrix = Float64Array & { cols: number };

// Returns a Float64Matrix from from a Float64Array in row major order
// with the given row count.
export function matrix(a: Float64Array, colCount: number): Float64Matrix {
  const y = a as Float64Matrix;
  y.cols = colCount;
  return y;
}

// Returns dot product of row i of matrix a and column j of matrix b.
export const rowColDot = (
  a: Float64Matrix,
  i: number,
  b: Float64Matrix,
  j: number,
) => blasDot(a.cols, a, 1, i * a.cols, b, b.cols, j);

// Returns dot product of column i of matrix a and column j of matrix b.
export const colColDot = (
  a: Float64Matrix,
  i: number,
  b: Float64Matrix,
  j: number,
) => blasDot(a.length / a.cols, a, a.cols, i, b, b.cols, j);

// Returns dot product of row i of matrix a and row j of matrix b.
export const rowRowDot = (
  a: Float64Matrix,
  i: number,
  b: Float64Matrix,
  j: number,
) => blasDot(a.cols, a, 1, i * a.cols, b, 1, j * b.cols);

export function multiply(a: Float64Matrix, b: Float64Matrix) {
  if (a.cols * b.cols < b.length) {
    throw new TypeError(
      `Too few columns ${a.cols} to multiply with ${b.length / b.cols} rows`,
    );
  }
  return matrix(
    Float64Array.from(Array((a.length / a.cols) * b.cols), (_, i) =>
      rowColDot(a, Math.floor(i / b.cols), b, i % b.cols),
    ),
    b.cols,
  );
}

export function diagonalMultiply(
  diag: Float64Array,
  b: Float64Matrix,
): Float64Matrix {
  if (diag.length * b.cols != b.length) {
    throw new TypeError(
      `Dimension mismatch diagonal ${diag.length} != ${b.length / b.cols}`,
    );
  }
  return matrix(
    Float64Array.from(b, (v, i) => diag[Math.floor(i / b.cols)] * v),
    b.cols,
  );
}

export function transpose(a: Float64Matrix) {
  const cols = a.length / a.cols;
  return matrix(
    Float64Array.from(
      a,
      (_, i) => a[a.cols * (i % cols) + Math.floor(i / cols)],
    ),
    cols,
  );
}

export const debugString = (a: Float64Matrix) =>
  `[${Array.from(
    Array(a.length / a.cols),
    (_, i) =>
      `[${Array.from(Array(a.cols), (_, j) => a[i * a.cols + j]).join(', ')}]`,
  ).join(',\n ')}]\n`;
