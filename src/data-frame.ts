export enum DataFrameColumnType {
  STRING,
  NUMERIC,
  // TODO FACTOR
}

export interface DataFrameColumn {
  name: string;
  type: DataFrameColumnType;
}

export interface Sliceable {
  slice(offset: number, limit: number): (string | number)[][];
}

export interface DataFrame extends Sliceable {
  readonly size: number;
  readonly column_metadata: DataFrameColumn[];
  readonly columns: (string[] | Float64Array)[];
  orderBy(column: number, o: Order): Sliceable;
}

export function makeDataFrame(
  size: number,
  header: string[],
  data: (string | number)[][]
): DataFrame {
  const numberish = (a: any) => typeof a === 'number' || a === '';
  const toNumber = (a: any): number =>
    typeof a === 'number' ? (a as number) : a === '' ? 0 : Number.NaN;
  const toString = (a: any): String =>
    typeof a === 'string' ? a : new String(a);
  const reader = data.reduce<(typeof toNumber | typeof toString)[]>(
    (r, row) => row.map((c, i) => (numberish(c) ? r[i] : toString)),
    Array.from(data[0], _ => toNumber)
  );
  const column_metadata = reader.map(
    (r, i) =>
      ({
        name: header[i],
        type:
          r === toNumber
            ? DataFrameColumnType.NUMERIC
            : DataFrameColumnType.STRING,
      } as DataFrameColumn)
  );
  const columns = reader.map((r, i) =>
    r === toNumber
      ? Float64Array.from(data, row => r(row[i]))
      : Array.from(data, row => r(row[i]) as string)
  );
  const permutation = Array.from(data, (_, i) => i);

  return {
    size,
    column_metadata,
    columns,
    orderBy,
    slice: (offset: number, limit: number) =>
      Array.from(Array(Math.min(size - offset, limit)), (_, row) =>
        columns.map(c => c[row + offset])
      ),
  };

  function orderBy(i: number, o: Order) {
    const permutation = Array.from(Array(size), (_, i) => 1);
    const col = columns[i];
    if (col instanceof Float64Array) {
      permutation.sort(
        o === Order.ASC
          ? (a: number, b: number) => col[a] - col[b]
          : (a: number, b: number) => col[b] - col[a]
      );
    } else {
      permutation.sort(
        o === Order.ASC
          ? (a: number, b: number) => col[a].localeCompare(col[b])
          : (a: number, b: number) => col[b].localeCompare(col[a])
      );
    }
    return {
      slice: (offset: number, limit: number) =>
        Array.from(Array(Math.min(size - offset, limit)), (_, row) =>
          columns.map(col => col[permutation[row + offset]])
        ),
    };
  }
}
