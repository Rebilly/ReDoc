import * as React from 'react';
import styled from '../../styled-components';

import { SampleControls } from '../../common-elements';
import { CopyButtonWrapper } from '../../common-elements/CopyButtonWrapper';
import { PrismDiv } from '../../common-elements/PrismDiv';
import { jsonToHTML } from '../../utils/jsonToHtml';
import { OptionsContext } from '../OptionsProvider';
import { jsonStyles } from './style';

export interface JsonProps {
  data: any;
  className?: string;
}

const JsonViewerWrap = styled.div`
  &:hover > ${SampleControls} {
    opacity: 1;
  }
`;

class Json extends React.PureComponent<JsonProps> {
  node: HTMLDivElement;

  render() {
    return <CopyButtonWrapper data={this.props.data}>{this.renderInner}</CopyButtonWrapper>;
  }

  renderInner = ({ renderCopyButton }) => {
    const showFoldingButtons = this.props.data && Object.values(this.props.data).some(
      (value) => typeof value === 'object' && value !== null,
    );

    return (
      <JsonViewerWrap>
        <SampleControls>
          {renderCopyButton()}
          <button
            onClick={this.expandAll}
            style={{ display: showFoldingButtons ? 'inline-block' : 'none' }}
          > Expand all </button>
          <button
            onClick={this.collapseAll}
            style={{ display: showFoldingButtons ? 'inline-block' : 'none' }}
          > Collapse all </button>
        </SampleControls>
        <OptionsContext.Consumer>
          {(options) => (
            <PrismDiv
              className={this.props.className}
              // tslint:disable-next-line
              ref={(node) => (this.node = node!)}
              dangerouslySetInnerHTML={{
                __html: jsonToHTML(this.props.data, options.jsonSampleExpandLevel),
              }}
            />
          )}
        </OptionsContext.Consumer>
      </JsonViewerWrap>
    );
  };

  expandAll = () => {
    const elements = this.node.getElementsByClassName('collapsible');
    for (const collapsed of Array.prototype.slice.call(elements)) {
      const parentNode = collapsed.parentNode as Element;
      parentNode.classList.remove('collapsed');
      parentNode.querySelector('.collapser')!.setAttribute('aria-label', 'collapse');
    }
  };

  collapseAll = () => {
    const elements = this.node.getElementsByClassName('collapsible');
    // skip first item to avoid collapsing whole object/array
    const elementsArr = Array.prototype.slice.call(elements, 1);

    for (const expanded of elementsArr) {
      const parentNode = expanded.parentNode as Element;
      parentNode.classList.add('collapsed');
      parentNode.querySelector('.collapser')!.setAttribute('aria-label', 'expand');
    }
  };

  collapseElement = (target: HTMLElement) => {
    let collapsed;
    if (target.className === 'collapser') {
      collapsed = target.parentElement!.getElementsByClassName('collapsible')[0];
      if (collapsed.parentElement.classList.contains('collapsed')) {
        collapsed.parentElement.classList.remove('collapsed');
        target.setAttribute('aria-label', 'collapse');
      } else {
        collapsed.parentElement.classList.add('collapsed');
        target.setAttribute('aria-label', 'expand');
      }
    }
  };

  clickListener = (event: MouseEvent) => {
    this.collapseElement(event.target as HTMLElement);
  };

  focusListener = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      this.collapseElement(event.target as HTMLElement);
    }
  };

  componentDidMount() {
    this.node!.addEventListener('click', this.clickListener);
    this.node!.addEventListener('focus', this.focusListener);
  }

  componentWillUnmount() {
    this.node!.removeEventListener('click', this.clickListener);
    this.node!.removeEventListener('focus', this.focusListener);
  }
}

export const JsonViewer = styled(Json)`
  ${jsonStyles};
`;
