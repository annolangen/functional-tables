import { SVD, svd } from '../src/svd';
import { matrix } from '../src/float64matrix';

function mulberry32(a: number = 0) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const png1 = mulberry32();
const TA = matrix(Float64Array.from(Array(8000), png1), 8);
const png2 = mulberry32();
const NA = Array.from(Array(1000), (_) => Array.from(Array(8), png2));

describe('Benchmark', () => {
  test('mulberry32', () => {
    const png = mulberry32(0);
    expect(png()).toBeCloseTo(0.26642920868471265);
    expect(png()).toBeCloseTo(0.0003297457005828619);
    expect(png()).toBeCloseTo(0.2232720274478197);
  });
  test('Float64MAtrix', () => {
    const { u, q, v } = svd(TA);
    expect(u.cols).toBe(8);
    expect(u.length).toBe(8000);
    expect(q.length).toBe(8);
    expect(v.cols).toBe(8);
    expect(v.length).toBe(64);
  });
  test('nested array', () => {
    expect(NA.length).toBe(1000);
    expect(NA[0].length).toBe(8);
    const { u, q, v } = SVD(NA);
    expect(u.length).toBe(1000);
    expect(q.length).toBe(8);
    expect(v.length).toBe(8);
  });
});
