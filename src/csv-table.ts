import {html, HTMLTemplateResult} from 'lit';
import {RowElementSource, RowElementSourceParams} from './table-renderer';
import {columnOrder} from './util';

export interface CsvTable {
  readonly headers: string[];
  readonly row_count: number;
  slice(offset: number, limit: number): (string | number)[][];
}

const cellRegexp = /(?:(-?[0-9]+[.]?[0-9]*)|([^,"]*)|"((?:[^"]|"")*)")(?:$|,)/g;

function parseRow(line: string) {
  return [...line.matchAll(cellRegexp)].map(m =>
    m[1] ? Number(m[1]) : m[2] ? m[2] : m[3] ? m[3].replace(/""/g, '"') : ''
  );
}

export async function loadCsvTable(url: string) {
  const rows = (await (await fetch(url)).text()).split('\n');
  return {
    headers: parseRow(rows[0]).map(c => String(c)),
    row_count: rows.length,
    slice: (offset: number, limit: number) =>
      rows.slice(offset + 1, offset + 1 + limit).map(parseRow),
  };
}

export function asQuickRowElementSource(table: CsvTable): RowElementSource {
  return {
    row_count: table.row_count,
    getBlock: async (params: RowElementSourceParams) =>
      table.slice(params.offset, params.limit).map(
        r =>
          html`<tr>
            ${r.map(c => html`<td>${c}</td>`)}
          </tr>`
      ),
  };
}

interface Column {
  readonly header_name: string;
  get(i: number): string | number;
  rowIndices(offset: number, limit: number, isAscending?: boolean): number[];
}

interface ColumnBuilder {
  add(v: string | number, i: number): void;
  build(): Column;
}

function newColumnBuilder(
  header_name: string,
  row_count: number
): ColumnBuilder {
  const floats = new Float64Array(row_count);
  const strings: string[] = Array(row_count);
  var number_count = 0;
  return {
    add(v: string | number, i: number) {
      if (typeof v === 'number') {
        number_count += 1;
        floats[i] = v;
      } else if (v.length === 0) {
        number_count += 1;
        floats[i] = 0;
        strings[i] = v;
      } else {
        strings[i] = v;
      }
    },
    build() {
      if (number_count === row_count) {
        return {
          header_name,
          get: i => floats[i],
          rowIndices: index((a, b) => floats[a] - floats[b]),
        };
      }
      for (var i = row_count; --i >= 0; ) {
        if (strings[i] === undefined) strings[i] = String(floats[i]);
      }
      return {
        header_name,
        get: i => strings[i],
        rowIndices: index((a, b) => strings[a].localeCompare(strings[b])),
      };
    },
  };

  function index(compareFn: (a: number, b: number) => number) {
    const permutation = Uint32Array.from({length: row_count}, (_, i) => i);
    permutation.sort(compareFn);
    return (offset: number, limit: number, isAscending?: boolean) =>
      Array.from(
        Array(Math.min(limit, row_count - offset)),
        isAscending === false
          ? (_, i) => permutation[row_count - offset - i]
          : (_, i) => permutation[offset + i]
      );
  }
}

function getColumns({headers, row_count, slice}: CsvTable): Column[] {
  const columnBuilders: ColumnBuilder[] = headers.map(h =>
    newColumnBuilder(h, row_count)
  );
  slice(0, row_count).forEach((row, i) =>
    row.forEach((cell, j) => columnBuilders[j].add(cell, i))
  );
  return columnBuilders.map(b => b.build());
}

export function asDataFrameElementSource(table: CsvTable): RowElementSource {
  const columns = getColumns(table);
  const {row_count, headers} = table;
  return {row_count, getBlock};

  async function getBlock({
    orderColumn,
    offset,
    limit,
    isAscending,
  }: RowElementSourceParams): Promise<HTMLTemplateResult[]> {
    const indices =
      orderColumn !== undefined &&
      orderColumn >= 0 &&
      orderColumn < headers.length
        ? columns[orderColumn].rowIndices(offset, limit, isAscending)
        : Array.from(
            Array(Math.min(limit, row_count - offset)),
            (_, i) => offset + i
          );
    return indices.map(
      i => html`<tr>
        ${columns.map(c => html`<td>${c.get(i)}</td>`)}
      </tr>`
    );
  }
}
