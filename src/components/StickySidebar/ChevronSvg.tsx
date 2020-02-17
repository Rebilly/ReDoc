import * as React from 'react';

import styled from '../../styled-components';

export const AnimatedChevronButton = ({ open }: { open: boolean }) => {
  const iconOffset = open ? 8 : -4;

  return (
    <ChevronContainer>
      <ChevronSvg
        size={15}
        style={{
          transform: `translate(2px, ${iconOffset}px) rotate(180deg)`,
          transition: 'transform 0.2s ease',
        }}
      />
      <ChevronSvg
        size={15}
        style={{
          transform: `translate(2px, ${0 - iconOffset}px)`,
          transition: 'transform 0.2s ease',
        }}
      />
    </ChevronContainer>
  );
};

// adapted from reactjs.org
const ChevronSvg = ({ size = 10, className = '', style }) => (
  <svg
    className={className}
    style={style || {}}
    viewBox="0 0 926.23699 573.74994"
    version="1.1"
    x="0px"
    y="0px"
    width={size}
    height={size}
  >
    <g transform="translate(904.92214,-879.1482)">
      <path
        d={`
          m -673.67664,1221.6502 -231.2455,-231.24803 55.6165,
          -55.627 c 30.5891,-30.59485 56.1806,-55.627 56.8701,-55.627 0.6894,
          0 79.8637,78.60862 175.9427,174.68583 l 174.6892,174.6858 174.6892,
          -174.6858 c 96.079,-96.07721 175.253196,-174.68583 175.942696,
          -174.68583 0.6895,0 26.281,25.03215 56.8701,
          55.627 l 55.6165,55.627 -231.245496,231.24803 c -127.185,127.1864
          -231.5279,231.248 -231.873,231.248 -0.3451,0 -104.688,
          -104.0616 -231.873,-231.248 z
        `}
        fill="currentColor"
      />
    </g>
  </svg>
);

const ChevronContainer = styled.div`
  user-select: none;
  width: 20px;
  height: 20px;
  align-self: center;
  display: flex;
  flex-direction: column;
  direction: ltr;
  color: ${props => props.theme.colors.primary.main};
`;
