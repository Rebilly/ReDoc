import * as DOMPurify from 'dompurify';
import * as React from 'react';

import { OptionsConsumer } from '../OptionsProvider';
import { StylingMarkdownProps } from './Markdown';
import { StyledMarkdownBlock } from './styled.elements';

const StyledMarkdownSpan = StyledMarkdownBlock.withComponent('span');

const sanitize = (untrustedSpec, html) => (untrustedSpec ? DOMPurify.sanitize(html) : html);

export function SanitizedMarkdownHTML(
  props: StylingMarkdownProps & { html: string; className?: string },
) {
  const Wrap = props.inline ? StyledMarkdownSpan : StyledMarkdownBlock;

  return (
    <OptionsConsumer>
      {options => (
        <Wrap
          {...props}
          className={'redoc-markdown ' + (props.className || '')}
          dangerouslySetInnerHTML={{
            __html: sanitize(options.untrustedSpec, props.html),
          }}
        />
      )}
    </OptionsConsumer>
  );
}
