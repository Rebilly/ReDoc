import * as React from 'react';

import { MarkdownRenderer } from '../../services';
import styled from '../../styled-components';
import { SanitizedMarkdownHTML } from './SanitizedMdBlock';

export interface StylingMarkdownProps {
  compact?: boolean;
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
    onSelectUrl?: any;
  };

export class Markdown extends React.Component<MarkdownProps> {
  handleClick = () => {
    this.props.onSelectUrl();
  };
  render() {
    const { source, inline, compact, className } = this.props;
    const renderer = new MarkdownRenderer();
    return (
      <MarkWrapper onClick={this.handleClick}>
        <SanitizedMarkdownHTML
          html={renderer.renderMd(source)}
          inline={inline}
          compact={compact}
          className={className}
        />
      </MarkWrapper>
    );
  }
}
const MarkWrapper = styled.div`
  div {
    width: 100% !important;
    padding-top: 0 !important;
  }
`;
