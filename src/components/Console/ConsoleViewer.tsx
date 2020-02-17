import { observer } from 'mobx-react';
import * as React from 'react';
import { SubmitButton } from '../../common-elements/buttons';
import { FlexLayoutReverse } from '../../common-elements/panels';
import { FieldModel, OperationModel, SecuritySchemeModel, SecuritySchemesModel } from '../../services/models';
import { ConsoleResponse } from '../ConsoleResponse/Response';
import { ConsoleEditor } from './ConsoleEditor';

const qs = require('qs');

export interface ConsoleViewerProps {
  operation: OperationModel;
  additionalHeaders?: object;
  queryParamPrefix?: string;
  queryParamSuffix?: string;
  securitySchemes: SecuritySchemesModel;
  urlIndex: number;
}

export interface ConsoleViewerState {
  result: any;
}

export interface Schema {
  _$ref?: any;
}

@observer
export class ConsoleViewer extends React.Component<ConsoleViewerProps, ConsoleViewerState> {
  operation: OperationModel;
  additionalHeaders: object;
  visited = new Set();
  private consoleEditor: any;

  constructor(props) {
    super(props);
    this.state = {
      result: null,
    };
  }
  onClickSend = async () => {
    const ace = this.consoleEditor && this.consoleEditor.editor;
    const { operation, securitySchemes: {schemes}, additionalHeaders = {}, urlIndex = 0 } = this.props;

    let value = ace && ace.editor.getValue();

    const content = operation.requestBody && operation.requestBody.content;
    const mediaType = content && content.mediaTypes[content.activeMimeIdx];
    const endpoint = {
      method: operation.httpVerb,
      path: operation.servers[urlIndex].url + operation.path,
    };
    if (value) {
      value = JSON.parse(value);
    }
    const contentType = mediaType && mediaType.name || 'application/json';
    const contentTypeHeader = { 'Content-Type': contentType };

    const schemeMapper: Map<string, SecuritySchemeModel> = new Map<string, SecuritySchemeModel>();
    schemes.forEach(scheme => {
      schemeMapper.set(scheme.id, scheme);
    });

    const securityHeaders: Dict<string | undefined> = {};

    operation.security.forEach(({schemes: [{ id }]}) => {
      if (schemeMapper.has(id)) {
        // this part of code needs a ts-ignore because typescript couldn't detect that schemeMapper.get(id) -
        // has been checked to avoid token of undefined.
        // @ts-ignore
        securityHeaders[id] = schemeMapper.get(id).token;
      }
    });
    const headers = { ...additionalHeaders, ...contentTypeHeader, ...securityHeaders };
    let result;
    try {
      result = await this.invoke(endpoint, value, headers);
      this.setState({
        result,
      });
    } catch (error) {
      this.setState({
        result: error,
      });
    }
  };

  /*
  * If we have a url like foo/bar/{uuid} uuid will be replaced with what user has typed in.
  */
  addParamsToUrl(url: string, params: FieldModel[]) {
    const queryParamPrefix = '{';
    const queryParamSuffix = '}';

    for (const fieldModel of params) {
      if (url.indexOf(`${queryParamPrefix}${fieldModel.name}${queryParamSuffix}`) > -1 && fieldModel.$value.length > 0) {
        url = url.replace(`${queryParamPrefix}${fieldModel.name}${queryParamSuffix}`, fieldModel.$value);
      }
    }

    if (url.split(queryParamPrefix).length > 1) {
      throw Error(`** we have missing query params ** ${url}`);
    }

    return url;

  }

  async invoke(endpoint, body, headers = {}) {
    try {
      const { operation } = this.props;
      let url = this.addParamsToUrl(endpoint.path, operation.parameters || []);
      if (endpoint.method.toLocaleLowerCase() === 'get') {
        url = url + '?' + qs.stringify(body || '');
      }
      const myHeaders = new Headers();
      for (const [key, value] of Object.entries(headers)) {
        myHeaders.append(key, `${value}`);
      }

      const request = new Request(url, {
        method: endpoint.method,
        redirect: 'manual',
        headers: myHeaders,
        body: (body) ? JSON.stringify(body) : undefined,
      });

      const response = await fetch(request);
      const content = await response.json();
      const { ok, status, statusText, redirected } = response;
      return {
        content,
        ok,
        status,
        statusText,
        redirected,
        headers: response.headers,
        url: response.url,
      };

    } catch (error) {
      console.error(error);
    }

  }

  render() {
    const { operation } = this.props;
    const requestBodyContent = operation.requestBody && operation.requestBody.content && operation.requestBody.content;
    const hasBodySample = requestBodyContent && requestBodyContent.hasSample;
    const mediaTypes = (requestBodyContent && requestBodyContent.mediaTypes) ? requestBodyContent.mediaTypes : [];
    const { result } = this.state;
    return (
      <div>
        <h3> Request </h3>
        {hasBodySample && (
          <ConsoleEditor
            mediaTypes={mediaTypes}
            ref={(editor: any) => (this.consoleEditor = editor)}
          />
        )}
        <FlexLayoutReverse>
          <SubmitButton onClick={this.onClickSend} >Send Request</SubmitButton>
        </FlexLayoutReverse>
        {result &&
          <ConsoleResponse response={result} />
        }
      </div>
    );
  }
}
