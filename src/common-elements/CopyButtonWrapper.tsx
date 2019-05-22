import * as React from 'react';
import { Tooltip } from '../common-elements/Tooltip';

import { ClipboardService } from '../services/ClipboardService';

export interface CopyButtonWrapperProps {
  data: any;
  children: (props: { renderCopyButton: () => React.ReactNode }) => React.ReactNode;
}

export class CopyButtonWrapper extends React.PureComponent<
  CopyButtonWrapperProps,
  { tooltipShown: boolean }
> {
  constructor(props) {
    super(props);
    this.state = {
      tooltipShown: false,
    };
  }

  render() {
    return this.props.children({ renderCopyButton: this.renderCopyButton });
  }

  copy = () => {
    const content =
      typeof this.props.data === 'string'
        ? this.props.data
        : JSON.stringify(this.props.data, null, 2);
    ClipboardService.copyCustom(content);
    this.showTooltip();
  };

  renderCopyButton = () => {
    return (
      <span onClick={this.copy}>
        <Tooltip
          title={ClipboardService.isSupported() ? 'Copied' : 'Not supported in your browser'}
          open={this.state.tooltipShown}
        >
          Copy
        </Tooltip>
      </span>
    );
  };

  showTooltip() {
    this.setState({
      tooltipShown: true,
    });

    setTimeout(() => {
      this.setState({
        tooltipShown: false,
      });
    }, 1500);
  }
}
