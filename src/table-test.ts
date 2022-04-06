import {render, html} from 'lit-html';
import {createRef, Ref} from 'lit-html/directives/ref';
import {
  ClassNameOptions,
  newTableRenderer,
  RowElementSource,
  RowElementSourceParams,
  TableRenderer,
} from './table-renderer';

const div: Ref<HTMLDivElement> = createRef();

function newRangeRowElementSource(row_count: number): RowElementSource {
  return {
    row_count,
    async getBlock(params: RowElementSourceParams) {
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

const classNames: ClassNameOptions = {
  table: 'mdl-data-table mdl-js-data-table mdl-shadow--2dp',
};
var tableRenderer: TableRenderer;
const renderPage = async () =>
  render(
    html`<style>
        #test-data-table-container {
          max-height: 300px;
        }
      </style>
      <div style="width:80%;margin:auto">${await tableRenderer.render()}</div>`,
    document.body
  );
tableRenderer = newTableRenderer(renderPage, classNames, 'test');
tableRenderer.setRows(newRangeRowElementSource(10000));
tableRenderer.setHeaders(['Test Header']);

window.onload = async () => {
  await renderPage(); // use estimates and Ref with undefined value
  renderPage();
};
window.onclick = renderPage;
