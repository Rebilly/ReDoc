import * as Prism from 'prismjs';
import 'prismjs/components/prism-bash.js';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-clike.js';
import 'prismjs/components/prism-coffeescript.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-csharp.js';
import 'prismjs/components/prism-go.js';
import 'prismjs/components/prism-http.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-lua.js';
import 'prismjs/components/prism-markup-templating.js'; // dep of php
import 'prismjs/components/prism-markup.js'; // xml
import 'prismjs/components/prism-objectivec.js';
import 'prismjs/components/prism-perl.js';
import 'prismjs/components/prism-php.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-q.js';
import 'prismjs/components/prism-ruby.js';
import 'prismjs/components/prism-scala.js';
import 'prismjs/components/prism-sql.js';
import 'prismjs/components/prism-swift.js';
import 'prismjs/components/prism-yaml.js';

const DEFAULT_LANG = 'clike';

Prism.languages.insertBefore(
  'javascript',
  'string',
  {
    'property string': {
      pattern: /([{,]\s*)"(?:\\.|[^\\"\r\n])*"(?=\s*:)/i,
      lookbehind: true,
    },
  } as any,
  undefined as any,
);

Prism.languages.insertBefore(
  'javascript',
  'punctuation',
  {
    property: {
      pattern: /([{,]\s*)[a-z]\w*(?=\s*:)/i,
      lookbehind: true,
    },
  },
  undefined as any,
);

/**
 * map language names to Prism.js names
 */
export function mapLang(lang: string): string {
  return (
    {
      json: 'js',
      'c++': 'cpp',
      'c#': 'csharp',
      'objective-c': 'objectivec',
      shell: 'bash',
      viml: 'vim',
    }[lang] || DEFAULT_LANG
  );
}

/**
 * Highlight source code string using Prism.js
 * @param source source code to highlight
 * @param lang highlight language
 * @return highlighted source code as **html string**
 */
export function highlight(source: string | number | boolean, lang: string = DEFAULT_LANG): string {
  lang = lang.toLowerCase();
  let grammar = Prism.languages[lang];
  if (!grammar) {
    grammar = Prism.languages[mapLang(lang)];
  }
  return Prism.highlight(source.toString(), grammar, lang);
}
