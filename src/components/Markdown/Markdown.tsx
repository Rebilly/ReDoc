import * as React from 'react';

import { MarkdownRenderer } from '../../services';
import { SanitizedMarkdownHTML } from './SanitizedMdBlock';

export interface StylingMarkdownProps {
  dense?: boolean;
  inline?: boolean;
}

export interface BaseMarkdownProps {
  sanitize?: boolean;
  source: string;
}

export type MarkdownProps = BaseMarkdownProps &
  StylingMarkdownProps & {
    source: string;
    className?: string;
  };

export class Markdown extends React.Component<MarkdownProps> {
  render() {
    const { source, inline, dense, className } = this.props;
    const renderer = new MarkdownRenderer();
    return (
      <SanitizedMarkdownHTML
        html={renderer.renderMd(source)}
        inline={inline}
        dense={dense}
        className={className}
      />
    );
  }
}
