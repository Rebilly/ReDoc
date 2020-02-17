import * as React from 'react';
import styled from '../styled-components';

const directionMap = {
  left: '90deg',
  right: '-90deg',
  up: '-180deg',
  down: '0',
};

class IntShelfIcon extends React.PureComponent<{
  className?: string;
  float?: 'left' | 'right';
  size?: string;
  color?: string;
  direction: 'left' | 'right' | 'up' | 'down';
  style?: React.CSSProperties;
}> {
  render() {
    return (
      <svg
        className={this.props.className}
        style={this.props.style}
        version="1.1"
        viewBox="0 0 24 24"
        x="0"
        xmlns="http://www.w3.org/2000/svg"
        y="0"
      >
        <polygon points="17.3 8.3 12 13.6 6.7 8.3 5.3 9.7 12 16.4 18.7 9.7 " />
      </svg>
    );
  }
}

export const ShelfIcon = styled(IntShelfIcon)`
  height: ${props => props.size || '18px'};
  width: ${props => props.size || '18px'};
  vertical-align: middle;
  float: ${props => (props.theme.typography.direction === 'rtl') ? 'right' : props.float || '' };
  transition: transform 0.2s ease-out;
  transform: rotateZ(${props => (props.theme.typography.direction === 'rtl') ?
  (directionMap[ props.direction === 'right' ? 'left' : 'down' || 'down']) : (directionMap[props.direction || 'down'])});

  polygon {
    fill: ${props =>
      (props.color && props.theme.colors[props.color] && props.theme.colors[props.color].main) ||
      props.color};
  }
`;

export const Badge = styled.span<{ type: string }>`
  display: inline-block;
  padding: 0 5px;
  margin: 0;
  background-color: ${props => props.theme.colors[props.type].main};
  color: ${props => props.theme.colors[props.type].contrastText};
  font-size: ${props => props.theme.typography.code.fontSize};
  vertical-align: text-top;
`;
