import { observer } from 'mobx-react';
import * as React from 'react';
import { TokenGroup } from '..';

import { DarkRightPanel, H2, MiddlePanel, Row, Section, ShareLink } from '../../common-elements';

import { SecuritySchemesModel } from '../../services/models';
import { OpenAPISecurityScheme } from '../../types';
import { titleize } from '../../utils/helpers';
import { Markdown } from '../Markdown/Markdown';
import { StyledMarkdownBlock } from '../Markdown/styled.elements';

const AUTH_TYPES = {
  oauth2: 'OAuth2',
  apiKey: 'API Key',
  http: 'HTTP',
  openIdConnect: 'Open ID Connect',
};

export interface OAuthFlowProps {
  type: string;
  flow: OpenAPISecurityScheme['flows'][keyof OpenAPISecurityScheme['flows']];
  token?: string;
}

export class OAuthFlow extends React.PureComponent<OAuthFlowProps> {
  render() {
    const { type, flow, token } = this.props;
    return (
      <tr>
        <th> {type} OAuth Flow </th>
        <td>
          {type === 'implicit' || type === 'authorizationCode' ? (
            <div>
              <strong> Authorization URL: </strong>
              {(flow as any).authorizationUrl}
            </div>
          ) : null}
          {type === 'password' || type === 'clientCredentials' || type === 'authorizationCode' ? (
            <div>
              <strong> Token URL: </strong>
              {(flow as any).tokenUrl}
            </div>
          ) : null}
          {flow!.refreshUrl && (
            <div>
              <strong> Refresh URL: </strong>
              {flow!.refreshUrl}
            </div>
          )}
          <div>
            <strong> Scopes: </strong>
          </div>
          <ul>
            {Object.keys(flow!.scopes || {}).map(scope => (
              <li key={scope}>
                <code>{scope}</code> - <Markdown inline={true} source={flow!.scopes[scope] || ''} />
              </li>
            ))}
          </ul>
        </td>
        <td> {token} </td>
      </tr>
    );
  }
}

export interface SecurityDefsProps {
  securitySchemes: SecuritySchemesModel;
}

export interface SecurityDefsState {
  tokens: Dict<string>;
}

@observer
export class SecurityDefs extends React.PureComponent<SecurityDefsProps, SecurityDefsState> {

  state = {
    tokens: {},
  };

  mutateToken = (scheme, id) => {
    return () => {
      scheme.setToken(this.state.tokens[id]);
    };
  };

  setToken = id => {
    return token => {
      const tokens = this.state.tokens;
      tokens[id] = token;
      this.setState({tokens});
    };
  };

  render() {
    return this.props.securitySchemes.schemes.map(scheme => (
      <Section id={scheme.sectionId} key={scheme.id}>
        <Row>
          <MiddlePanel>
            <H2>
              <ShareLink to={scheme.sectionId} />
              {scheme.id}
            </H2>
            <Markdown source={scheme.description || ''} />
            <StyledMarkdownBlock>
              <table className="security-details">
                <tbody>
                  <tr>
                    <th> Security Scheme Type </th>
                    <td> {AUTH_TYPES[scheme.type] || scheme.type} </td>
                    <td> Value </td>
                  </tr>
                  {scheme.apiKey ? (
                    <tr>
                      <th> {titleize(scheme.apiKey.in || '')} parameter name:</th>
                      <td> {scheme.apiKey.name} </td>
                      <td> {scheme.token} </td>
                    </tr>
                  ) : scheme.http ? (
                    [
                      <tr key="scheme">
                        <th> HTTP Authorization Scheme </th>
                        <td> {scheme.http.scheme} </td>
                        <td> {scheme.token} </td>
                      </tr>,
                      scheme.http.scheme === 'bearer' && scheme.http.bearerFormat && (
                        <tr key="bearer">
                          <th> Bearer format </th>
                          <td> "{scheme.http.bearerFormat}" </td>
                          <td> {scheme.token} </td>
                        </tr>
                      ),
                    ]
                  ) : scheme.openId ? (
                    <tr>
                      <th> Connect URL </th>
                      <td>
                        <a target="_blank" href={scheme.openId.connectUrl}>
                          {scheme.openId.connectUrl}
                        </a>
                      </td>
                      <td> {scheme.token} </td>
                    </tr>
                  ) : scheme.flows ? (
                    Object.keys(scheme.flows).map(type => (
                      <OAuthFlow key={type} type={type} token={scheme.token} flow={scheme.flows[type]} />
                    ))
                  ) : null}
                </tbody>
              </table>
            </StyledMarkdownBlock>
          </MiddlePanel>
          <DarkRightPanel>
            <TokenGroup
              title={'Enter ' + scheme.id}
              description={'You can add token here and store it to use in your request calls in this page.'}
              onChange={this.setToken(scheme.sectionId)}
              onSubmit={this.mutateToken(scheme, scheme.sectionId)}
            />
          </DarkRightPanel>
        </Row>
      </Section>
    ));
  }
}
