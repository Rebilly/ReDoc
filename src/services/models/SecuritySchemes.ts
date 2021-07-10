import { OpenAPISecurityScheme, Referenced } from '../../types';
import { SECURITY_SCHEMES_SECTION_PREFIX } from '../../utils/openapi';
import { OpenAPIParser } from '../OpenAPIParser';

export class SecuritySchemeModel {
  id: string;
  sectionId: string;
  type: OpenAPISecurityScheme['type'];
  description: string;
  displayName: string;
  apiKey?: {
    name: string;
    in: OpenAPISecurityScheme['in'];
  };

  http?: {
    scheme: string;
    bearerFormat?: string;
  };

  flows: OpenAPISecurityScheme['flows'];
  openId?: {
    connectUrl: string;
  };

  constructor(parser: OpenAPIParser, id: string, scheme: Referenced<OpenAPISecurityScheme>) {
    const info = parser.deref(scheme);
    this.id = id;
    this.sectionId = SECURITY_SCHEMES_SECTION_PREFIX + id;
    this.type = info.type;
    this.displayName = info['x-displayName'] || id;
    this.description = info.description || '';
    if (info.type === 'apiKey') {
      this.apiKey = {
        name: info.name!,
        in: info.in,
      };
    }

    if (info.type === 'http') {
      this.http = {
        scheme: info.scheme!,
        bearerFormat: info.bearerFormat,
      };
    }

    if (info.type === 'openIdConnect') {
      this.openId = {
        connectUrl: info.openIdConnectUrl!,
      };
    }

    if (info.type === 'oauth2' && info.flows) {
      this.flows = info.flows;
    }
  }
}

export class SecuritySchemesModel {
  schemes: SecuritySchemeModel[];

  constructor(parser: OpenAPIParser) {
    const schemes = (parser.spec.components && parser.spec.components.securitySchemes) || {};
    this.schemes = Object.keys(schemes).map(
      name => new SecuritySchemeModel(parser, name, schemes[name]),
    );
  }
}
