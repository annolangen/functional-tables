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

function makeLinearMapFromOp(op: LinearOperator): LinearMap {
  return {
    input_dimension: op.dimension,
    output_dimension: op.dimension,
    foreach2d: op.foreach2d,
    transpose: () => makeLinearMapFromOp(op.transpose())
  };
}

export function apply(m: LinearMap, x: Float64Array): Float64Array {
  const y = Float64Array.from(Array(m.output_dimension), _ => 0);
  m.foreach2d((c_ij, i, j) => y[i] = c_ij * x[j]);
  return y;
}

function makeForEachTransposed(foreach2d: CellSource2D): CellSource2D {
  return (f: CellSink2D) => {
    foreach2d((c_ij, i, j) => f(c_ij, j, i));
  }
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
      transpose: () => result
    })
  };
  return result;

  function foreach2d(f: CellSink2D) {
    rows.forEach((row, i) => row.forEach((c_ij, j) => f(i, j, c_ij)));
  }
}

export function makeDiagonal(d: Float64Array): LinearOperator {
  const result: LinearOperator = {
    dimension: d.length,
    transpose: () => result,
    foreach2d: (f: (c_ij: number, i: number, j: number) => void) => {
      d.forEach((c_ii, i) => f(c_ii, i, i))
    },
    update(x: Float64Array) {
      d.forEach((c_ii, i) => {
        x[i] *= c_ii;
      });
    }
  };
  return result;
}

// Returns reflection, R, s.t. following R.update(column), column[i] == 0 for i
// > k. In matrix form the Householder reflection has an upper left identity
// matrix of size n-k and a lower right, square, k-dimensional matrix v w v^T,
// where w is some scalar, and v some unit length vector, designed to accomplish
// the zeroing of the lower column.
export function makeHousholderReflection(
    column: Float64Array, k: number): LinearOperator {
  // TODO
  return {} as LinearOperator;
}
