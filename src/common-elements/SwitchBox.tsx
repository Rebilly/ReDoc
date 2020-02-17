import * as React from 'react';
import Switch from 'react-switch';
import {FlexLayout} from './index';

import styled from '../styled-components';

const CustomFlexLayout = styled(FlexLayout)`
  align-items: center;
`;

interface LabelProps {
  active: boolean;
}

const Label = styled.label<LabelProps>`
  color: ${props => props.active ? props.theme.colors.success.main : props.theme.colors.text.secondary}
  margin-left: 10px;
  font-size: 120%;
`;

interface TryItOutProps {
  label: string;
  checked: boolean;
  onClick: () => void;
}

export class SwitchBox extends React.PureComponent<TryItOutProps> {
  id = 'toggle-id-' + Date.now();
  render() {
    const { label, checked, onClick } = this.props;
    return (
      <CustomFlexLayout>
        <Switch
          id={this.id}
          onChange={onClick}
          checked={checked}
          uncheckedIcon={false}
        />
        <Label active={checked} htmlFor={this.id}>{label}</Label>
      </CustomFlexLayout>
    );
  }
}
