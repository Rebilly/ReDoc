import * as React from 'react';

import { ResponseModel } from '../../services/models';

import { UnderlinedHeader } from '../../common-elements';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { MediaTypesSwitch } from '../MediaTypeSwitch/MediaTypesSwitch';
import { Schema } from '../Schema';

import { Extensions } from '../Fields/Extensions';
import { Markdown } from '../Markdown/Markdown';
import { ResponseHeaders } from './ResponseHeaders';

export class ResponseDetails extends React.PureComponent<{ response: ResponseModel }> {
  render() {
    const { description, extensions, headers, content } = this.props.response;
    return (
      <>
        {description && <Markdown source={description} />}
        <Extensions extensions={extensions} />
        <ResponseHeaders headers={headers} />
        <MediaTypesSwitch content={content} renderDropdown={this.renderDropdown}>
          {({ schema }) => {
            return <Schema skipWriteOnly={true} key="schema" schema={schema} />;
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
