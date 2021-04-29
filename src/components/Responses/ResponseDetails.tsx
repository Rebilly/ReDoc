import * as React from 'react';

import { ResponseModel } from '../../services/models';

import { UnderlinedHeader } from '../../common-elements';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { MediaTypesSwitch } from '../MediaTypeSwitch/MediaTypesSwitch';
import { Schema } from '../Schema';

import { Markdown } from '../Markdown/Markdown';
import { ResponseHeaders } from './ResponseHeaders';
import { OptionsContext } from '../OptionsProvider';

export class ResponseDetails extends React.PureComponent<{ response: ResponseModel }> {
  static contextType = OptionsContext;

  render() {
    const { hideObjectTitle, hideObjectDescription } = this.context;
    const { description, headers, content } = this.props.response;
    return (
      <>
        {description && <Markdown source={description} />}
        <ResponseHeaders headers={headers} />
        <MediaTypesSwitch content={content} renderDropdown={this.renderDropdown}>
          {({ schema }) => {
            return <Schema
              skipWriteOnly={true}
              hideObjectTitle={hideObjectTitle}
              hideObjectDescription={hideObjectDescription}
              key="schema" schema={schema} />;
          }}
        </MediaTypesSwitch>
      </>
    );
  }

  private renderDropdown = props => {
    return (
      <UnderlinedHeader key="header">
        Response Schema: <DropdownOrLabel {...props} />
      </UnderlinedHeader>
    );
  };
}
