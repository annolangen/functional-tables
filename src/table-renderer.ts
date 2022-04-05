import type {HTMLTemplateResult} from 'lit-html';
import {html} from 'lit-html';
import {createRef, Ref, ref} from 'lit/directives/ref.js';

export interface RowElementSourceParams {
  offset: number;
  limit: number;
}

export interface RowElementSource {
  row_count: number;
  getBlock(params: RowElementSourceParams): Promise<HTMLTemplateResult[]>;
}

export interface ClassNameOptions {
  table_container?: string;
  table?: string;
  cell?: (content: any, header_name: string) => string | undefined;
}

export interface TableRenderer {
  render(): Promise<HTMLTemplateResult>;
  setScrollPercent(percent: number): void;
  setHeaders(header_names: string[]): void;
  setRows(rows: RowElementSource): void;
}

export function newTableRenderer(
  onChange: () => void,
  classNames: ClassNameOptions,
  maxHeight: number = 200
): TableRenderer {
  const verticalScrollDiv: Ref<HTMLDivElement> = createRef();
  const debouncedOnChange = debounce(onChange);
  const renderTableForScrollAndHeight = async (
    scrollTop: number,
    itemHeight: number
  ) =>
    RenderTable(
      debouncedOnChange,
      classNames,
      maxHeight,
      headerNames,
      verticalScrollDiv,
      scrollTop,
      itemHeight,
      rows
    );
  var rows: RowElementSource;
  var headerNames: string[];
  return {
    render: () => renderTableForDiv(verticalScrollDiv.value),
    setScrollPercent(percent: number) {
      /*TODO*/
    },
    setHeaders(newNames: string[]) {
      headerNames = newNames;
    },
    setRows(newRows: RowElementSource) {
      rows = newRows;
    },
  };

  async function renderTableForDiv(div?: HTMLDivElement) {
    if (!rows || !headerNames) return html``;
    return div
      ? renderTableForScrollAndHeight(
          div.scrollTop,
          (div.children[0] as HTMLElement).offsetHeight / rows.row_count
        )
      : renderTableForScrollAndHeight(0, 20);
  }
}

function debounce(f: Function, timeout = 50) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f.apply(this, args);
    }, timeout);
  };
}

const rows_per_block = 20;
const blocks_per_cluster = 4;
const cluster_size = rows_per_block * blocks_per_cluster;

export async function RenderTable(
  renderPage: () => void,
  classNames: ClassNameOptions,
  maxHeight: number,
  header_names: string[],
  verticalScrollDiv: Ref<HTMLDivElement>,
  scrollTop: number,
  itemHeight: number,
  rows: RowElementSource
): Promise<HTMLTemplateResult> {
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
  if (verticalScrollDiv.value) {
    setTimeout(() => {
      verticalScrollDiv.value.scrollTop = scrollTop;
    }, 0);
  }
  const childHeight = ((e) =>
    (e && (e.children[0] as HTMLElement).offsetHeight) || 0)(
    verticalScrollDiv.value
  );
  console.log(
    'scroll %: ' +
      ((e) => (e && (e.scrollTop / childHeight).toFixed(2)) || 0)(
        verticalScrollDiv.value
      ) +
      ' scrollTop: ' +
      ((verticalScrollDiv.value || {}).scrollTop || 0) +
      ' height: ' +
      ((verticalScrollDiv.value || {}).offsetHeight || 0) +
      ' child height: ' +
      childHeight
  );
  return html`
    <div style="overflow:auto">
      <div style="overflow:hidden">
        <table style="margin-bottom:0" class="${classNames.table || ''}">
          <thead>
            <tr>
              ${header_names.map(
                (h, i) =>
                  html`<th style="width:${columnWidth(i)};white-space:normal">
                    ${h}
                  </th>`
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
          ${await rows.getBlock({offset, limit: cluster_size})}
          <tr style="height:${itemHeight * rowCountBelow}px"></tr>
        </table>
      </div>
    </div>
  `;

  function bodyColumnWidths(row: Element) {
    return (i: number) => getComputedStyle(row.children[i]).width;
  }
}
