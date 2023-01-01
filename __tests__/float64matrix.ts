import { describe, expect, test } from '@jest/globals';
import {
  matrix,
  rowColDot,
  colColDot,
  rowRowDot,
  multiply,
  transpose,
} from '../src/float64matrix';

describe('Float64Matrix', () => {
  const m = matrix(Float64Array.from([1, 2, 3, 4]), 2);
  const I = matrix(Float64Array.from([1, 0, 0, 1]), 2);
  const r = matrix(Float64Array.from([0, -1, 1, 0]), 2);
  const rr = multiply(r, r);

  test('matrix', () => {
    expect(m.cols).toBe(2);
  });

  test('rowColDot', () => {
    expect(rowColDot(m, 0, m, 0)).toBe(7);
    expect(rowColDot(m, 0, m, 1)).toBe(10);
    expect(rowColDot(m, 1, m, 0)).toBe(15);
    expect(rowColDot(m, 1, m, 1)).toBe(22);
  });

  test('colColDot', () => {
    expect(colColDot(m, 0, m, 0)).toBe(10);
    expect(colColDot(m, 0, m, 1)).toBe(14);
    expect(colColDot(m, 1, m, 0)).toBe(14);
    expect(colColDot(m, 1, m, 1)).toBe(20);
  });

  test('rowRowDot', () => {
    expect(rowRowDot(m, 0, m, 0)).toBe(5);
    expect(rowRowDot(m, 1, m, 0)).toBe(11);
    expect(rowRowDot(m, 0, m, 1)).toBe(11);
    expect(rowRowDot(m, 1, m, 1)).toBe(25);
  });

  test('multiply', () => {
    expect([...multiply(m, I)]).toEqual([1, 2, 3, 4]);
    expect([...multiply(I, m)]).toEqual([1, 2, 3, 4]);
    expect([...rr]).toEqual([-1, 0, 0, -1]);
    expect([...multiply(rr, rr)]).toEqual([1, 0, 0, 1]);
    const rect = matrix(Float64Array.from([1, 2, 3, 4, 5, 6]), 2);
    expect([...multiply(rect, I)]).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('transpose', () => {
    expect([...transpose(m)]).toEqual([1, 3, 2, 4]);
    const rect = matrix(Float64Array.from([1, 2, 3, 4, 5, 6]), 2);
    const transposed = transpose(rect);
    expect(transposed.cols).toBe(3);
    for (let i = 3; --i >= 0; ) {
      for (let j = rect.cols; --j >= 0; ) {
        expect(transposed[j * transposed.cols + i]).toBe(
          rect[i * rect.cols + j],
        );
      }
    }
  });
});
