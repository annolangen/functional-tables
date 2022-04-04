# Clusterize Notes

The table header remain visible and its column widths are explicitly
sized to match the widths of the body. Body and header are distinct
HTMLTableElements.

The table rows are split into clusters, which are split into
blocks. By default, 50 rows per block, 4 blocks per cluster. The
rendered table contains one HTMLTableRowElement for each row in the
cluster. This structure helps caching TemplateResults at the block level.

- [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop)

It computes item_height, and the derived block_height and
cluster_height. Item height is offsetHeight of some (first or middle)
HTMLTableRowElement plus borderSpacing of its container, unless its
borderCollapse is 'collapse'.

## Style

- table container DIV with overflow:auto and optional class name: uk-overflow-auto (UIKit), table-container (Bulma)
- header container DIV with overflow:hidden
  - header TABLE with margin-bottom:0 and optional class names, like:
    pure-table, mdl-data-table mdl-js-data-table
    mdl-data-table--selectable mdl-shadow--2dp, table (Bulma),
    table-dark, table-striped, is-narrow, is-hoverable
    - single TR
    - TH width set programmatically
- container DIV for scrollable rows with some max-height and overflow:auto
  - body TABLE with optional class names (see examples above)
  - two kerning TRs with display:none, one with programmatic height for
    all rows above that are beyond view
  - ~200 TR
  - TD with optional class name, like: mdl-data-table\_\_cell--non-numeric
  - two kerning TRs with display:none, one with programmatic height for all rows below
