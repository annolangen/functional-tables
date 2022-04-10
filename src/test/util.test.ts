import {naturalOrder, qsort, reverse, top} from '../util';

test('Top1', () => {
  const a = [4, 3, 2, 1];
  top(1, a, naturalOrder, 0, 4);
  expect(a[0]).toBe(1);
});
test('TopReverse1', () => {
  const a = [4, 3, 2, 1];
  top(1, a, reverse(naturalOrder), 0, 4);
  expect(a[0]).toBe(4);
});
test('Top2', () => {
  const a = [4, 3, 2, 1];
  top(2, a, naturalOrder, 0, 4);
  expect(a[0]).toBe(1);
  expect(a[1]).toBe(2);
});
test('Top3', () => {
  const a = [4, 3, 2, 1];
  top(3, a, naturalOrder, 0, 4);
  expect(a[0]).toBe(1);
  expect(a[1]).toBe(2);
  expect(a[2]).toBe(3);
});
test('Top4', () => {
  const a = [4, 3, 2, 1];
  top(4, a, naturalOrder, 0, 4);
  expect(a[0]).toBe(4);
  expect(a[1]).toBe(3);
  expect(a[2]).toBe(2);
  expect(a[3]).toBe(1);
});
test('qsort', () => {
  const a = [4, 3, 2, 1];
  qsort(a, naturalOrder, 0, 4);
  expect(a[0]).toBe(1);
  expect(a[1]).toBe(2);
  expect(a[2]).toBe(3);
  expect(a[3]).toBe(4);
});
