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
} from '../../common-elements/fields-layout';

import { ShelfIcon } from '../../common-elements/';

import { FieldModel } from '../../services/models';
import { Schema, SchemaOptions } from '../Schema/Schema';

export interface FieldProps extends SchemaOptions {
  className?: string;
  isLast?: boolean;
  showExamples?: boolean;

  field: FieldModel;
  expandByDefault?: boolean;

  renderDiscriminatorSwitch?: (opts: FieldProps) => JSX.Element;
}

@observer
export class Field extends React.Component<FieldProps> {
  toggle = () => {
    if (this.props.field.expanded === undefined && this.props.expandByDefault) {
      this.props.field.expanded = false;
    } else {
      this.props.field.toggle();
    }
  };

  handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      this.toggle();
    }
  };

  render() {
    const { className, field, isLast, expandByDefault } = this.props;
    const { name, deprecated, required, kind } = field;
    const withSubSchema = !field.schema.isPrimitive && !field.schema.isCircular;

    const expanded = field.expanded === undefined ? expandByDefault : field.expanded;

    const paramName = withSubSchema ? (
      <ClickablePropertyNameCell
        className={deprecated ? 'deprecated' : ''}
        kind={kind}
        title={name}
      >
        <PropertyBullet />
        <button
          onClick={this.toggle}
          onKeyPress={this.handleKeyPress}
          aria-label="expand properties"
        >
          <span>{name}</span>
          <ShelfIcon direction={expanded ? 'down' : 'right'} />
        </button>
        {required && <RequiredLabel> required </RequiredLabel>}
      </ClickablePropertyNameCell>
    ) : (
      <PropertyNameCell className={deprecated ? 'deprecated' : undefined} kind={kind} title={name}>
        <PropertyBullet />
        <span>{name}</span>
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
        </tr>
        {expanded && withSubSchema && (
          <tr key={field.name + 'inner'}>
            <PropertyCellWithInner colSpan={2}>
              <InnerPropertiesWrap>
                <Schema
                  schema={field.schema}
                  skipReadOnly={this.props.skipReadOnly}
                  skipWriteOnly={this.props.skipWriteOnly}
                  hideObjectTitle={this.props.hideObjectTitle}
                  hideObjectDescription={this.props.hideObjectDescription}
                />
              </InnerPropertiesWrap>
            </PropertyCellWithInner>
          </tr>
        )}
      </>
    );
  }
}
