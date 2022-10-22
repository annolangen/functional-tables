import type {HTMLTemplateResult} from 'lit';
import {html} from 'lit';
import {createRef, Ref, ref} from 'lit/directives/ref';
import {debounce, lruMemoize} from './util';

export interface RowElementSourceParams {
  offset: number;
  limit: number;
}

export interface RowElementSource {
  readonly row_count: number;
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

const rows_per_block = 32;
const blocks_per_cluster = 4;
const cluster_size = rows_per_block * blocks_per_cluster;

var next_default_id = 0;

export function newTableRenderer(
  onChange: () => void,
  classNames: ClassNameOptions,
  idPrefix?: string
): TableRenderer {
  idPrefix = idPrefix || 'generated-id-' + ++next_default_id;
  const scrollDivRef: Ref<HTMLDivElement> = createRef();
  const debouncedOnChange = debounce(onChange);
  var rows: RowElementSource;
  var fetchBlock: (offset: number) => Promise<HTMLTemplateResult[]>;
  var headerNames: string[];
  return {
    render: () => renderTableForScrollDiv(scrollDivRef.value),
    setScrollPercent(percent: number) {
      (d => {
        if (d) {
          d.scrollTop =
            ((d.children[0] as HTMLElement).offsetHeight * percent) / 100;
        }
      })(scrollDivRef.value);
    },
    setHeaders(newNames: string[]) {
      headerNames = newNames;
    },
    setRows(newRows: RowElementSource) {
      rows = newRows;
      fetchBlock = lruMemoize(blocks_per_cluster, offset =>
        rows.getBlock({offset, limit: rows_per_block})
      );
    },
  };

  async function renderTableForScrollDiv(scrollDiv?: HTMLDivElement) {
    if (!rows || !headerNames) return html``;
    return scrollDiv
      ? renderTableForScrollAndDataRow(
          scrollDiv.scrollTop,
          scrollDiv.scrollLeft,
          scrollDiv.children[0].children[0].children[2] as HTMLTableRowElement
        )
      : renderTableForScrollAndDataRow(0, undefined);

    async function renderTableForScrollAndDataRow(
      scrollTop: number,
      scrollLeft: number,
      dataRow?: HTMLTableRowElement
    ) {
      const rowHeight = dataRow ? dataRow.offsetHeight : 20;
      const blockCountAbove = Math.max(
        0,
        Math.floor(scrollTop / rowHeight / rows_per_block) -
          blocks_per_cluster / 2
      );
      const offset = blockCountAbove * rows_per_block;
      const rowCountBelow = Math.max(0, rows.row_count - offset - cluster_size);
      const columnWidth = scrollDiv
        ? collapsedColumnWidths(scrollDiv.children[0].children[0].children[0])
        : (i: number) => '20px';
      const rowTemplateResults: HTMLTemplateResult[][] = await Promise.all(
        [...Array(blocks_per_cluster).keys()].map(i =>
          fetchBlock(offset + i * rows_per_block)
        )
      );
      if (scrollDiv) {
        setTimeout(() => {
          scrollDiv.scrollTop = scrollTop;
        }, 0);
      }
      return html`
        <style>
          .data-table-container {
            max-height: 200px;
          }
        </style>
        <div style="overflow:hidden">
          <table
            style="margin-bottom:0;margin-left:-${scrollLeft}px;width:${scrollDiv
              ? getComputedStyle(scrollDiv.children[0].children[0].children[0])
                  .width
              : 'fit-content'}"
            class="${classNames.table || ''}"
          >
            <thead>
              <tr>
                ${headerNames.map(
                  (h, i) => html`<th style="width:${columnWidth(i)}">${h}</th>`
                )}
              </tr>
            </thead>
          </table>
          <div
            id="${idPrefix}-data-table-container"
            class="data-table-container"
            style="overflow:auto"
            @scroll=${debouncedOnChange}
            ${ref(scrollDivRef)}
          >
            <table class="${classNames.table || ''}">
              <tr style="visibility:collapse">
                ${headerNames.map((h, i) => html`<th>${h}</th>`)}
              </tr>
              <tr style="height:${rowHeight * offset}px"></tr>
              ${rowTemplateResults}
              <tr style="height:${rowHeight * rowCountBelow}px"></tr>
            </table>
          </div>
        </div>
      `;

      function collapsedColumnWidths(row: Element) {
        return (i: number) => getComputedStyle(row.children[i]).width;
      }
    }
  }
}
