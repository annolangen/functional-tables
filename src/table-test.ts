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

function debounce(f: Function, timeout = 50) {
  let timer: number;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      f.apply(this, args);
    }, timeout);
  };
}

const source = newRangeRowElementSource(10000);

var debouncedRenderPage: () => void;

const renderPage = () =>
  render(
    html`<div style="width:80%;margin:auto">
      ${RenderTable(
        debouncedRenderPage,
        {table: 'pure-table pure-table-bordered pure-table-striped'},
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
debouncedRenderPage = debounce(renderPage);
window.onload = () => {
  renderPage(); // use estimates and Ref with undefined value
  renderPage();
};
window.onclick = renderPage;
