import type {HTMLTemplateResult} from 'lit-html';
import {html} from 'lit-html';
import {Ref, ref} from 'lit/directives/ref.js';

export interface RowElementSourceParams {
  offset: number;
  limit: number;
}

export interface RowElementSource {
  row_count: number;
  getBlock(params: RowElementSourceParams): HTMLTemplateResult[];
}

export interface ClassNameOptions {
  table_container?: string;
  table?: string;
  cell?: (content: any, header_name: string) => string | undefined;
}

const rows_per_block = 20;
const blocks_per_cluster = 4;
const cluster_size = rows_per_block * blocks_per_cluster;

function debounce(f: Function, timeout = 50) {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => f.apply(this, args));
  };
}

export function RenderTable(
  renderPage: () => void,
  classNames: ClassNameOptions,
  maxHeight: number,
  header_names: string[],
  verticalScrollDiv: Ref<HTMLDivElement>,
  scrollTop: number,
  itemHeight: number,
  rows: RowElementSource
): HTMLTemplateResult {
  const blockCountAbove = Math.max(
    0,
    Math.floor(scrollTop / itemHeight / rows_per_block) - 2
  );
  const offset = rows_per_block * blockCountAbove;
  const rowCountBelow = Math.max(0, rows.row_count - offset - cluster_size);
  const defaultWidths = (i: number) => '20px';
  const columnWidth = verticalScrollDiv.value
    ? bodyColumnWidths(
        verticalScrollDiv.value.children[0].children[0].children[2]
      )
    : defaultWidths;
  //if (verticalScrollDiv.value) verticalScrollDiv.value.scrollTop = scrollTop;
  return html`
    <div style="overflow:auto">
      <div style="overflow:hidden">
        <table style="margin-bottom:0" class="${classNames.table || ''}">
          <thead>
            <tr>
              ${header_names.map(
                (h, i) => html`<th style="width:${columnWidth(i)}">${h}</th>`
              )}
            </tr>
          </thead>
        </table>
      </div>
      <div
        style="max-height:${maxHeight}px;overflow:auto"
        @scroll=${renderPage}
        ${ref(verticalScrollDiv)}
      >
        <table class="${classNames.table || ''}">
          <tr style="height:${itemHeight * offset}px"></tr>
          <tr style="display:none"></tr>
          ${rows.getBlock({offset, limit: cluster_size})}
          <tr style="height:${itemHeight * rowCountBelow}px"></tr>
        </table>
      </div>
    </div>
  `;

  function bodyColumnWidths(row: Element) {
    return (i: number) => getComputedStyle(row.children[i]).width;
  }
}
