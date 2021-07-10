import * as React from 'react';

import { SecuritySchemesModel } from '../../services/models';

import { H2, MiddlePanel, Row, Section, ShareLink } from '../../common-elements';
import { OpenAPISecurityScheme } from '../../types';
import { titleize } from '../../utils/helpers';
import { Markdown } from '../Markdown/Markdown';
import { StyledMarkdownBlock } from '../Markdown/styled.elements';

const AUTH_TYPES = {
  oauth2: 'OAuth2',
  apiKey: 'API Key',
  http: 'HTTP',
  openIdConnect: 'OpenID Connect',
};

export interface OAuthFlowProps {
  type: string;
  flow: OpenAPISecurityScheme['flows'][keyof OpenAPISecurityScheme['flows']];
}

export class OAuthFlow extends React.PureComponent<OAuthFlowProps> {
  render() {
    const { type, flow } = this.props;
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
      </tr>
    );
  }
}

export interface SecurityDefsProps {
  securitySchemes: SecuritySchemesModel;
}

export class SecurityDefs extends React.PureComponent<SecurityDefsProps> {
  render() {
    return this.props.securitySchemes.schemes.map(scheme => (
      <Section id={scheme.sectionId} key={scheme.id}>
        <Row>
          <MiddlePanel>
            <H2>
              <ShareLink to={scheme.sectionId} />
              {scheme.displayName}
            </H2>
            <Markdown source={scheme.description || ''} />
            <StyledMarkdownBlock>
              <table className="security-details">
                <tbody>
                  <tr>
                    <th> Security Scheme Type </th>
                    <td> {AUTH_TYPES[scheme.type] || scheme.type} </td>
                  </tr>
                  {scheme.apiKey ? (
                    <tr>
                      <th> {titleize(scheme.apiKey.in || '')} parameter name:</th>
                      <td> {scheme.apiKey.name} </td>
                    </tr>
                  ) : scheme.http ? (
                    [
                      <tr key="scheme">
                        <th> HTTP Authorization Scheme </th>
                        <td> {scheme.http.scheme} </td>
                      </tr>,
                      scheme.http.scheme === 'bearer' && scheme.http.bearerFormat && (
                        <tr key="bearer">
                          <th> Bearer format </th>
                          <td> &quot;{scheme.http.bearerFormat}&quot; </td>
                        </tr>
                      ),
                    ]
                  ) : scheme.openId ? (
                    <tr>
                      <th> Connect URL </th>
                      <td>
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          href={scheme.openId.connectUrl}
                        >
                          {scheme.openId.connectUrl}
                        </a>
                      </td>
                    </tr>
                  ) : scheme.flows ? (
                    Object.keys(scheme.flows).map(type => (
                      <OAuthFlow key={type} type={type} flow={scheme.flows[type]} />
                    ))
                  ) : null}
                </tbody>
              </table>
            </StyledMarkdownBlock>
          </MiddlePanel>
        </Row>
      </Section>
    ));
  }
}
