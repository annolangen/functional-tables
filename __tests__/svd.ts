import { describe, expect, test } from '@jest/globals';
import {
  matrix,
  transpose,
  multiply,
  Float64Matrix,
  debugString,
} from '../src/float64matrix';
import { svd } from '../src/svd';

function matrixFromNestedArray(a: number[][]) {
  const cols = a[0].length;
  return matrix(
    Float64Array.from(
      Array(a.length * cols),
      (_, i) => a[Math.floor(i / cols)][i % cols],
    ),
    cols,
  );
}

function expectIdentityMatrix(m: Float64Matrix) {
  for (let i = m.length / m.cols; --i >= 0; ) {
    for (let j = m.cols; --j >= 0; ) {
      expect(m[i * m.cols + j]).toBeCloseTo(i === j ? 1 : 0, 1e-4);
    }
  }
}

describe('SVD tests', () => {
  test('Should return an error when called with m < n', () => {
    expect(() => svd(matrix(new Float64Array(20 * 21), 21))).toThrow(
      new TypeError('Invalid matrix: m < n'),
    );
  });

  test('Should work with Golub and Reinsch first example', () => {
    const a = [
      [22, 10, 2, 3, 7],
      [14, 7, 10, 0, 8],
      [-1, 13, -1, -11, 3],
      [-3, -2, 13, -2, 4],
      [9, 8, 1, -2, 4],
      [9, 1, -7, 5, -1],
      [2, -6, 6, 5, 1],
      [4, 5, 0, -2, 2],
    ];

    const { q, u, v } = svd(matrixFromNestedArray(a));
    expect(q[0]).toBeCloseTo(Math.sqrt(1248), 1e-4);
    expect(q[1]).toBeCloseTo(0, 1e-4);
    expect(q[2]).toBeCloseTo(20, 1e-4);
    expect(q[3]).toBeCloseTo(Math.sqrt(384), 1e-4);
    expect(q[4]).toBeCloseTo(0, 1e-4);

    const ut = transpose(u);
    const utU = multiply(ut, u);
    expect(utU.cols).toEqual(5);
    expectIdentityMatrix(utU);

    const vt = transpose(v);
    const vtV = multiply(vt, v);
    expect(vtV.cols).toEqual(5);
    expectIdentityMatrix(vtV);
  });

  test('Should work with Golub and Reinsch second example', () => {
    const a: number[][] = [];
    for (let i = 0; i < 21; i++) {
      a[i] = new Array(20);
      for (let j = 0; j < 20; j++) {
        if (i > j) {
          a[i][j] = 0;
        } else if (i === j) {
          a[i][j] = 21 - i;
        } else {
          a[i][j] = -1;
        }
      }
    }

    const { u, v, q } = svd(matrixFromNestedArray(a));

    expect(q[0]).toBeCloseTo(21.45, 1e-2);
    expect(q[1]).toBeCloseTo(20.45, 1e-2);
    expect(q[2]).toBeCloseTo(19.44, 1e-2);
    expect(q[3]).toBeCloseTo(18.44, 1e-2);
    expect(q[4]).toBeCloseTo(17.44, 1e-2);
    expect(q[5]).toBeCloseTo(16.43, 1e-2);
    expect(q[6]).toBeCloseTo(15.43, 1e-2);
    expect(q[7]).toBeCloseTo(14.42, 1e-2);
    expect(q[8]).toBeCloseTo(13.42, 1e-2);
    expect(q[9]).toBeCloseTo(12.41, 1e-2);
    expect(q[10]).toBeCloseTo(11.4, 1e-2);
    expect(q[11]).toBeCloseTo(0.99, 1e-2);
    expect(q[12]).toBeCloseTo(10.39, 1e-2);
    expect(q[13]).toBeCloseTo(9.38, 1e-2);
    expect(q[14]).toBeCloseTo(3.14, 1e-2);
    expect(q[15]).toBeCloseTo(4.24, 1e-2);
    expect(q[16]).toBeCloseTo(8.37, 1e-2);
    expect(q[17]).toBeCloseTo(5.29, 1e-2);
    expect(q[18]).toBeCloseTo(7.35, 1e-2);
    expect(q[19]).toBeCloseTo(6.33, 1e-2);

    const ut = transpose(u);
    const utU = multiply(ut, u);
    expect(utU.cols).toEqual(20);
    expectIdentityMatrix(utU);

    const vt = transpose(v);
    const vtV = multiply(vt, v);
    expect(vtV.cols).toBe(20);
    expectIdentityMatrix(vtV);
  });

  test('Should work with Golub and Reinsch third example', () => {
    const a = matrix(new Float64Array(30 * 30), 30);
    for (let i = 0; i < 30; i++) {
      for (let j = 0; j < 30; j++) {
        a[i * 30 + j] = i > j ? 0 : i === j ? 1 : -1;
      }
    }

    const { u, v, q } = svd(a);
    expect(q[0]).toBeCloseTo(18.2, 1e-2);
    expect(q[1]).toBeCloseTo(6.22, 1e-2);
    expect(q[2]).toBeCloseTo(3.91, 1e-2);
    expect(q[3]).toBeCloseTo(2.97, 1e-2);
    expect(q[4]).toBeCloseTo(2.49, 1e-2);
    expect(q[5]).toBeCloseTo(0, 1e-2);
    expect(q[6]).toBeCloseTo(2.2, 1e-2);
    expect(q[7]).toBeCloseTo(2.01, 1e-2);
    expect(q[8]).toBeCloseTo(1.89, 1e-2);
    expect(q[9]).toBeCloseTo(1.8, 1e-2);
    expect(q[10]).toBeCloseTo(1.74, 1e-2);
    expect(q[11]).toBeCloseTo(1.69, 1e-2);
    expect(q[12]).toBeCloseTo(1.65, 1e-2);
    expect(q[13]).toBeCloseTo(1.62, 1e-2);
    expect(q[14]).toBeCloseTo(1.6, 1e-2);
    expect(q[15]).toBeCloseTo(1.58, 1e-2);
    expect(q[16]).toBeCloseTo(1.56, 1e-2);
    expect(q[17]).toBeCloseTo(1.55, 1e-2);
    expect(q[18]).toBeCloseTo(1.54, 1e-2);
    expect(q[19]).toBeCloseTo(1.53, 1e-2);
    expect(q[20]).toBeCloseTo(1.52, 1e-2);
    expect(q[21]).toBeCloseTo(1.52, 1e-2);
    expect(q[22]).toBeCloseTo(1.51, 1e-2);
    expect(q[23]).toBeCloseTo(1.51, 1e-2);
    expect(q[24]).toBeCloseTo(1.5, 1e-2);
    expect(q[25]).toBeCloseTo(1.5, 1e-2);
    expect(q[26]).toBeCloseTo(1.5, 1e-2);
    expect(q[27]).toBeCloseTo(1.5, 1e-2);
    expect(q[28]).toBeCloseTo(1.5, 1e-2);
    expect(q[29]).toBeCloseTo(1.5, 1e-2);

    const ut = transpose(u);
    const utU = multiply(ut, u);
    expect(utU.cols).toEqual(30);
    expectIdentityMatrix(utU);

    const vt = transpose(v);
    const vtV = multiply(vt, v);
    expect(vtV.cols).toEqual(30);
    expectIdentityMatrix(vtV);
  });
});
