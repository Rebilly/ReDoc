import { observer } from 'mobx-react';
import * as React from 'react';

import { RecursiveLabel, TypeName, TypeTitle } from '../../common-elements/fields';
import { FieldDetails } from '../Fields/FieldDetails';

import { FieldModel, SchemaModel } from '../../services/models';

import { ArraySchema } from './ArraySchema';
import { ObjectSchema } from './ObjectSchema';
import { OneOfSchema } from './OneOfSchema';

import { l } from '../../services/Labels';

export interface SchemaOptions {
  skipReadOnly?: boolean;
  skipWriteOnly?: boolean;
  skipObjectTitle?: boolean;
  skipObjectDescription?: boolean;
}

export interface SchemaProps extends SchemaOptions {
  schema: SchemaModel;
}

@observer
export class Schema extends React.Component<Partial<SchemaProps>> {
  render() {
    const { schema } = this.props;
    if (!schema) {
      return <em> Schema not provided </em>;
    }
    const { type, oneOf, discriminatorProp, isCircular } = schema;

    if (isCircular) {
      return (
        <div>
          <TypeName>{schema.displayType}</TypeName>
          {schema.title && <TypeTitle> {schema.title} </TypeTitle>}
          <RecursiveLabel> {l('recursive')} </RecursiveLabel>
        </div>
      );
    }

    if (discriminatorProp !== undefined) {
      if (!oneOf || !oneOf.length) {
        throw new Error(
          `Looks like you are using discriminator wrong: you don't have any definition inherited from the ${schema.title}`,
        );
      }
      return (
        <ObjectSchema
          {...{ ...this.props, schema: oneOf![schema.activeOneOf] }}
          discriminator={{
            fieldName: discriminatorProp,
            parentSchema: schema,
          }}
        />
      );
    }

    if (oneOf !== undefined) {
      return <OneOfSchema schema={schema} {...this.props} />;
    }

    switch (type) {
      case 'object':
        return <ObjectSchema {...(this.props as any)} />;
      case 'array':
        return <ArraySchema {...(this.props as any)} />;
    }

    // TODO: maybe adjust FieldDetails to accept schema
    const field = ({
      schema,
      name: '',
      required: false,
      description: schema.description,
      externalDocs: schema.externalDocs,
      deprecated: false,
      toggle: () => null,
      expanded: false,
    } as any) as FieldModel; // cast needed for hot-loader to not fail

    return (
      <div>
        <FieldDetails field={field} />
      </div>
    );
  }
}
