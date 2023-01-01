import {
  apply,
  LinearMap,
  linearMapFromFloat64Array,
  linearMapFromOp,
  LinearOperator,
  makeDiagonal,
  vectorFromArray,
} from '../src/linear-map';

function newArray<T>(n: number, mapfn: (ignore: any, k: number) => T): T[] {
  return Array.from({ length: n }, mapfn);
}

function opAsGrid(op: LinearOperator) {
  const result = newArray(op.dimension, (_) =>
    newArray(op.dimension, (_) => 0),
  );
  op.foreach2d((cij, i, j) => (result[i][j] = cij));
  return result;
}

function mapAsGrid(m: LinearMap) {
  const result = newArray(m.output_dimension, (_) =>
    newArray(m.input_dimension, (_) => 0),
  );
  m.foreach2d((cij, i, j) => (result[i][j] = cij));
  return result;
}

function updated(op: LinearOperator, x: Float64Array) {
  op.update(x);
  return x;
}

test('makeDiagonal', () => {
  const d = makeDiagonal(Float64Array.of(1, 2, 3));
  expect(d.dimension).toBe(3);
  expect(updated(d, Float64Array.of(7, 8, 9))).toEqual(
    Float64Array.of(7, 16, 27),
  );
  expect(opAsGrid(d)).toEqual([
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
  ]);
  expect(d.transpose()).toBe(d);
  const m = linearMapFromOp(d);
  expect(m.input_dimension).toBe(3);
  expect(m.output_dimension).toBe(3);
  expect(mapAsGrid(m)).toEqual([
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
  ]);
  expect(mapAsGrid(m.transpose())).toEqual([
    [1, 0, 0],
    [0, 2, 0],
    [0, 0, 3],
  ]);
  expect(apply(m, vectorFromArray(Float64Array.of(7, 8, 9)))).toEqual(
    Float64Array.of(7, 16, 27),
  );
});

test('makeLinearMapFromFloatGrid', () => {
  const m = linearMapFromFloat64Array([
    Float64Array.of(0, 0),
    Float64Array.of(0, 1),
    Float64Array.of(1, 0),
  ]);
  expect(m.input_dimension).toBe(2);
  expect(m.output_dimension).toBe(3);
  expect(mapAsGrid(m)).toEqual([
    [0, 0],
    [0, 1],
    [1, 0],
  ]);
  expect(mapAsGrid(m.transpose())).toEqual([
    [0, 0, 1],
    [0, 1, 0],
  ]);
  expect(apply(m, vectorFromArray(Float64Array.of(8, 9)))).toEqual(
    Float64Array.of(0, 9, 8),
  );
});

test('makeHousholderReflection', () => {});
