import {
  Float64Matrix,
  matrix,
  multiply,
  diagonalMultiply,
} from './float64matrix';
import { svd } from './svd';

// Returns vector x that minimizes the two norm of the difference
// between A x and b: |A x - b|_2.
export function solve(a: Float64Matrix, b: Float64Array): Float64Array {
  const { u, q, v } = svd(a);
  // Solve A^T A x = A^T b, equivalent to V Q^2 V^T x = V Q U^T b,
  // equivalent to Q V^T x = U^T b. Compute x = V Q^-1 (b^T U)^T
  const qi = Float64Array.from(q, (v) => (v > 0 ? 1 / v : 0));
  const bt = matrix(b, b.length);
  return multiply(v, diagonalMultiply(qi, matrix(multiply(bt, u), 1)));
}
