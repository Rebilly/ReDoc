import * as React from 'react';
import { DropdownOrLabel } from '../DropdownOrLabel/DropdownOrLabel';
import { ParametersGroup } from './ParametersGroup';
import { OptionsContext } from '../OptionsProvider';

import { UnderlinedHeader } from '../../common-elements';

import { MediaContentModel } from '../../services';
import { FieldModel, RequestBodyModel } from '../../services/models';
import { MediaTypesSwitch } from '../MediaTypeSwitch/MediaTypesSwitch';
import { Schema } from '../Schema';

import { Markdown } from '../Markdown/Markdown';

function safePush(obj, prop, item) {
  if (!obj[prop]) {
    obj[prop] = [];
  }
  obj[prop].push(item);
}

export interface ParametersProps {
  parameters?: FieldModel[];
  body?: RequestBodyModel;
}

const PARAM_PLACES = ['path', 'query', 'cookie', 'header'];

export class Parameters extends React.PureComponent<ParametersProps> {
  static contextType = OptionsContext;

  orderParams(params: FieldModel[]): Record<string, FieldModel[]> {
    const res = {};
    params.forEach(param => {
      safePush(res, param.in, param);
    });
    return res;
  }

  render() {
    const { hideObjectTitle, hideObjectDescription } = this.context;
    const { body, parameters = [] } = this.props;
    if (body === undefined && parameters === undefined) {
      return null;
    }

    const paramsMap = this.orderParams(parameters);

    const paramsPlaces = parameters.length > 0 ? PARAM_PLACES : [];

    const bodyContent = body && body.content;

    const bodyDescription = body && body.description;

    return (
      <>
        {paramsPlaces.map((place) => (
          <ParametersGroup key={place} place={place} parameters={paramsMap[place]} />
        ))}
        {bodyContent && (
          <BodyContent
            hideObjectTitle={hideObjectTitle}
            hideObjectDescription={hideObjectDescription}
            content={bodyContent}
            description={bodyDescription}
          />
        )}
      </>
    );
  }
}

function DropdownWithinHeader(props) {
  return (
    <UnderlinedHeader key="header">
      Request Body schema: <DropdownOrLabel {...props} />
    </UnderlinedHeader>
  );
}

export function BodyContent(props: {
  content: MediaContentModel;
  description?: string;
  hideObjectTitle?: boolean;
  hideObjectDescription?: boolean;
}): JSX.Element {
  const { content, description, hideObjectTitle, hideObjectDescription } = props;
  return (
    <MediaTypesSwitch content={content} renderDropdown={DropdownWithinHeader}>
      {({ schema }) => {
        return (
          <>
            {description !== undefined && <Markdown source={description} />}
            <Schema
              skipReadOnly={true}
              hideObjectTitle={hideObjectTitle}
              hideObjectDescription={hideObjectDescription}
              key="schema"
              schema={schema}
            />
          </>
        );
      }}
    </MediaTypesSwitch>
  );
}
