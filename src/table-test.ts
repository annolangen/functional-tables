import {render, html} from 'lit-html';
import {createRef, Ref} from 'lit-html/directives/ref';
import {asRowElementSource, loadCsvTable} from './csv-table';
import {
  ClassNameOptions,
  newTableRenderer,
  RowElementSource,
  RowElementSourceParams,
  TableRenderer,
} from './table-renderer';

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

const url =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv';
const futureTable = loadCsvTable(url);
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

window.onload = async () => {
  const table = await futureTable;
  tableRenderer.setHeaders(table.headers.map((h) => h.replace(/_/g, ' ')));
  tableRenderer.setRows(asRowElementSource(table));
  await renderPage(); // use estimates and Ref with undefined value
  renderPage();
};
window.onclick = renderPage;
