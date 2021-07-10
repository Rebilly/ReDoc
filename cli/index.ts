#!/usr/bin/env node
/* tslint:disable:no-implicit-dependencies */
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

import { compile } from 'handlebars';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { dirname, join, resolve } from 'path';

import * as zlib from 'zlib';

// @ts-ignore
import { createStore, loadAndBundleSpec, Redoc } from 'redoc';

import { watch } from 'chokidar';
import {
  createReadStream,
  existsSync,
  lstatSync,
  readFileSync,
  ReadStream,
  writeFileSync,
} from 'fs';
import * as mkdirp from 'mkdirp';

import * as YargsParser from 'yargs';

interface Options {
  ssr?: boolean;
  watch?: boolean;
  cdn?: boolean;
  output?: string;
  title?: string;
  disableGoogleFont?: boolean;
  port?: number;
  templateFileName?: string;
  templateOptions?: any;
  redocOptions?: any;
}

const BUNDLES_DIR = dirname(require.resolve('redoc'));

/* tslint:disable-next-line */
YargsParser.command(
  'serve <spec>',
  'start the server',
  yargs => {
    yargs.positional('spec', {
      describe: 'path or URL to your spec',
    });

    yargs.options('title', {
      describe: 'Page Title',
      type: 'string',
    });

    yargs.option('s', {
      alias: 'ssr',
      describe: 'Enable server-side rendering',
      type: 'boolean',
    });

    yargs.option('h', {
      alias: 'host',
      type: 'string',
      default: '127.0.0.1',
    });

    yargs.option('p', {
      alias: 'port',
      type: 'number',
      default: 8080,
    });

    yargs.option('w', {
      alias: 'watch',
      type: 'boolean',
    });

    yargs.options('disable-google-font', {
      describe: 'Disable Google Font',
      type: 'boolean',
      default: false,
    });

    yargs.demandOption('spec');
    return yargs;
  },
  async argv => {
    const config: Options = {
      ssr: argv.ssr as boolean,
      title: argv.title as string,
      watch: argv.watch as boolean,
      disableGoogleFont: argv.disableGoogleFont as boolean,
      templateFileName: argv.template as string,
      templateOptions: argv.templateOptions || {},
      redocOptions: getObjectOrJSON(argv.options),
    };

    try {
      await serve(argv.host as string, argv.port as number, argv.spec as string, config);
    } catch (e) {
      handleError(e);
    }
  },
)
  .command(
    'bundle <spec>',
    'bundle spec into zero-dependency HTML-file',
    yargs => {
      yargs.positional('spec', {
        describe: 'path or URL to your spec',
      });

      yargs.option('o', {
        describe: 'Output file',
        alias: 'output',
        type: 'string',
        default: 'redoc-static.html',
      });

      yargs.options('title', {
        describe: 'Page Title',
        type: 'string',
      });

      yargs.options('disableGoogleFont', {
        describe: 'Disable Google Font',
        type: 'boolean',
        default: false,
      });

      yargs.option('cdn', {
        describe: 'Do not include ReDoc source code into html page, use link to CDN instead',
        type: 'boolean',
        default: false,
      });

      yargs.demandOption('spec');
      return yargs;
    },
    async (argv: any) => {
      const config = {
        ssr: true,
        output: argv.o as string,
        cdn: argv.cdn as boolean,
        title: argv.title as string,
        disableGoogleFont: argv.disableGoogleFont as boolean,
        templateFileName: argv.template as string,
        templateOptions: argv.templateOptions || {},
        redocOptions: getObjectOrJSON(argv.options),
      };

      try {
        await bundle(argv.spec, config);
      } catch (e) {
        handleError(e);
      }
    },
  )
  .demandCommand()
  .options('t', {
    alias: 'template',
    describe: 'Path to handlebars page template, see https://git.io/vh8fP for the example ',
    type: 'string',
  })
  .options('templateOptions', {
    describe:
      'Additional options that you want pass to template. Use dot notation, e.g. templateOptions.metaDescription',
  })
  .options('options', {
    describe: 'ReDoc options, use dot notation, e.g. options.nativeScrollbars',
  }).argv;

async function serve(host: string, port: number, pathToSpec: string, options: Options = {}) {
  let spec = await loadAndBundleSpec(isURL(pathToSpec) ? pathToSpec : resolve(pathToSpec));
  let pageHTML = await getPageHTML(spec, pathToSpec, options);
  const server = createServer((request, response) => {
    console.time('GET ' + request.url);
    if (request.url === '/redoc.standalone.js') {
      respondWithGzip(
        createReadStream(join(BUNDLES_DIR, 'redoc.standalone.js'), 'utf8'),
        request,
        response,
        {
          'Content-Type': 'application/javascript',
        },
      );
    } else if (request.url === '/') {
      respondWithGzip(pageHTML, request, response, {
        'Content-Type': 'text/html',
      });
    } else if (request.url === '/spec.json') {
      const specStr = JSON.stringify(spec, null, 2);
      respondWithGzip(specStr, request, response, {
        'Content-Type': 'application/json',
      });
    } else {
      response.writeHead(404);
      response.write('Not found');
      response.end();
    }

    console.timeEnd('GET ' + request.url);
  });

  console.log();

  server.listen(port, host, () => console.log(`Server started: http://${host}:${port}`));

  if (options.watch && existsSync(pathToSpec)) {
    const pathToSpecDirectory = resolve(dirname(pathToSpec));
    const watchOptions = {
      ignored: [/(^|[\/\\])\../, /___jb_[a-z]+___$/],
      ignoreInitial: true,
    };

    const watcher = watch(pathToSpecDirectory, watchOptions);
    const log = console.log.bind(console);

    const handlePath = async _path => {
      try {
        spec = await loadAndBundleSpec(resolve(pathToSpec));
        pageHTML = await getPageHTML(spec, pathToSpec, options);
        log('Updated successfully');
      } catch (e) {
        console.error('Error while updating: ', e.message);
      }
    };

    watcher
      .on('change', async path => {
        log(`${path} changed, updating docs`);
        handlePath(path);
      })
      .on('add', async path => {
        log(`File ${path} added, updating docs`);
        handlePath(path);
      })
      .on('addDir', path => {
        log(`↗  Directory ${path} added. Files in here will trigger reload.`);
      })
      .on('error', error => console.error(`Watcher error: ${error}`))
      .on('ready', () => log(`👀  Watching ${pathToSpecDirectory} for changes...`));
  }
}

async function bundle(pathToSpec, options: Options = {}) {
  const start = Date.now();
  const spec = await loadAndBundleSpec(isURL(pathToSpec) ? pathToSpec : resolve(pathToSpec));
  const pageHTML = await getPageHTML(spec, pathToSpec, { ...options, ssr: true });

  mkdirp.sync(dirname(options.output!));
  writeFileSync(options.output!, pageHTML);
  const sizeInKiB = Math.ceil(Buffer.byteLength(pageHTML) / 1024);
  const time = Date.now() - start;
  console.log(
    `\n🎉 bundled successfully in: ${options.output!} (${sizeInKiB} KiB) [⏱ ${time / 1000}s]`,
  );
}

async function getPageHTML(
  spec: any,
  pathToSpec: string,
  {
    ssr,
    cdn,
    title,
    disableGoogleFont,
    templateFileName,
    templateOptions,
    redocOptions = {},
  }: Options,
) {
  let html;
  let css;
  let state;
  let redocStandaloneSrc;
  if (ssr) {
    console.log('Prerendering docs');

    const specUrl = redocOptions.specUrl || (isURL(pathToSpec) ? pathToSpec : undefined);
    const store = await createStore(spec, specUrl, redocOptions);
    const sheet = new ServerStyleSheet();
    html = renderToString(sheet.collectStyles(React.createElement(Redoc, { store })));
    css = sheet.getStyleTags();
    state = await store.toJS();

    if (!cdn) {
      redocStandaloneSrc = readFileSync(join(BUNDLES_DIR, 'redoc.standalone.js'));
    }
  }

  templateFileName = templateFileName ? templateFileName : join(__dirname, './template.hbs');
  const template = compile(readFileSync(templateFileName).toString());
  return template({
    redocHTML: `
    <div id="redoc">${(ssr && html) || ''}</div>
    <script>
    ${(ssr && `const __redoc_state = ${sanitizeJSONString(JSON.stringify(state))};`) || ''}

    var container = document.getElementById('redoc');
    Redoc.${
      ssr
        ? 'hydrate(__redoc_state, container)'
        : `init("spec.json", ${JSON.stringify(redocOptions)}, container)`
    };

    </script>`,
    redocHead: ssr
      ? (cdn
          ? '<script src="https://unpkg.com/redoc@next/bundles/redoc.standalone.js"></script>'
          : `<script>${redocStandaloneSrc}</script>`) + css
      : '<script src="redoc.standalone.js"></script>',
    title: title || spec.info.title || 'ReDoc documentation',
    disableGoogleFont,
    templateOptions,
  });
}

// credits: https://stackoverflow.com/a/9238214/1749888
function respondWithGzip(
  contents: string | ReadStream,
  request: IncomingMessage,
  response: ServerResponse,
  headers = {},
) {
  let compressedStream;
  const acceptEncoding = (request.headers['accept-encoding'] as string) || '';
  if (acceptEncoding.match(/\bdeflate\b/)) {
    response.writeHead(200, { ...headers, 'content-encoding': 'deflate' });
    compressedStream = zlib.createDeflate();
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    response.writeHead(200, { ...headers, 'content-encoding': 'gzip' });
    compressedStream = zlib.createGzip();
  } else {
    response.writeHead(200, headers);
    if (typeof contents === 'string') {
      response.write(contents);
      response.end();
    } else {
      contents.pipe(response);
    }
    return;
  }

  if (typeof contents === 'string') {
    compressedStream.write(contents);
    compressedStream.pipe(response);
    compressedStream.end();
    return;
  } else {
    contents.pipe(compressedStream).pipe(response);
  }
}

function isURL(str: string): boolean {
  return /^(https?:)\/\//m.test(str);
}

function sanitizeJSONString(str: string) {
  return escapeClosingScriptTag(escapeUnicode(str));
}

// see http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
function escapeClosingScriptTag(str) {
  return str.replace(/<\/script>/g, '<\\/script>');
}

// see http://www.thespanner.co.uk/2011/07/25/the-json-specification-is-now-wrong/
function escapeUnicode(str) {
  return str.replace(/\u2028|\u2029/g, m => '\\u202' + (m === '\u2028' ? '8' : '9'));
}

function handleError(error: Error) {
  console.error(error.stack);
  process.exit(1);
}

function getObjectOrJSON(options) {
  switch (typeof options) {
    case 'object':
      return options;
    case 'string':
      try {
        if (existsSync(options) && lstatSync(options).isFile()) {
          return JSON.parse(readFileSync(options, 'utf-8'));
        } else {
          return JSON.parse(options);
        }
      } catch (e) {
        console.log(
          `Encountered error:\n\n${options}\n\nis neither a file with a valid JSON object neither a stringified JSON object.`,
        );
        handleError(e);
      }
    default:
      return {};
  }
}
