# Functional Tables

HTML tables from functional programming

## HTML from functional programming

The standalone lit-html library [advertises its
potential](https://lit-element-note-dot-polymer-lit-html.appspot.com/#:~:text=lit%2Dhtml%20gives%20you%20the%20full%20power%20of%20JavaScript%20and%20functional%20programming%20patterns)
for functional programming. Now I see it mostly used with custom HTML
elements and LitElement in particular. I am not following that trend
here. Rather than having to teach custom HTML elements and JavaScript
classes and decorators, I want to push functional programming and its
approach to reusable code.

The key idea is that a page's HTML is the result of a pure function of
some programmatic state. That function and changes to that state can
be desribed and understood independently. The state is typically a
combination of parts parsed from anchor text, retrieved from servers
via cookies, or JavaScript state. For example, the current table order
specification might be session state or might just be ephemeral state,
which is lost on page refresh. The state of the DOM elements, however,
is expressly excluded so that state control and rendering can be
understood and tested separately.

Caching is enabled by the functional style and is key for its
performance. Every input event can re-render the page and we don't
mind because it is mostly cache lookups. Lit-html caches the DOM
elements as a function of the parameter values in its HTML template
literals. The parameter values can be cached in function closures. It
can also be cached in JavaScript class member data where that makes
sense.

## HTML Tables

HTML tables are a worthy challenge for a library of reusable
code. There are diverse approaches to styling, ordering, scrolling,
and integrating with server-side content.

### Table styling

Style considers the basic style for cells, body rows, header rows,
striping, borders, alignment defaults for numeric vs text
content. Also layout variations can be addressed with "responsive"
style: horizontal scroll as function of view port width and presenting
each row as stacked cells for very narrow view ports.

We support styling a table from scratch, but also provide helpers for
Purecss, Bulma, MDL, and UiKit.

### Ordering

Reordering table rows based on the values in a particular column is
commonplace. It interacts with server-side contents, and must account
for type specific order: alphabetical, numeric, and custom.

### Scrolling

[Clusterize](https://clusterize.js.org) implements a great
idea. Create DOM nodes only around the visible portion of the
table. Style the height of the first and last HTMLTableRowElement out
of view so that the browser's scroll bar reflects the size of the
large, emulated table. Details require attention: row parity for
striping, implementing search, and interaction with served content.

### Large tables

Consider presenting tabular COVID-19 data on a phone. Only a few rows
at a time can be shown and some server has the job of providing the
fragments for a smooth user experience of ordering, scrolling, and
searching. We assume the server interface supports ordering,
projection, filtering, limit, and skip. These are readily translated
to SQL.
