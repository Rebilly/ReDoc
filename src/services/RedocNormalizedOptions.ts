import defaultTheme, { ResolvedThemeInterface, resolveTheme, ThemeInterface } from '../theme';
import { querySelector } from '../utils/dom';
import { isNumeric, mergeObjects } from '../utils/helpers';

import { LabelsConfigRaw, setRedocLabels } from './Labels';
import { MDXComponentMeta } from './MarkdownRenderer';

export interface RedocRawOptions {
  theme?: ThemeInterface;
  scrollYOffset?: number | string | (() => number);
  hideHostname?: boolean | string;
  expandResponses?: string | 'all';
  requiredPropsFirst?: boolean | string;
  sortPropsAlphabetically?: boolean | string;
  sortEnumValuesAlphabetically?: boolean | string;
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
  simpleOneOfTypeLabel?: boolean | string;
  payloadSampleIdx?: number;
  expandSingleSchemaField?: boolean | string;

  unstable_ignoreMimeParameters?: boolean;

  allowedMdComponents?: Record<string, MDXComponentMeta>;

  labels?: LabelsConfigRaw;

  enumSkipQuotes?: boolean | string;

  expandDefaultServerVariables?: boolean;
  maxDisplayedEnumValues?: number;
  ignoreNamedSchemas?: string[] | string;
  hideSchemaPattern?: boolean;
  disableDefaultSample?: boolean;
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

function argValueToNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'string') {
    return parseInt(value, 10);
  }

  if (typeof value === 'number') {
    return value;
  }
}

export class RedocNormalizedOptions {
  static normalizeExpandResponses(value: RedocRawOptions['expandResponses']) {
    if (value === 'all') {
      return 'all';
    }
    if (typeof value === 'string') {
      const res = {};
      value.split(',').forEach((code) => {
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

    if (typeof value !== 'string') {
      return value;
    }

    switch (value) {
      case 'true':
        return true;
      case 'false':
        return false;
      default:
        return value.split(',').map((ext) => ext.trim());
    }
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
  sortEnumValuesAlphabetically: boolean;
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
  simpleOneOfTypeLabel: boolean;
  payloadSampleIdx: number;
  expandSingleSchemaField: boolean;

  /* tslint:disable-next-line */
  unstable_ignoreMimeParameters: boolean;
  allowedMdComponents: Record<string, MDXComponentMeta>;

  expandDefaultServerVariables: boolean;
  maxDisplayedEnumValues?: number;

  ignoreNamedSchemas: Set<string>;
  hideSchemaPattern: boolean;
  disableDefaultSample: boolean;

  constructor(raw: RedocRawOptions, defaults: RedocRawOptions = {}) {
    raw = { ...defaults, ...raw };
    const hook = raw.theme && raw.theme.extensionsHook;

    // migrate from old theme
    if ((raw.theme as any)?.menu && !raw.theme?.sidebar) {
      console.warn('Theme setting "menu" is deprecated. Rename to "sidebar"');
      raw.theme!.sidebar = (raw.theme as any).menu;
    }

    if ((raw.theme as any)?.codeSample && !raw.theme?.codeBlock) {
      console.warn('Theme setting "codeSample" is deprecated. Rename to "codeBlock"');
      raw.theme!.codeBlock = (raw.theme as any).codeSample;
    }

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
    this.sortEnumValuesAlphabetically = argValueToBoolean(raw.sortEnumValuesAlphabetically);
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
    this.simpleOneOfTypeLabel = argValueToBoolean(raw.simpleOneOfTypeLabel);
    this.payloadSampleIdx = RedocNormalizedOptions.normalizePayloadSampleIdx(raw.payloadSampleIdx);
    this.expandSingleSchemaField = argValueToBoolean(raw.expandSingleSchemaField);

    this.unstable_ignoreMimeParameters = argValueToBoolean(raw.unstable_ignoreMimeParameters);

    this.allowedMdComponents = raw.allowedMdComponents || {};

    this.expandDefaultServerVariables = argValueToBoolean(raw.expandDefaultServerVariables);
    this.maxDisplayedEnumValues = argValueToNumber(raw.maxDisplayedEnumValues);
    const ignoreNamedSchemas = Array.isArray(raw.ignoreNamedSchemas)
      ? raw.ignoreNamedSchemas
      : raw.ignoreNamedSchemas?.split(',').map((s) => s.trim());
    this.ignoreNamedSchemas = new Set(ignoreNamedSchemas);
    this.hideSchemaPattern = argValueToBoolean(raw.hideSchemaPattern);
    this.disableDefaultSample = argValueToBoolean(raw.disableDefaultSample);
  }
}
