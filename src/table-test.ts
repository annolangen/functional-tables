import {render, html} from 'lit-html';
import {createRef, Ref} from 'lit-html/directives/ref';
import {
  RenderTable,
  RowElementSource,
  RowElementSourceParams,
} from './table-renderer';

const div: Ref<HTMLDivElement> = createRef();

function newRangeRowElementSource(row_count: number): RowElementSource {
  return {
    row_count,
    getBlock(params: RowElementSourceParams) {
      return Array(Math.min(params.limit, row_count - params.offset))
        .fill(0)
        .map(
          (_, i) =>
            html`<tr>
              <td>Row ${params.offset + i}</td>
            </tr>`
        );
    },
  };
}

const source = newRangeRowElementSource(1000);

const renderPage = () =>
  render(
    html`<div style="width:80%;margin:auto">
      ${RenderTable(
        renderPage,
        {table: 'pure-table pure-table-bordered'},
        300,
        ['Test Header'],
        div,
        (div.value || {}).scrollTop || 0,
        35.4,
        source
      )}
    </div>`,
    document.body
  );
window.onload = renderPage;
window.onclick = renderPage;
