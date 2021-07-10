import { observer } from 'mobx-react';
import * as React from 'react';

import { SchemaModel } from '../../services/models';

import { PropertiesTable, PropertiesTableCaption } from '../../common-elements/fields-layout';
import { Field } from '../Fields/Field';
import { DiscriminatorDropdown } from './DiscriminatorDropdown';
import { SchemaProps } from './Schema';

import { mapWithLast } from '../../utils';
import { OptionsContext } from '../OptionsProvider';

export interface ObjectSchemaProps extends SchemaProps {
  discriminator?: {
    fieldName: string;
    parentSchema: SchemaModel;
  };
}

@observer
export class ObjectSchema extends React.Component<ObjectSchemaProps> {
  static contextType = OptionsContext;

  get parentSchema() {
    return this.props.discriminator!.parentSchema;
  }

  render() {
    const {
      schema: { fields = [] },
      showTitle,
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

    const expandByDefault = this.context.expandSingleSchemaField && filteredFields.length === 1;

    return (
      <PropertiesTable>
        {showTitle && <PropertiesTableCaption>{this.props.schema.title}</PropertiesTableCaption>}
        <tbody>
          {mapWithLast(filteredFields, (field, isLast) => {
            return (
              <Field
                key={field.name}
                isLast={isLast}
                field={field}
                expandByDefault={expandByDefault}
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
                showExamples={true}
                skipReadOnly={this.props.skipReadOnly}
                skipWriteOnly={this.props.skipWriteOnly}
                showTitle={this.props.showTitle}
              />
            );
          })}
        </tbody>
      </PropertiesTable>
    );
  }
}
