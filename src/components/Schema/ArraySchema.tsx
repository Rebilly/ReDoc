import * as React from 'react';

import { Schema, SchemaProps } from './Schema';

import { ArrayClosingLabel, ArrayOpenningLabel } from '../../common-elements';
import styled from '../../styled-components';
import { humanizeConstraints } from '../../utils';

const PaddedSchema = styled.div`
  padding-left: ${({ theme }) => theme.spacing.unit * 2}px;
`;

export class ArraySchema extends React.PureComponent<SchemaProps> {
  render() {
    const itemsSchema = this.props.schema.items!;
    const itemConstraintSchema = (
      min: number | undefined = undefined,
      max: number | undefined = undefined,
    ) => ({ type: 'array', minItems: min, maxItems: max });

    const minMaxItems = humanizeConstraints(
      itemConstraintSchema(itemsSchema.schema.minItems, itemsSchema.schema.maxItems),
    );

    return (
      <div>
        <ArrayOpenningLabel> Array ({minMaxItems})</ArrayOpenningLabel>
        <PaddedSchema>
          <Schema {...this.props} schema={itemsSchema} />
        </PaddedSchema>
        <ArrayClosingLabel />
      </div>
    );
  }
}
