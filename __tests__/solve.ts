import { describe, expect, test } from '@jest/globals';
import { matrix } from '../src/float64matrix';
import { solve } from '../src/solve';

describe('solve', () => {
  const m = matrix(Float64Array.from([1, 2, 3, 4]), 2);
  test('solves', () => {
    const b = Float64Array.from([1, 1]);
    const x = solve(m, b);
    expect(x[0]).toBeCloseTo(-1);
    expect(x[1]).toBeCloseTo(1);
  });
});
