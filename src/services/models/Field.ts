import { action, observable } from 'mobx';

import {
  OpenAPIParameter,
  OpenAPIParameterLocation,
  OpenAPIParameterStyle,
  Referenced,
} from '../../types';
import { IMenuItem } from '../MenuStore';
import { RedocNormalizedOptions } from '../RedocNormalizedOptions';

import { extractExtensions } from '../../utils/openapi';
import { OpenAPIParser } from '../OpenAPIParser';
import { MediaContentModel } from './MediaContent';
import { ResponseModel } from './Response';
import { SchemaModel } from './Schema';

function getDefaultStyleValue(parameterLocation: OpenAPIParameterLocation): OpenAPIParameterStyle {
  switch (parameterLocation) {
    case 'header':
      return 'simple';
    case 'query':
      return 'form';
    case 'path':
      return 'simple';
    default:
      return 'form';
  }
}

/**
 * Field or Parameter model ready to be used by components
 */
export class FieldModel implements IMenuItem {
  @observable
  expanded: boolean | undefined;

  depth: number;
  items = [];

  ready?: boolean = true;
  active: boolean = false;

  id: string;
  absoluteIdx?: number;
  parent?: IMenuItem;

  containerContentModel?: MediaContentModel;
  containerOneOf?: SchemaModel;
  activeContentModel?: number;
  activeOneOf?: number;
  responseContainer?: ResponseModel;

  type = 'field' as 'field';

  schema: SchemaModel;
  name: string;
  required: boolean;
  description: string;
  example?: string;
  deprecated: boolean;
  in?: OpenAPIParameterLocation;
  kind: string;
  extensions?: Dict<any>;
  explode: boolean;
  style?: OpenAPIParameterStyle;

  serializationMime?: string;

  constructor(
    parser: OpenAPIParser,
    infoOrRef: Referenced<OpenAPIParameter> & { name?: string; kind?: string },
    pointer: string,
    options: RedocNormalizedOptions,
  ) {
    const info = parser.deref<OpenAPIParameter>(infoOrRef);
    this.kind = infoOrRef.kind || 'field';
    this.name = infoOrRef.name || info.name;
    this.in = info.in;
    this.required = !!info.required;

    let fieldSchema = info.schema;
    let serializationMime = '';
    if (!fieldSchema && info.in && info.content) {
      serializationMime = Object.keys(info.content)[0];
      fieldSchema = info.content[serializationMime] && info.content[serializationMime].schema;
    }

    this.schema = new SchemaModel(parser, fieldSchema || {}, pointer, options);
    this.description =
      info.description === undefined ? this.schema.description || '' : info.description;
    this.example = info.example || this.schema.example;

    if (serializationMime) {
      this.serializationMime = serializationMime;
    } else if (info.style) {
      this.style = info.style;
    } else if (this.in) {
      this.style = getDefaultStyleValue(this.in);
    }

    this.explode = !!info.explode;

    this.deprecated = info.deprecated === undefined ? !!this.schema.deprecated : info.deprecated;
    parser.exitRef(infoOrRef);

    if (options.showExtensions) {
      this.extensions = extractExtensions(info, options.showExtensions);
    }
  }

  @action
  toggle() {
    this.expanded = !this.expanded;
  }

  @action
  activate() {
    if (this.parent) {
      this.parent.activate();
      if (this.responseContainer !== undefined) {
        this.responseContainer.expand();
      }
      if (this.containerContentModel !== undefined && this.activeContentModel !== undefined) {
        this.containerContentModel.activate(this.activeContentModel);
      }
      if (this.containerOneOf !== undefined && this.activeOneOf !== undefined) {
        this.containerOneOf.activateOneOf(this.activeOneOf);
      }
    }
  }

  @action
  deactivate() {
    if (this.parent) {
      this.parent.deactivate();
    }
  }

  @action
  expand() {
    if (this.parent) {
      if (this.parent.type === 'field') {
        this.parent.expanded = true;
      }
      this.parent.expand();
    }
  }

  collapse() {
    // Do nothing
  }
}
