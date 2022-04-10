import {html, HTMLTemplateResult} from 'lit-html';
import {RowElementSource, RowElementSourceParams} from './table-renderer';

export interface CsvTable {
  readonly headers: string[];
  readonly row_count: number;
  slice(offset: number, limit: number): (string | number)[][];
}

const cellRegexp = /(?:(-?[0-9]+[.]?[0-9]*)|([^,"]*)|"((?:[^"]|"")*)")(?:$|,)/g;

function parseRow(line: string) {
  return [...line.matchAll(cellRegexp)].map((m) =>
    m[1] ? Number(m[1]) : m[2] ? m[2] : m[3] ? m[3].replace(/""/g, '"') : ''
  );
}

export async function loadCsvTable(url: string) {
  const rows = (await (await fetch(url)).text()).split('\n');
  return {
    headers: parseRow(rows[0]).map((c) => String(c)),
    row_count: rows.length,
    slice: (offset: number, limit: number) =>
      rows.slice(offset + 1, offset + 1 + limit).map(parseRow),
  };
}

export function asRowElementSource(table: CsvTable): RowElementSource {
  return {
    row_count: table.row_count,
    getBlock: async (params: RowElementSourceParams) =>
      table.slice(params.offset, params.limit).map(
        (r) =>
          html`<tr>
            ${r.map((c) => html`<td>${c}</td>`)}
          </tr>`
      ),
  };
}
