import * as React from 'react';

import { AppStore, MarkdownRenderer, RedocNormalizedOptions } from '../../services';
import { BaseMarkdownProps } from './Markdown';
import { SanitizedMarkdownHTML } from './SanitizedMdBlock';

import { OptionsConsumer } from '../OptionsProvider';
import { StoreConsumer } from '../StoreBuilder';

export interface AdvancedMarkdownProps extends BaseMarkdownProps {
  htmlWrap?: (part: JSX.Element) => JSX.Element;
}

export class AdvancedMarkdown extends React.Component<AdvancedMarkdownProps> {
  render() {
    return (
      <OptionsConsumer>
        {options => (
          <StoreConsumer>{store => this.renderWithOptionsAndStore(options, store)}</StoreConsumer>
        )}
      </OptionsConsumer>
    );
  }

  renderWithOptionsAndStore(options: RedocNormalizedOptions, store?: AppStore) {
    const { source, htmlWrap = i => i } = this.props;
    if (!store) {
      throw new Error('When using componentes in markdown, store prop must be provided');
    }

    const renderer = new MarkdownRenderer(options);
    const parts = renderer.renderMdWithComponents(source);

    if (!parts.length) {
      return null;
    }

    return parts.map((part, idx) => {
      if (typeof part === 'string') {
        return React.cloneElement(
          htmlWrap(<SanitizedMarkdownHTML html={part} inline={false} dense={false} />),
          { key: idx },
        );
      }
      return <part.component key={idx} {...{ ...part.attrs, ...part.propsSelector(store) }} />;
    });
  }
}
