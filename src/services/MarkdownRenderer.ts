import * as marked from 'marked';

import { highlight, safeSlugify, unescapeHTMLChars } from '../utils';
import { AppStore } from './AppStore';
import { RedocNormalizedOptions } from './RedocNormalizedOptions';

const renderer = new marked.Renderer();

marked.setOptions({
  renderer,
  highlight: (str, lang) => {
    return highlight(str, lang);
  },
});

export const LEGACY_REGEXP = '^ {0,3}<!-- ReDoc-Inject:\\s+?<({component}).*?/?>\\s+?-->\\s*$';

// prettier-ignore
export const MDX_COMPONENT_REGEXP = '(?:^ {0,3}<({component})([\\s\\S]*?)>([\\s\\S]*?)</\\2>' // with children
  + '|^ {0,3}<({component})([\\s\\S]*?)(?:/>|\\n{2,}))'; // self-closing

export const COMPONENT_REGEXP = '(?:' + LEGACY_REGEXP + '|' + MDX_COMPONENT_REGEXP + ')';

export interface MDXComponentMeta {
  component: React.ComponentType;
  propsSelector: (store?: AppStore) => any;
  props?: object;
}

export interface MarkdownHeading {
  id: string;
  name: string;
  level: number;
  items?: MarkdownHeading[];
  description?: string;
}

export function buildComponentComment(name: string) {
  return `<!-- ReDoc-Inject: <${name}> -->`;
}

export class MarkdownRenderer {
  static containsComponent(rawText: string, componentName: string) {
    const compRegexp = new RegExp(COMPONENT_REGEXP.replace(/{component}/g, componentName), 'gmi');
    return compRegexp.test(rawText);
  }

  static getTextBeforeHading(md: string, heading: string): string {
    const headingLinePos = md.search(new RegExp(`^##?\\s+${heading}`, 'm'));
    if (headingLinePos > -1) {
      return md.substring(0, headingLinePos);
    }
    return md;
  }

  headings: MarkdownHeading[] = [];
  currentTopHeading: MarkdownHeading;

  private headingEnhanceRenderer: marked.Renderer;
  private originalHeadingRule: typeof marked.Renderer.prototype.heading;

  constructor(public options?: RedocNormalizedOptions) {
    this.headingEnhanceRenderer = new marked.Renderer();
    this.originalHeadingRule = this.headingEnhanceRenderer.heading.bind(
      this.headingEnhanceRenderer,
    );
    this.headingEnhanceRenderer.heading = this.headingRule;
  }

  saveHeading(
    name: string,
    level: number,
    container: MarkdownHeading[] = this.headings,
    parentId?: string,
  ): MarkdownHeading {
    name = unescapeHTMLChars(name);
    const item = {
      id: parentId ? `${parentId}/${safeSlugify(name)}` : `section/${safeSlugify(name)}`,
      name,
      level,
      items: [],
    };
    container.push(item);
    return item;
  }

  flattenHeadings(container?: MarkdownHeading[]): MarkdownHeading[] {
    if (container === undefined) {
      return [];
    }
    const res: MarkdownHeading[] = [];
    for (const heading of container) {
      res.push(heading);
      res.push(...this.flattenHeadings(heading.items));
    }
    return res;
  }

  attachHeadingsDescriptions(rawText: string) {
    const buildRegexp = (heading: MarkdownHeading) => {
      return new RegExp(`##?\\s+${heading.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
    };

    const flatHeadings = this.flattenHeadings(this.headings);
    if (flatHeadings.length < 1) {
      return;
    }
    let prevHeading = flatHeadings[0];
    let prevRegexp = buildRegexp(prevHeading);
    let prevPos = rawText.search(prevRegexp);
    for (let i = 1; i < flatHeadings.length; i++) {
      const heading = flatHeadings[i];
      const regexp = buildRegexp(heading);
      const currentPos = rawText.substr(prevPos + 1).search(regexp) + prevPos + 1;
      prevHeading.description = rawText
        .substring(prevPos, currentPos)
        .replace(prevRegexp, '')
        .trim();

      prevHeading = heading;
      prevRegexp = regexp;
      prevPos = currentPos;
    }
    prevHeading.description = rawText.substring(prevPos).replace(prevRegexp, '').trim();
  }

  headingRule = (
    text: string,
    level: 1 | 2 | 3 | 4 | 5 | 6,
    raw: string,
    slugger: marked.Slugger,
  ) => {
    if (level === 1) {
      this.currentTopHeading = this.saveHeading(text, level);
    } else if (level === 2) {
      this.saveHeading(
        text,
        level,
        this.currentTopHeading && this.currentTopHeading.items,
        this.currentTopHeading && this.currentTopHeading.id,
      );
    }
    return this.originalHeadingRule(text, level, raw, slugger);
  };

  renderMd(rawText: string, extractHeadings: boolean = false): string {
    const opts = extractHeadings ? { renderer: this.headingEnhanceRenderer } : undefined;

    const res = marked(rawText.toString(), opts);

    return res;
  }

  extractHeadings(rawText: string): MarkdownHeading[] {
    this.renderMd(rawText, true);
    this.attachHeadingsDescriptions(rawText);
    const res = this.headings;
    this.headings = [];
    return res;
  }

  // regexp-based 👎: remark is slow and too big so for now using marked + regexps soup
  renderMdWithComponents(rawText: string): Array<string | MDXComponentMeta> {
    const components = this.options && this.options.allowedMdComponents;
    if (!components || Object.keys(components).length === 0) {
      return [this.renderMd(rawText)];
    }

    const names = Object.keys(components).join('|');
    const componentsRegexp = new RegExp(COMPONENT_REGEXP.replace(/{component}/g, names), 'mig');

    const htmlParts: string[] = [];
    const componentDefs: MDXComponentMeta[] = [];

    let match = componentsRegexp.exec(rawText);
    let lasxtIdx = 0;
    while (match) {
      htmlParts.push(rawText.substring(lasxtIdx, match.index));
      lasxtIdx = componentsRegexp.lastIndex;
      const compName = match[1] || match[2] || match[5];
      const componentMeta = components[compName];

      const props = match[3] || match[6];
      const children = match[4];

      if (componentMeta) {
        componentDefs.push({
          component: componentMeta.component,
          propsSelector: componentMeta.propsSelector,
          props: { ...parseProps(props), ...componentMeta.props, children },
        });
      }
      match = componentsRegexp.exec(rawText);
    }
    htmlParts.push(rawText.substring(lasxtIdx));

    const res: any[] = [];
    for (let i = 0; i < htmlParts.length; i++) {
      const htmlPart = htmlParts[i];
      if (htmlPart) {
        res.push(this.renderMd(htmlPart));
      }
      if (componentDefs[i]) {
        res.push(componentDefs[i]);
      }
    }
    return res;
  }
}

function parseProps(props: string): object {
  if (!props) {
    return {};
  }

  const regex = /([\w-]+)\s*=\s*(?:{([^}]+?)}|"([^"]+?)")/gim;
  const parsed = {};
  let match;
  // tslint:disable-next-line
  while ((match = regex.exec(props)) !== null) {
    if (match[3]) {
      // string prop match (in double quotes)
      parsed[match[1]] = match[3];
    } else if (match[2]) {
      // jsx prop match (in curly braces)
      let val;
      try {
        val = JSON.parse(match[2]);
      } catch (e) {
        /* noop */
      }
      parsed[match[1]] = val;
    }
  }

  return parsed;
}
