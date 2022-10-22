import {render, html} from 'lit';
import {asRowElementSource, loadCsvTable} from '../src/csv-table';
import {
  ClassNameOptions,
  newTableRenderer,
  TableRenderer,
} from '../src/table-renderer';
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
        #test-data-table-container td:nth-child(4) {
          text-align: end;
        }
        #test-data-table-container td:nth-child(5) {
          text-align: end;
        }
        #test-data-table-container td:nth-child(6) {
          text-align: end;
        }
      </style>
      <div style="width:80%;margin:45px">
        <h2>Covid Statistics Today (US county level)</h2>
        <p></p>
        ${await tableRenderer.render()}
      </div>`,
    document.body
  );
tableRenderer = newTableRenderer(renderPage, classNames, 'test');

window.onload = async () => {
  const table = await futureTable;
  tableRenderer.setHeaders(table.headers.map(h => h.replace(/_/g, ' ')));
  tableRenderer.setRows(asRowElementSource(table));
  await renderPage(); // use estimates and Ref with undefined value
  renderPage();
};
window.onmousedown = window.onmouseup = renderPage;
