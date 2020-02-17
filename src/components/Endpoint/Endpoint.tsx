import * as React from 'react';
import { ShelfIcon } from '../../common-elements';
import { ClipboardService, OperationModel } from '../../services';
import { Markdown } from '../Markdown/Markdown';
import { OptionsContext } from '../OptionsProvider';
import { SelectOnClick } from '../SelectOnClick/SelectOnClick';

import { expandDefaultServerVariables, getBasePath } from '../../utils';
import {
  EndpointInfo,
  HttpVerb,
  OperationEndpointWrap,
  ServerItem,
  ServerRelativeURL,
  ServersOverlay,
  ServerUrl,
} from './styled.elements';

export interface EndpointProps {
  operation: OperationModel;

  hideHostname?: boolean;
  inverted?: boolean;
  handleUrl: any;
}

export interface EndpointState {
  expanded: boolean;
  selectedItem: number;
  tooltipShown: boolean;
}

export class Endpoint extends React.Component<EndpointProps, EndpointState> {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      selectedItem: 0,
      tooltipShown: false,
    };
  }

  toggle = () => {
    this.setState({ expanded: !this.state.expanded });
  };

  render() {
    const { operation, inverted, hideHostname } = this.props;
    const { expanded } = this.state;

    // TODO: highlight server variables, e.g. https://{user}.test.com
    return (
      <OptionsContext.Consumer>
        {options => (
          <OperationEndpointWrap>
            <div className={this.state.tooltipShown === true ? 'showToolTip' : 'hideToolTip'}>
              Copied
            </div>
            <EndpointInfo onClick={this.toggle} expanded={expanded} inverted={inverted}>
              <HttpVerb type={operation.httpVerb}> {operation.httpVerb}</HttpVerb>{' '}
              <ServerRelativeURL>{operation.path}</ServerRelativeURL>
              <ShelfIcon
                float={'right'}
                color={inverted ? 'black' : 'white'}
                size={'20px'}
                direction={expanded ? 'up' : 'down'}
                style={{ marginRight: '-25px' }}
              />
            </EndpointInfo>
            <ServersOverlay expanded={expanded}>
              {operation.servers.map((server, index) => {
                const normalizedUrl = options.expandDefaultServerVariables
                  ? expandDefaultServerVariables(server.url, server.variables)
                  : server.url;
                return (
                  <ServerItem className={this.state.selectedItem === index ? 'selected' : ''} key={normalizedUrl}>
                    <Markdown onSelectUrl={this.handleUrl.bind(this, index)} source={server.description || ''} compact={true} />
                    <SelectOnClick onSelectUrl={this.handleUrl.bind(this, index)}>
                      <ServerUrl>
                        <span>
                          {hideHostname || options.hideHostname
                            ? getBasePath(normalizedUrl)
                            : normalizedUrl}
                        </span>
                        {operation.path}
                      </ServerUrl>
                    </SelectOnClick>
                  </ServerItem>
                );
              })}
            </ServersOverlay>
          </OperationEndpointWrap>
        )}
      </OptionsContext.Consumer>
    );
  }

  handleUrl(url: number) {
    this.props.handleUrl(url);
    this.setState({
      selectedItem: url,
      expanded: false,
      tooltipShown: true,
    });
    ClipboardService.copyCustom(this.props.operation.servers[url].url + this.props.operation.path);
    setTimeout(() => {
      this.setState({
        tooltipShown: false,
      });
    }, 1000);
  }
}
