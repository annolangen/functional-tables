import {supportsAdoptingStyleSheets} from 'lit';

export function debounce(f: Function, timeout = 50) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f.apply(this, args);
    }, timeout);
  };
}

interface RingItem<X, Y> {
  next: RingItem<X, Y>;
  prev: RingItem<X, Y>;
  key: X;
  value: Y;
}

export function lruMemoize<X, Y>(
    limit: number, f: (x: X) => Promise<Y>): (x: X) => Promise<Y> {
  var mru = null;
  const map = new Map<X, RingItem<X, Y>>();
  return async (x: X) => {
    const item = map.get(x);
    if (item) {
      if (mru != item) {
        item.next.prev = item.prev;
        item.prev.next = item.next;
        item.next = mru;
        item.prev = mru.prev;
        mru = item;
      }
    } else {
      const value = await f(x);
      if (map.size >= limit) {
        const lru = mru.prev;
        lru.next.prev = lru.prev;
        lru.prev.next = lru.next;
        map.delete(lru.key);
      }
      if (mru) {
        mru = {next: mru, prev: mru.prev, key: x, value};
      } else {
        mru = {key: x, value};
        mru.next = mru.prev = mru;
      }
      map.set(x, mru);
    }
    return mru.value;
  };
}

export type CompareFn<T> = (x: T, y: T) => number;

export const naturalOrder = (x: any, y: any) => (typeof x < typeof y) ?
    -1 :
    (typeof x > typeof y) ? 1 : x < y ? -1 : x > y ? 1 : 0;

export const columnOrder = (i: number) => (x: any[], y: any[]) =>
    naturalOrder(x[i], y[i]);

export function reverse<T>(f: (x: T, y: T) => number) {
  return (x: T, y: T) => -f(x, y);
}

// Reorders the elements of the given array to create some span of equal
// elements preceded by elments that are smaller and followed by elements
// that are larger. Operates only on the half open interval [b, e). See
// [Wiki](https://en.wikipedia.org/wiki/Quicksort#Repeated_elements) for more
// information. Returns span of equal elements as half-open interval [i, j).
function partition<T>(a: T[], c: CompareFn<T>, b: number, e: number): number[] {
  if (b >= e) {
    throw new RangeError(`Cannot partition empty interval b: ${b} e: ${e}`);
  }
  var i = Math.floor((b + e) / 2);
  var j = i + 1;
  while (b < i && j < e) {
    const d1 = c(a[b], a[i]);
    if (d1 < 0) {
      b += 1;
    } else if (d1 === 0) {
      swap(b, --i);
    } else {
      while (j < e) {
        const d2 = c(a[i], a[e - 1]);
        if (d2 < 0) {
          e -= 1;
        } else if (d2 === 0) {
          swap(j++, e - 1);
        } else {
          swap(b++, --e);  // d1 > 0 && d2 > 0
          break;
        }
      }
    }
  }
  while (b < i) {
    const d = c(a[b], a[i]);
    if (d < 0) {
      b += 1;
    } else if (d === 0) {
      swap(b, --i);
    } else {
      rotate(b, --i, --j);
    }
  }
  while (j < e) {
    const d = c(a[i], a[e - 1]);
    if (d < 0) {
      e -= 1;
    } else if (d === 0) {
      swap(j++, e - 1);
    } else {
      rotate(e - 1, j++, i++);
    }
  }
  return [i, j];

  function swap(p: number, q: number) {
    const t = a[p];
    a[p] = a[q];
    a[q] = t;
  }
  function rotate(p: number, q: number, u: number) {
    const t = a[p];
    a[p] = a[q];
    a[q] = a[u];
    a[u] = t;
  }
}

// Reorders the elements in the half-open interval [b,e) of array `a` so that
// [b,k) are the smallest `k` elements without further ordering guarantees. For
// a constant `k` this algorithm is expected linear in `e-b`.
export function top<T>(
    k: number, a: T[], c: CompareFn<T>, b: number, e: number) {
  if (k === 0 || e - b < k) return;
  const [i, j] = partition(a, c, b, e);
  if (k < i - b) {
    top(k, a, c, b, i);
  } else if (b + k > j) {
    top(b + k - j, a, c, j, e);
  }
}

// Classic quicksort with repeated element optimization.
export function qsort<T>(a: T[], c: CompareFn<T>, b: number, e: number) {
  if (e - b > 1) {
    const [i, j] = partition(a, c, b, e);
    qsort(a, c, b, i);
    qsort(a, c, j, e);
  }
}
