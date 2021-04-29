// import { transparentize } from 'polished';

import styled, { extensionsHook, media } from '../styled-components';
import { deprecatedCss } from './mixins';


export const PropertyCell = styled.td<{ kind?: string }>`
  border-left: 1px solid ${props => props.theme.schema.linesColor};
  box-sizing: border-box;
  position: relative;
  padding: 10px 10px 10px 0;

  ${media.lessThan('small')`
    display: block;
    overflow: hidden;
  `}

  tr:first-of-type > &,
  tr.last > & {
    border-left-width: 0;
    background-position: top left;
    background-repeat: no-repeat;
    background-size: 1px 100%;
  }

  tr:first-of-type > & {
    background-image: linear-gradient(
      to bottom,
      transparent 0%,
      transparent 22px,
      ${props => props.theme.schema.linesColor} 22px,
      ${props => props.theme.schema.linesColor} 100%
    );
  }

  tr.last > & {
    background-image: linear-gradient(
      to bottom,
      ${props => props.theme.schema.linesColor} 0%,
      ${props => props.theme.schema.linesColor} 22px,
      transparent 22px,
      transparent 100%
    );
  }

  tr.last + tr > & {
    border-left-color: transparent;
  }

  tr.last:first-child > & {
    background: none;
    border-left-color: transparent;
  }
`;

export const PropertyCellWithInner = styled(PropertyCell)`
  padding: 0;
`;

export const PropertyNameCell = styled(PropertyCell)`
  vertical-align: top;
  line-height: 20px;
  white-space: nowrap;
  font-size: 13px;
  font-family: ${(props) => props.theme.typography.code.fontFamily};

  &.deprecated {
    ${deprecatedCss};
  }

  ${({ kind }) => (kind !== 'field' ? 'font-style: italic' : '')};

  ${extensionsHook('PropertyNameCell')};
`;

export const PropertyDetailsCell = styled.td`
  border-bottom: 1px solid #9fb4be;
  padding: 10px 0;
  width: ${(props) => props.theme.schema.defaultDetailsWidth};
  box-sizing: border-box;

  tr.expanded & {
    border-bottom: none;
  }

  ${media.lessThan('small')`
    padding: 0 20px;
    border-bottom: none;
    border-left: 1px solid ${(props) => props.theme.schema.linesColor};

    tr.last > & {
      border-left: none;
    }
  `}

  ${extensionsHook('PropertyDetailsCell')};
`;

export const PropertyBullet = styled.span`
  color: ${props => props.theme.schema.linesColor};
  font-family: ${props => props.theme.typography.code.fontFamily};
  margin-right: 10px;

  &::before {
    content: '';
    display: inline-block;
    vertical-align: middle;
    width: 10px;
    height: 1px;
    background: ${props => props.theme.schema.linesColor};
  }

  &::after {
    content: '';
    display: inline-block;
    vertical-align: middle;
    width: 1px;
    background: ${props => props.theme.schema.linesColor};
    height: 7px;
  }
`;

export const InnerPropertiesWrap = styled.div`
  padding: ${({ theme }) => theme.schema.nestingSpacing};
`;

export const PropertiesTable = styled.table`
  border-collapse: separate;
  border-radius: 3px;
  font-size: ${props => props.theme.typography.fontSize};

  border-spacing: 0;
  width: 100%;

  > tr {
    vertical-align: middle;
  }

  ${media.lessThan('small')`
    display: block;
    > tr, > tbody > tr {
      display: block;
    }
  `}

  ${media.lessThan('small', false, ' and (-ms-high-contrast:none)')`
    td {
      float: left;
      width: 100%;
    }
  `}

  &
    ${InnerPropertiesWrap},
    &
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap},
    &
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap} {
    margin: ${({ theme }) => theme.schema.nestingSpacing};
    margin-right: 0;
    background: ${({ theme }) => theme.schema.nestedBackground};
  }

  &
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap},
    &
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap},
    &
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap}
    ${InnerPropertiesWrap} {
    background: #ffffff;
  }
`;
