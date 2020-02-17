import defaultTheme, { ResolvedThemeInterface, resolveTheme, ThemeInterface } from '../theme';
import { querySelector } from '../utils/dom';
import { isNumeric, mergeObjects } from '../utils/helpers';

import { LabelsConfigRaw, setRedocLabels } from './Labels';
import { MDXComponentMeta } from './MarkdownRenderer';

export interface RedocRawOptions {
  theme?: ThemeInterface;
  scrollYOffset?: number | string | (() => number);
  hideHostname?: boolean | string;
  enableConsole?: boolean;
  additionalHeaders?: object;
  expandResponses?: string | 'all';
  requiredPropsFirst?: boolean | string;
  sortPropsAlphabetically?: boolean | string;
  noAutoAuth?: boolean | string;
  nativeScrollbars?: boolean | string;
  pathInMiddlePanel?: boolean | string;
  untrustedSpec?: boolean | string;
  hideLoading?: boolean | string;
  hideDownloadButton?: boolean | string;
  disableSearch?: boolean | string;
  onlyRequiredInSamples?: boolean | string;
  showExtensions?: boolean | string | string[];
  hideSingleRequestSampleTab?: boolean | string;
  menuToggle?: boolean | string;
  jsonSampleExpandLevel?: number | string | 'all';
  hideSchemaTitles?: boolean | string;
  payloadSampleIdx?: number;

  providedByName?: string;
  providedByUri?: string;
  queryParamPrefix?: string;
  queryParamSuffix?: string;

  unstable_ignoreMimeParameters?: boolean;

  allowedMdComponents?: Dict<MDXComponentMeta>;

  labels?: LabelsConfigRaw;

  enumSkipQuotes?: boolean | string;

  expandDefaultServerVariables?: boolean;
}

function argValueToBoolean(val?: string | boolean, defaultValue?: boolean): boolean {
  if (val === undefined) {
    return defaultValue || false;
  }
  if (typeof val === 'string') {
    return val === 'false' ? false : true;
  }
  return val;
}

export class RedocNormalizedOptions {
  static normalizeExpandResponses(value: RedocRawOptions['expandResponses']) {
    if (value === 'all') {
      return 'all';
    }
    if (typeof value === 'string') {
      const res = {};
      value.split(',').forEach(code => {
        res[code.trim()] = true;
      });
      return res;
    } else if (value !== undefined) {
      console.warn(
        `expandResponses must be a string but received value "${value}" of type ${typeof value}`,
      );
    }
    return {};
  }

  static normalizeHideHostname(value: RedocRawOptions['hideHostname']): boolean {
    return !!value;
  }

  static normalizeScrollYOffset(value: RedocRawOptions['scrollYOffset']): () => number {
    // just number is not valid selector and leads to crash so checking if isNumeric here
    if (typeof value === 'string' && !isNumeric(value)) {
      const el = querySelector(value);
      if (!el) {
        console.warn(
          'scrollYOffset value is a selector to non-existing element. Using offset 0 by default',
        );
      }
      const bottom = (el && el.getBoundingClientRect().bottom) || 0;
      return () => bottom;
    } else if (typeof value === 'number' || isNumeric(value)) {
      return () => (typeof value === 'number' ? value : parseFloat(value));
    } else if (typeof value === 'function') {
      return () => {
        const res = value();
        if (typeof res !== 'number') {
          console.warn(
            `scrollYOffset should return number but returned value "${res}" of type ${typeof res}`,
          );
        }
        return res;
      };
    } else if (value !== undefined) {
      console.warn(
        'Wrong value for scrollYOffset ReDoc option: should be string, number or function',
      );
    }

    return () => 0;
  }

  static normalizeShowExtensions(value: RedocRawOptions['showExtensions']): string[] | boolean {
    if (typeof value === 'undefined') {
      return false;
    }
    if (value === '') {
      return true;
    }

    if (typeof value === 'string') {
      return value.split(',').map(ext => ext.trim());
    }

    return value;
  }

  static normalizePayloadSampleIdx(value: RedocRawOptions['payloadSampleIdx']): number {
    if (typeof value === 'number') {
      return Math.max(0, value); // always greater or equal than 0
    }

    if (typeof value === 'string') {
      return isFinite(value) ? parseInt(value, 10) : 0;
    }

    return 0;
  }

  private static normalizeJsonSampleExpandLevel(level?: number | string | 'all'): number {
    if (level === 'all') {
      return +Infinity;
    }
    if (!isNaN(Number(level))) {
      return Math.ceil(Number(level));
    }
    return 2;
  }

  theme: ResolvedThemeInterface;
  scrollYOffset: () => number;
  hideHostname: boolean;
  expandResponses: { [code: string]: boolean } | 'all';
  requiredPropsFirst: boolean;
  sortPropsAlphabetically: boolean;
  noAutoAuth: boolean;
  nativeScrollbars: boolean;
  pathInMiddlePanel: boolean;
  untrustedSpec: boolean;
  hideDownloadButton: boolean;
  disableSearch: boolean;
  onlyRequiredInSamples: boolean;
  showExtensions: boolean | string[];
  hideSingleRequestSampleTab: boolean;
  menuToggle: boolean;
  jsonSampleExpandLevel: number;
  enumSkipQuotes: boolean;
  hideSchemaTitles: boolean;
  payloadSampleIdx: number;
  enableConsole: boolean;
  additionalHeaders: object;
  providedByName: string;
  providedByUri: string;
  queryParamPrefix: string;
  queryParamSuffix: string;

  /* tslint:disable-next-line */
  unstable_ignoreMimeParameters: boolean;
  allowedMdComponents: Dict<MDXComponentMeta>;

  expandDefaultServerVariables: boolean;

  constructor(raw: RedocRawOptions, defaults: RedocRawOptions = {}) {
    raw = { ...defaults, ...raw };
    const hook = raw.theme && raw.theme.extensionsHook;
    this.theme = resolveTheme(
      mergeObjects({} as any, defaultTheme, { ...raw.theme, extensionsHook: undefined }),
    );

    this.theme.extensionsHook = hook as any;

    // do not support dynamic labels changes. Labels should be configured before
    setRedocLabels(raw.labels);

    this.scrollYOffset = RedocNormalizedOptions.normalizeScrollYOffset(raw.scrollYOffset);
    this.hideHostname = RedocNormalizedOptions.normalizeHideHostname(raw.hideHostname);
    this.expandResponses = RedocNormalizedOptions.normalizeExpandResponses(raw.expandResponses);
    this.requiredPropsFirst = argValueToBoolean(raw.requiredPropsFirst);
    this.sortPropsAlphabetically = argValueToBoolean(raw.sortPropsAlphabetically);
    this.noAutoAuth = argValueToBoolean(raw.noAutoAuth);
    this.nativeScrollbars = argValueToBoolean(raw.nativeScrollbars);
    this.pathInMiddlePanel = argValueToBoolean(raw.pathInMiddlePanel);
    this.untrustedSpec = argValueToBoolean(raw.untrustedSpec);
    this.hideDownloadButton = argValueToBoolean(raw.hideDownloadButton);
    this.disableSearch = argValueToBoolean(raw.disableSearch);
    this.onlyRequiredInSamples = argValueToBoolean(raw.onlyRequiredInSamples);
    this.showExtensions = RedocNormalizedOptions.normalizeShowExtensions(raw.showExtensions);
    this.hideSingleRequestSampleTab = argValueToBoolean(raw.hideSingleRequestSampleTab);
    this.menuToggle = argValueToBoolean(raw.menuToggle, true);
    this.jsonSampleExpandLevel = RedocNormalizedOptions.normalizeJsonSampleExpandLevel(
      raw.jsonSampleExpandLevel,
    );
    this.enumSkipQuotes = argValueToBoolean(raw.enumSkipQuotes);
    this.hideSchemaTitles = argValueToBoolean(raw.hideSchemaTitles);
    this.payloadSampleIdx = RedocNormalizedOptions.normalizePayloadSampleIdx(raw.payloadSampleIdx);
    this.enableConsole = argValueToBoolean(raw.enableConsole);
    this.additionalHeaders = raw.additionalHeaders || {};
    this.providedByName = raw.providedByName || 'Documentation Powered by ReDoc';
    this.providedByUri = raw.providedByUri || 'https://github.com/Rebilly/ReDoc';
    this.queryParamPrefix = raw.queryParamPrefix || '{';
    this.queryParamSuffix = raw.queryParamSuffix || '}';

    this.unstable_ignoreMimeParameters = argValueToBoolean(raw.unstable_ignoreMimeParameters);

    this.allowedMdComponents = raw.allowedMdComponents || {};

    this.expandDefaultServerVariables = argValueToBoolean(raw.expandDefaultServerVariables);
  }
}
