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
  limit: number,
  f: (x: X) => Promise<Y>
): (x: X) => Promise<Y> {
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
      if (map.size >= limit) {
        const lru = mru.prev;
        lru.next.prev = lru.prev;
        lru.prev.next = lru.next;
        map.delete(lru.key);
      }
      const value = await f(x);
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
