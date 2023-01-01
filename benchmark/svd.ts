import { add, complete, configure, cycle, save, suite } from 'benny';
import { matrix } from '../src/float64matrix';
import { SVD, svd } from '../src/svd';

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

function svdFloat64Array() {
  svd(TA);
}
function svdNestedArray() {
  SVD(NA);
}

suite(
  'SVD',
  add('svd with Float64Array', svdFloat64Array),
  add('svd with nested array', svdNestedArray),
  cycle(),
  complete(),
  configure({
    cases: {
      minSamples: 100,
    },
  }),
  save({ file: 'svd' }),
  save({ file: 'svd', format: 'chart.html' }),
);
