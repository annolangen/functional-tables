type CellSink2D = (cell_i_j: number, i: number, j: number) => void;
type CellSource2D = (sink: CellSink2D) => void;

// A linear map is characterized by f(a + c*b) = f(a) + c*f(b) for vectors a, b,
// and scalar c. They are equivalent to matrices, but imporant linear maps with
// fewer multiplications and additions.
export interface LinearMap {
  // Corresponds to matrix column count
  readonly input_dimension: number;

  // Corresponds to matrix row count
  readonly output_dimension: number;

  transpose(): LinearMap;

  // Calls f with non-zero cells of corresponding matrix
  foreach2d(f: CellSink2D): void;
}

// LinearMap with input_dimension == output_dimension and intended use for
// updates, like `x := f(x)`.
export interface LinearOperator {
  readonly dimension: number;
  update(x: Float64Array): void;

  // Calls f with non-zero cells of corresponding matrix
  foreach2d(f: CellSink2D): void;

  transpose(): LinearOperator;
}

export function makeLinearMapFromOp(op: LinearOperator): LinearMap {
  return {
    input_dimension: op.dimension,
    output_dimension: op.dimension,
    foreach2d: op.foreach2d,
    transpose: () => makeLinearMapFromOp(op.transpose()),
  };
}

export function apply(m: LinearMap, x: Float64Array): Float64Array {
  const y = Float64Array.from({length: m.output_dimension}, _ => 0);
  m.foreach2d((c_ij, i, j) => (y[i] += c_ij * x[j]));
  return y;
}

function makeForEachTransposed(foreach2d: CellSource2D): CellSource2D {
  return (f: CellSink2D) => {
    foreach2d((c_ij, i, j) => f(c_ij, j, i));
  };
}

export function makeLinearMapFromFloatGrid(rows: Float64Array[]): LinearMap {
  const row0Length = rows.length ? rows[0].length : 0;
  const result: LinearMap = {
    input_dimension: row0Length,
    output_dimension: rows.length,
    foreach2d,
    transpose: () => ({
      input_dimension: rows.length,
      output_dimension: row0Length,
      foreach2d: makeForEachTransposed(foreach2d),
      transpose: () => result,
    }),
  };
  return result;

  function foreach2d(f: CellSink2D) {
    rows.forEach((row, i) => row.forEach((c_ij, j) => f(c_ij, i, j)));
  }
}

export function makeDiagonal(d: Float64Array): LinearOperator {
  const result: LinearOperator = {
    dimension: d.length,
    transpose: () => result,
    foreach2d: (f: (c_ij: number, i: number, j: number) => void) => {
      d.forEach((c_ii, i) => f(c_ii, i, i));
    },
    update(x: Float64Array) {
      d.forEach((c_ii, i) => {
        x[i] *= c_ii;
      });
    },
  };
  return result;
}

// Returns reflection, R, s.t. following R.update(column), column[i] == 0
// for i > k. In matrix form the Householder reflection has an upper
// left identity matrix of size n-k and a lower right, square,
// k-dimensional matrix `I - 2 v v^T`, where v is some unit length
// vector, designed to accomplish the zeroing of the lower column.
export function makeHousholderReflection(
  column: Float64Array,
  k: number
): LinearOperator {
  const v = getReflector();
  const result = {
    dimension: column.length,
    update(x: Float64Array) {
      const vtx2 = 2 * v.reduce((a, vk, k) => a + vk * x[k]);
      v.forEach((vk, k) => (x[k] -= vtx2 * vk));
    },
    transpose: () => result,
    foreach2d(f: CellSink2D) {
      for (var i = k; --i >= 0; ) f(1, i, i);
      for (var i = k; --i >= 0; ) {
        for (var j = k; --k >= 0; ) f(1 - 2 * v[i] * v[j], k + i, k + j);
      }
    },
  };
  return result;

  function getReflector() {
    const v = new Float64Array(column.subarray(k));
    const c_norm = Math.sqrt(v.reduce((a, x) => a + x * x));
    v[0] += v[0] > 0 ? c_norm : -c_norm;
    const v_norm = Math.sqrt(v.reduce((a, x) => a + x * x));
    v.forEach((_, k) => (v[k] /= v_norm));
    return v;
  }
}
