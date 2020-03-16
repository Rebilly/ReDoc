import { observer } from 'mobx-react';
import * as React from 'react';

import styled from '../../styled-components';

import { SchemaModel } from '../../services/models';

import { PropertiesTable } from '../../common-elements/fields-layout';
import { H3 } from '../../common-elements/headers';

import { Field } from '../Fields/Field';
import { Markdown } from '../Markdown/Markdown';
import { DiscriminatorDropdown } from './DiscriminatorDropdown';
import { SchemaProps } from './Schema';

import { mapWithLast } from '../../utils';

export interface ObjectSchemaProps extends SchemaProps {
  discriminator?: {
    fieldName: string;
    parentSchema: SchemaModel;
  };
}

export const ObjectSchemaDetails = styled.div`
  margin: 0 0 0.5em 0;
`;

export const ObjectSchemaTitle = styled(H3)`
  margin: 0.5em 0 0 0;
`;

export const ObjectSchemaDescription = styled.div`
  margin: 0.5em 0 0 0;
`;

@observer
export class ObjectSchema extends React.Component<ObjectSchemaProps> {
  get parentSchema() {
    return this.props.discriminator!.parentSchema;
  }

  render() {
    const {
      schema: { fields = [] },
      discriminator,
    } = this.props;

    const needFilter = this.props.skipReadOnly || this.props.skipWriteOnly;

    const filteredFields = needFilter
      ? fields.filter(item => {
          return !(
            (this.props.skipReadOnly && item.schema.readOnly) ||
            (this.props.skipWriteOnly && item.schema.writeOnly)
          );
        })
      : fields;

    return (
      <div>
        <ObjectSchemaDetails>
          {!this.props.skipObjectTitle && (
            <ObjectSchemaTitle>{this.props.schema.title}</ObjectSchemaTitle>
          )}
          {!this.props.skipObjectDescription && (
            <ObjectSchemaDescription>
              <Markdown compact={true} source={this.props.schema.description} />
            </ObjectSchemaDescription>
          )}
        </ObjectSchemaDetails>

        <PropertiesTable>
          <tbody>
            {mapWithLast(filteredFields, (field, isLast) => {
              return (
                <Field
                  key={field.name}
                  isLast={isLast}
                  field={field}
                  renderDiscriminatorSwitch={
                    (discriminator &&
                      discriminator.fieldName === field.name &&
                      (() => (
                        <DiscriminatorDropdown
                          parent={this.parentSchema}
                          enumValues={field.schema.enum}
                        />
                      ))) ||
                    undefined
                  }
                  className={field.expanded ? 'expanded' : undefined}
                  showExamples={false}
                  skipReadOnly={this.props.skipReadOnly}
                  skipWriteOnly={this.props.skipWriteOnly}
                />
              );
            })}
          </tbody>
        </PropertiesTable>
      </div>
    );
  }
}
