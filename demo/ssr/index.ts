import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

import { createStore, Redoc } from '../../';

const yaml = require('yaml-js');
const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 9999;

const server = http.createServer(async (request, response) => {
  console.time('request ' + request.url);
  if (request.url === '/redoc.standalone.js') {
    fs.createReadStream('bundles/redoc.standalone.js', 'utf8').pipe(response);
  } else if (request.url === '/') {
    const spec = yaml.load(readFileSync(resolve(__dirname, '../openapi.yaml')));
    const store = await createStore(spec, 'path/to/spec.yaml');

    const sheet = new ServerStyleSheet();

    const html = renderToString(sheet.collectStyles(React.createElement(Redoc, { store })));
    const css = sheet.getStyleTags();

    const res = `<html>
    <head>
      <meta charset="utf8" />
      <title>ReDoc</title>
      <!-- needed for adaptive design -->
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          padding: 0;
          margin: 0;
        }
      </style>
      <script src="redoc.standalone.js"></script>
      <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
      <link href="https://cdn.fontcdn.ir/Font/Persian/Vazir/Vazir.css" rel="stylesheet">
      ${css}
    </head>
    <body>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
          const state = ${JSON.stringify(await store.toJS())};
          Redoc.hydrate(state, document.getElementById('redoc'));
        });
        </script>
      <div id="redoc">${html}</div>
    </body>
    </html>`;
    response.writeHead(200, { 'Content-Length': res.length });
    response.write(res);
    response.end();
  } else {
    response.writeHead(404);
    response.write('Not found');
    response.end();
  }

  console.timeEnd('request ' + request.url);
});

server.listen(PORT, () => console.log(`Server started: http://127.0.0.1:${PORT}`));
