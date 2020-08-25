import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import { compact } from 'lodash';
import { resolve } from 'path';
import * as webpack from 'webpack';
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const remarkSlugs = require('remark-slug');
const rehypeHtml = require('rehype-stringify');
const exportToc = require('../src/markdown/plugins/export-toc');

const VERSION = JSON.stringify(require('../package.json').version);
const REVISION = JSON.stringify(
  require('child_process').execSync('git rev-parse --short HEAD').toString().trim(),
);

function root(filename) {
  return resolve(__dirname + '/' + filename);
}

const tsLoader = (env) => ({
  loader: 'ts-loader',
  options: {
    compilerOptions: {
      module: env.bench ? 'esnext' : 'es2015',
      declaration: false,
    },
  },
});

const babelLoader = (mode, transformJsx = false) => ({
  loader: 'babel-loader',
  options: {
    generatorOpts: {
      decoratorsBeforeExport: true,
    },
    plugins: compact([
      ['@babel/plugin-syntax-typescript', { isTSX: true }],
      ['@babel/plugin-syntax-decorators', { legacy: true }],
      '@babel/plugin-syntax-dynamic-import',
      ...(transformJsx ? ['@babel/plugin-transform-react-jsx'] : []),
      '@babel/plugin-syntax-jsx',
      [
        'babel-plugin-styled-components',
        {
          minify: true,
          displayName: mode !== 'production',
        },
      ],
    ]),
  },
});

const babelHotLoader = {
  loader: 'babel-loader',
  options: {
    plugins: ['react-hot-loader/babel'],
  },
};

export default (env: { playground?: boolean; bench?: boolean } = {}, { mode }) => ({
  entry: [
    root('../src/polyfills.ts'),
    root(
      env.playground
        ? 'playground/hmr-playground.tsx'
        : env.bench
        ? '../benchmark/index.tsx'
        : 'index.tsx',
    ),
  ],
  output: {
    filename: 'redoc-demo.bundle.js',
    path: root('dist'),
    globalObject: 'this',
  },

  devServer: {
    contentBase: __dirname,
    watchContentBase: true,
    port: 9090,
    disableHostCheck: true,
    stats: 'minimal',
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    alias:
      mode !== 'production'
        ? {
            'react-dom': '@hot-loader/react-dom',
          }
        : {},
  },

  node: {
    fs: 'empty',
  },

  performance: false,

  externals: {
    esprima: 'esprima',
    'node-fetch': 'null',
    'node-fetch-h2': 'null',
    yaml: 'null',
    'safe-json-stringify': 'null',
  },

  module: {
    rules: [
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
      { test: [/\.eot$/, /\.gif$/, /\.woff$/, /\.svg$/, /\.ttf$/], use: 'null-loader' },
      {
        test: /\.mdx?$/,
        use: [
          babelLoader(mode, true),
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: [remarkSlugs, exportToc],
              rehypePlugins: [rehypeHtml],
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: compact([
          mode !== 'production' ? babelHotLoader : undefined,
          tsLoader(env),
          babelLoader(mode),
        ]),
        exclude: [/node_modules/],
      },
      {
        test: /\.css$/,
        use: {
          loader: 'css-loader',
          options: {
            sourceMap: true,
          },
        },
      },
      {
        test: /node_modules\/(swagger2openapi|reftools|oas-resolver|oas-kit-common|oas-schema-walker)\/.*\.js$/,
        use: {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            instance: 'ts2js-transpiler-only',
            compilerOptions: {
              allowJs: true,
              declaration: false,
            },
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __REDOC_VERSION__: VERSION,
      __REDOC_REVISION__: REVISION,
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new HtmlWebpackPlugin({
      template: env.playground
        ? 'demo/playground/index.html'
        : env.bench
        ? 'benchmark/index.html'
        : 'demo/index.html',
    }),
    new ForkTsCheckerWebpackPlugin(),
    ignore(/js-yaml\/dumper\.js$/),
    ignore(/json-schema-ref-parser\/lib\/dereference\.js/),
    ignore(/^\.\/SearchWorker\.worker$/),
    new CopyWebpackPlugin({
      patterns: ['demo/openapi.yaml'],
    }),
  ],
});

function ignore(regexp) {
  return new webpack.NormalModuleReplacementPlugin(regexp, require.resolve('lodash/noop.js'));
}
