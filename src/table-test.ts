import {render, html} from 'lit-html';
import {asRowElementSource, loadCsvTable} from './csv-table';
import {
  ClassNameOptions,
  newTableRenderer,
  TableRenderer,
} from './table-renderer';
declare const classNames: ClassNameOptions; // from html

const url =
  'https://raw.githubusercontent.com/nytimes/covid-19-data/master/live/us-counties.csv';
const futureTable = loadCsvTable(url);

var tableRenderer: TableRenderer;
const renderPage = async () =>
  render(
    html`<style>
        #test-data-table-container {
          max-height: 300px;
        }
      </style>
      <div style="width:80%;margin:45px">
      <h2>Covid Statistics Today (US count level)</h2><p></p>
      ${await tableRenderer.render()}</div>`,
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
