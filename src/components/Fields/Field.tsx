import { observer } from 'mobx-react';
import * as React from 'react';

import { ClickablePropertyNameCell, RequiredLabel } from '../../common-elements/fields';
import { FieldDetails } from './FieldDetails';

import {
  InnerPropertiesWrap,
  PropertyBullet,
  PropertyCellWithInner,
  PropertyDetailsCell,
  PropertyNameCell,
  WrappedShelfIcon,
} from '../../common-elements/fields-layout';

import { ShelfIcon, TextField } from '../../common-elements/';

import { FieldModel } from '../../services/models';
import { Schema, SchemaOptions } from '../Schema/Schema';

export interface FieldProps extends SchemaOptions {
  className?: string;
  isLast?: boolean;
  showExamples?: boolean;

  field: FieldModel;

  renderDiscriminatorSwitch?: (opts: FieldProps) => JSX.Element;
}

@observer
export class Field extends React.Component<FieldProps> {
  toggle = () => {
    this.props.field.toggle();
  };

  onFieldChange = e => {
    console.log('Textfield value is ' + e.target.placeholder + ' - ' + e.target.value);
    this.props.field.setValue(e.target.value);
  };

  render() {
    const { className, field, isLast } = this.props;
    const { name, expanded, deprecated, required, kind } = field;
    const withSubSchema = !field.schema.isPrimitive && !field.schema.isCircular;

    const paramName = withSubSchema ? (
      <ClickablePropertyNameCell
        onClick={this.toggle}
        className={deprecated ? 'deprecated' : ''}
        kind={kind}
        title={name}
      >
        <PropertyBullet />
        {name}
        <WrappedShelfIcon>
          <ShelfIcon direction={expanded ? 'down' : 'right'} />
        </WrappedShelfIcon>
        {required && <RequiredLabel> required </RequiredLabel>}
      </ClickablePropertyNameCell>
    ) : (
        <PropertyNameCell className={deprecated ? 'deprecated' : undefined} kind={kind} title={name}>
          <PropertyBullet />
          {name}
          {required && <RequiredLabel> required </RequiredLabel>}
        </PropertyNameCell>
      );

    return (
      <>
        <tr className={isLast ? 'last ' + className : className}>
          {paramName}
          <PropertyDetailsCell>
            <FieldDetails {...this.props} />
          </PropertyDetailsCell>
          {field && field.in === 'path' &&
            <td><TextField placeholder={field.name} onChange={this.onFieldChange} /></td>
          }
        </tr>
        {field.expanded && withSubSchema && (
          <tr key={field.name + 'inner'}>
            <PropertyCellWithInner colSpan={2}>
              <InnerPropertiesWrap>
                <Schema
                  schema={field.schema}
                  skipReadOnly={this.props.skipReadOnly}
                  skipWriteOnly={this.props.skipWriteOnly}
                  showTitle={this.props.showTitle}
                />
              </InnerPropertiesWrap>
            </PropertyCellWithInner>
          </tr>
        )}
      </>
    );
  }
}
