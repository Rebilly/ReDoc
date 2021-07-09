<div align="center">
  <img alt="ReDoc logo" src="https://raw.githubusercontent.com/Redocly/redoc/master/docs/images/redoc-logo.png" width="400px" />

  **OpenAPI/Swagger-generated API Reference Documentation**

  [![Build Status](https://travis-ci.com/Redocly/redoc.svg?branch=master)](https://travis-ci.com/Redocly/redoc) [![Coverage Status](https://coveralls.io/repos/Redocly/redoc/badge.svg?branch=master&service=github)](https://coveralls.io/github/Redocly/redoc?branch=master) [![dependencies Status](https://david-dm.org/Redocly/redoc/status.svg)](https://david-dm.org/Redocly/redoc) [![devDependencies Status](https://david-dm.org/Redocly/redoc/dev-status.svg)](https://david-dm.org/Redocly/redoc#info=devDependencies) [![npm](http://img.shields.io/npm/v/redoc.svg)](https://www.npmjs.com/package/redoc) [![License](https://img.shields.io/npm/l/redoc.svg)](https://github.com/Redocly/redoc/blob/master/LICENSE)

  [![bundle size](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js?compression=gzip&max=300000)](https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js) [![npm](https://img.shields.io/npm/dm/redoc.svg)](https://www.npmjs.com/package/redoc) [![](https://data.jsdelivr.com/v1/package/npm/redoc/badge)](https://www.jsdelivr.com/package/npm/redoc) [![Docker Build Status](https://img.shields.io/docker/build/redocly/redoc.svg)](https://hub.docker.com/r/redocly/redoc/)


</div>

**This is README for `2.0` version of ReDoc (React based). README for `1.x` version is on the branch [v1.x](https://github.com/Redocly/redoc/tree/v1.x)**


![ReDoc demo](https://raw.githubusercontent.com/Redocly/redoc/master/demo/redoc-demo.png)

## [Live demo](http://redocly.github.io/redoc/)

[<img alt="Deploy to Github" src="http://i.imgur.com/YZmaqk3.png" height="60px">](https://github.com/Rebilly/generator-openapi-repo#generator-openapi-repo--) [<img alt="ReDoc as a service" src="http://i.imgur.com/edqdCv6.png" height="60px">](https://redoc.ly) [<img alt="Customization services" src="http://i.imgur.com/c4sUF7M.png" height="60px">](https://redoc.ly/#services)

## Features
- Extremely easy deployment
- [redoc-cli](https://github.com/Redocly/redoc/blob/master/cli/README.md) with ability to bundle your docs into **zero-dependency** HTML file
- Server Side Rendering ready
- The widest OpenAPI v2.0 features support (yes, it supports even `discriminator`) <br>
![](docs/images/discriminator-demo.gif)
- OpenAPI 3.0 support
- Basic OpenAPI 3.1 support
- Neat **interactive** documentation for nested objects <br>
![](docs/images/nested-demo.gif)
- Code samples support (via vendor extension) <br>
![](docs/images/code-samples-demo.gif)
- Responsive three-panel design with menu/scrolling synchronization
- Integrate API Introduction into side menu - ReDoc takes advantage of markdown headings from OpenAPI description field. It pulls them into side menu and also supports deep linking.
- High-level grouping in side-menu via [`x-tagGroups`](docs/redoc-vendor-extensions.md#x-tagGroups) vendor extension
- Simple integration with `create-react-app` ([sample](https://github.com/APIs-guru/create-react-app-redoc))
- Branding/customizations via [`theme` option](#redoc-options-object)

## Roadmap
  - [x] ~~[OpenAPI v3.0 support](https://github.com/Redocly/redoc/issues/312)~~
  - [x] ~~performance optimizations~~
  - [x] ~~better navigation (menu improvements + search)~~
  - [x] ~~React rewrite~~
  - [x] ~~docs pre-rendering (performance and SEO)~~
  - [ ] ability to simple branding/styling

## Releases
**Important:** all the 2.x releases are deployed to npm and can be used via jsdeliver:
- particular release, e.g. `v2.0.0-alpha.15`: https://cdn.jsdelivr.net/npm/redoc@2.0.0-alpha.17/bundles/redoc.standalone.js
- `next` release: https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js

Additionally, all the 1.x releases are hosted on our GitHub Pages-based CDN **(deprecated)**:
- particular release, e.g. `v1.2.0`: https://rebilly.github.io/ReDoc/releases/v1.2.0/redoc.min.js
- `v1.x.x` release: https://rebilly.github.io/ReDoc/releases/v1.x.x/redoc.min.js
- `latest` release: https://rebilly.github.io/ReDoc/releases/latest/redoc.min.js - it will point to latest 1.x.x release since 2.x releases are not hosted on this CDN but on unpkg.

## Version Guidance
| ReDoc Release | OpenAPI Specification |
|:--------------|:----------------------|
| 2.0.0-alpha.54| 3.1, 3.0.x, 2.0       |
| 2.0.0-alpha.x | 3.0, 2.0              |
| 1.19.x        | 2.0                   |
| 1.18.x        | 2.0                   |
| 1.17.x        | 2.0                   |

## Some Real-life usages
- [Rebilly](https://api-reference.rebilly.com/)
- [Docker Engine](https://docs.docker.com/engine/api/v1.25/)
- [Zuora](https://www.zuora.com/developer/api-reference/)
- [Discourse](http://docs.discourse.org)
- [Commbox](https://www.commbox.io/api/)
- [APIs.guru](https://apis.guru/api-doc/)
- [FastAPI](https://github.com/tiangolo/fastapi)
- [BoxKnight](https://www.docs.boxknight.com/)

## Deployment

### TL;DR

```html
<!DOCTYPE html>
<html>
  <head>
    <title>ReDoc</title>
    <!-- needed for adaptive design -->
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <!--
    ReDoc doesn't change outer page styles
    -->
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='http://petstore.swagger.io/v2/swagger.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"> </script>
  </body>
</html>
```
That's all folks!

**IMPORTANT NOTE:** if you work with untrusted user spec, use `untrusted-spec` [option](#redoc-options-object) to prevent XSS security risks.

### 1. Install ReDoc (skip this step for CDN)
Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

    npm i redoc

or using [yarn](https://yarnpkg.com):

    yarn add redoc

### 2. Reference redoc script in HTML
For **CDN**:
```html
<script src="https://cdn.jsdelivr.net/npm/redoc/bundles/redoc.standalone.js"> </script>
```

For npm:
```html
<script src="node_modules/redoc/bundles/redoc.standalone.js"> </script>
```

### 3. Add `<redoc>` element to your page
```html
<redoc spec-url="url/to/your/spec"></redoc>
```

### 4. Enjoy :smile:


## Usage as a React component

Install peer dependencies required by ReDoc if you don't have them installed already:

    npm i react react-dom mobx styled-components core-js

Import `RedocStandalone` component from 'redoc' module:

```js
import { RedocStandalone } from 'redoc';
```

and use it somewhere in your component:

```js
<RedocStandalone specUrl="url/to/your/spec"/>
```

or

```js
<RedocStandalone spec={/* spec as an object */}/>
```

Also you can pass options:

```js
<RedocStandalone
  specUrl="https://api.redoc.ly/registry/rebilly/core-api/core/bundle/master/openapi.yaml"
  options={{
    nativeScrollbars: true,
    theme: { colors: { primary: { main: '#dd5522' } } },
  }}
/>
```

Here are detailed [options docs](#redoc-options-object).

You can also specify `onLoaded` callback which will be called each time Redoc has been fully rendered or when error occurs (with an error as the first argument). *NOTE*: It may be called multiply times if you change component properties

```js
<RedocStandalone
  specUrl="https://api.redoc.ly/registry/rebilly/core-api/core/bundle/master/openapi.yaml"
  onLoaded={error => {
    if (!error) {
      console.log('Yay!');
    }
  }}
/>
```

[**IE11 Support Notes**](docs/usage-with-ie11.md)

## The Docker way

ReDoc is available as pre-built Docker image in official [Docker Hub repository](https://hub.docker.com/r/redocly/redoc/). You may simply pull & run it:

    docker pull redocly/redoc
    docker run -p 8080:80 redocly/redoc

Also you may rewrite some predefined environment variables defined in [Dockerfile](./config/docker/Dockerfile). By default ReDoc starts with demo Petstore spec located at `http://petstore.swagger.io/v2/swagger.json`, but you may change this URL using environment variable `SPEC_URL`:

    docker run -p 8080:80 -e SPEC_URL=https://api.example.com/openapi.json redocly/redoc

## ReDoc CLI

[See here](https://github.com/Redocly/redoc/blob/master/cli/README.md)

## Configuration

### Security Definition location
You can inject Security Definitions widget into any place of your specification `description`. Check out details [here](docs/security-definitions-injection.md).

### Swagger vendor extensions
ReDoc makes use of the following [vendor extensions](https://swagger.io/specification/#specificationExtensions):
* [`x-logo`](docs/redoc-vendor-extensions.md#x-logo) - is used to specify API logo
* [`x-traitTag`](docs/redoc-vendor-extensions.md#x-traitTag) - useful for handling out common things like Pagination, Rate-Limits, etc
* [`x-codeSamples`](docs/redoc-vendor-extensions.md#x-codeSamples) - specify operation code samples
* [`x-examples`](docs/redoc-vendor-extensions.md#x-examples) - specify JSON example for requests
* [`x-nullable`](docs/redoc-vendor-extensions.md#x-nullable) - mark schema param as a nullable
* [`x-displayName`](docs/redoc-vendor-extensions.md#x-displayname) - specify human-friendly names for the menu categories
* [`x-tagGroups`](docs/redoc-vendor-extensions.md#x-tagGroups) - group tags by categories in the side menu
* [`x-servers`](docs/redoc-vendor-extensions.md#x-servers) - ability to specify different servers for API (backported from OpenAPI 3.0)
* [`x-ignoredHeaderParameters`](docs/redoc-vendor-extensions.md#x-ignoredHeaderParameters) - ability to specify header parameter names to ignore
* [`x-additionalPropertiesName`](docs/redoc-vendor-extensions.md#x-additionalPropertiesName) - ability to supply a descriptive name for the additional property keys
* [`x-summary`](docs/redoc-vendor-extensions.md#x-summary) - For Response object, use as the response button text, with description rendered under the button
* [`x-extendedDiscriminator`](docs/redoc-vendor-extensions.md#x-extendedDiscriminator) - In Schemas, uses this to solve name-clash issues with the standard discriminator
* [`x-explicitMappingOnly`](docs/redoc-vendor-extensions.md#x-explicitMappingOnly) - In Schemas, display a more descriptive property name in objects with additionalProperties when viewing the property list with an object

### `<redoc>` options object
You can use all of the following options with standalone version on <redoc> tag by kebab-casing them, e.g. `scrollYOffset` becomes `scroll-y-offset` and `expandResponses` becomes `expand-responses`.

* `disableSearch` - disable search indexing and search box.
* `expandDefaultServerVariables` - enable expanding default server variables, default `false`.
* `expandResponses` - specify which responses to expand by default by response codes. Values should be passed as comma-separated list without spaces e.g. `expandResponses="200,201"`. Special value `"all"` expands all responses by default. Be careful: this option can slow-down documentation rendering time.
* `maxDisplayedEnumValues` - display only specified number of enum values. hide rest values under spoiler.
* `hideDownloadButton` - do not show "Download" spec button. **THIS DOESN'T MAKE YOUR SPEC PRIVATE**, it just hides the button.
* `hideHostname` - if set, the protocol and hostname is not shown in the operation definition.
* `hideLoading` - do not show loading animation. Useful for small docs.
* `hideSchemaPattern` - if set, the pattern is not shown in the schema.
* `hideSingleRequestSampleTab` - do not show the request sample tab for requests with only one sample.
* `expandSingleSchemaField` - automatically expand single field in a schema
* `jsonSampleExpandLevel` - set the default expand level for JSON payload samples (responses and request body). Special value `"all"` expands all levels. The default value is `2`.
* `hideSchemaTitles` - do not display schema `title` next to to the type
* `simpleOneOfTypeLabel` - show only unique oneOf types in the label without titles
* `lazyRendering` - _Not implemented yet_ ~~if set, enables lazy rendering mode in ReDoc. This mode is useful for APIs with big number of operations (e.g. > 50). In this mode ReDoc shows initial screen ASAP and then renders the rest operations asynchronously while showing progress bar on the top. Check out the [demo](\\redocly.github.io/redoc) for the example.~~
* `menuToggle` - if true clicking second time on expanded menu item will collapse it, default `true`.
* `nativeScrollbars` - use native scrollbar for sidemenu instead of perfect-scroll (scrolling performance optimization for big specs).
* `noAutoAuth` - do not inject Authentication section automatically.
* `onlyRequiredInSamples` - shows only required fields in request samples.
* `pathInMiddlePanel` - show path link and HTTP verb in the middle panel instead of the right one.
* `requiredPropsFirst` - show required properties first ordered in the same order as in `required` array.
* `scrollYOffset` - If set, specifies a vertical scroll-offset. This is often useful when there are fixed positioned elements at the top of the page, such as navbars, headers etc;
`scrollYOffset` can be specified in various ways:
  * **number**: A fixed number of pixels to be used as offset.
  * **selector**: selector of the element to be used for specifying the offset. The distance from the top of the page to the element's bottom will be used as offset.
  * **function**: A getter function. Must return a number representing the offset (in pixels).
* `showExtensions` - show vendor extensions ("x-" fields). Extensions used by ReDoc are ignored. Can be boolean or an array of `string` with names of extensions to display.
* `sortPropsAlphabetically` - sort properties alphabetically.
* `payloadSampleIdx` - if set, payload sample will be inserted at this index or last. Indexes start from 0.
* `theme` - ReDoc theme. For details check [theme docs](#redoc-theme-object).
* `untrustedSpec` - if set, the spec is considered untrusted and all HTML/markdown is sanitized to prevent XSS. **Disabled by default** for performance reasons. **Enable this option if you work with untrusted user data!**

### `<redoc>` theme object
* `spacing`
  * `unit`: 5 # main spacing unit used in autocomputed theme values later
  * `sectionHorizontal`: 40 # Horizontal section padding. COMPUTED: spacing.unit * 8
  * `sectionVertical`: 40 # Horizontal section padding. COMPUTED: spacing.unit * 8
* `breakpoints` # breakpoints for switching three/two and mobile view layouts
  * `small`: '50rem'
  * `medium`: '85rem'
  * `large`: '105rem'
* `colors`
  * `tonalOffset`: 0.3 # default tonal offset used in computations
* `typography`
  * `fontSize`: '14px'
  * `lineHeight`: '1.5em'
  * `fontWeightRegular`: '400'
  * `fontWeightBold`: '600'
  * `fontWeightLight`: '300'
  * `fontFamily`: 'Roboto, sans-serif'
  * `smoothing`: 'antialiased'
  * `optimizeSpeed`: true
  * `headings`
    * `fontFamily`: 'Montserrat, sans-serif'
    * `fontWeight`: '400'
    * `lineHeight`: '1.6em'
  * `code` # inline code styling
    * `fontSize`: '13px'
    * `fontFamily`: 'Courier, monospace'
    * `lineHeight`: # COMPUTED: typography.lineHeight
    * `fontWeight`: # COMPUTED: typography.fontWeightRegular
    * `color`: '#e53935'
    * `backgroundColor`: 'rgba(38, 50, 56, 0.05)'
    * `wrap`: false # whether to break word for inline blocks (otherwise they can overflow)
  * `links`
    * `color`: # COMPUTED: colors.primary.main
    * `visited`: # COMPUTED: typography.links.color
    * `hover`: # COMPUTED: lighten(0.2 typography.links.color)
* `menu`
  * `width`: '260px'
  * `backgroundColor`: '#fafafa'
  * `textColor`: '#333333'
  * `activeTextColor`: # COMPUTED: theme.menu.textColor (if set by user) or theme.colors.primary.main
  * `groupItems` # Group headings
    * `textTransform`: 'uppercase'
  * `level1Items` # Level 1 items like tags or section 1st level items
    * `textTransform`: 'none'
  * `arrow` # menu arrow
    * `size`: '1.5em'
    * `color`: # COMPUTED: theme.menu.textColor
* `logo`
  * `maxHeight`: # COMPUTED: menu.width
  * `maxWidth`: # COMPUTED: menu.width
  * `gutter`: '2px' # logo image padding
* `rightPanel`
  * `backgroundColor`: '#263238'
  * `width`: '40%'
  * `textColor`: '#ffffff'

## Advanced usage of standalone version
Instead of adding `spec-url` attribute to the `<redoc>` element you can initialize ReDoc via globally exposed `Redoc` object:
```js
Redoc.init(specOrSpecUrl, options, element, callback?)
```

- `specOrSpecUrl` is either JSON object with specification or an URL to the spec in `JSON` or `YAML` format
- `options` [options object](#redoc-options-object)
- `element` DOM element to put ReDoc into
- `callback` (optional) - callback to be called after Redoc has been fully rendered. It is also called on errors with error as the first argument

```js
Redoc.init('http://petstore.swagger.io/v2/swagger.json', {
  scrollYOffset: 50
}, document.getElementById('redoc-container'))
```

-----------
## Development
see [CONTRIBUTING.md](.github/CONTRIBUTING.md)
