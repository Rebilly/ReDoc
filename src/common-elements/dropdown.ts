import Dropdown from '@redocly/react-dropdown-aria';

import styled from '../styled-components';

export interface DropdownOption {
  idx: number;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (option: DropdownOption) => void;
  ariaLabel: string;
}

export const StyledDropdown = styled(Dropdown)`
  && {
    box-sizing: border-box;
    min-width: 100px;
    outline: none;
    display: inline-block;
    border-radius: 2px;
    border: 1px solid rgba(38, 50, 56, 0.5);
    vertical-align: bottom;
    padding: 2px 0px 2px 6px;
    position: relative;
    width: auto;
    background: white;
    color: #263238;
    font-family: ${(props) => props.theme.typography.headings.fontFamily};
    font-size: 0.929em;
    line-height: 1.5em;
    cursor: pointer;
    transition: border 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
    &:hover,
    &:focus-within {
      border: 1px solid ${(props) => props.theme.colors.primary.main};
      color: ${(props) => props.theme.colors.primary.main};
      box-shadow: 0px 0px 0px 1px ${(props) => props.theme.colors.primary.main};
    }
    .dropdown-selector {
      display: inline-flex;
      padding: 0;
      height: auto;
      position: relative;
    }
    .dropdown-selector-value {
      font-family: ${(props) => props.theme.typography.headings.fontFamily};
      position: relative;
      font-size: 0.929em;
      width: 100%;
      line-height: normal;
      vertical-align: middle;
      color: #263238;
      left: 0;
      transition: color 0.25s ease, text-shadow 0.25s ease;
    }
    .dropdown-arrow {
      position: static;
      border-color: ${(props) => props.theme.colors.primary.main} transparent transparent;
      border-style: solid;
      border-width: 0.35em 0.35em 0;
      width: 0;
      height: 0;
      svg {
        display: none;
      }
    }

    .dropdown-selector-content {
      position: absolute;
      margin-top: 2px;
      left: -2px;
      right: 0;

      z-index: 10;
      min-width: 100px;

      background: white;
      border: 1px solid rgba(38, 50, 56, 0.2);
      box-shadow: 0px 2px 4px 0px rgba(34, 36, 38, 0.12), 0px 2px 10px 0px rgba(34, 36, 38, 0.08);

      max-height: 220px;
      overflow: auto;
    }

    .dropdown-option {
      font-size: 0.9em;
      color: #263238;
      cursor: pointer;
      padding: 0.4em;
      background-color: #ffffff;

      &[aria-selected='true'] {
        background-color: rgba(0, 0, 0, 0.05);
      }

      &:hover {
        background-color: rgba(38, 50, 56, 0.12);
      }
    }
    input {
      cursor: pointer;
      height: 1px;
      background-color: transparent;
    }
  }
`;

export const SimpleDropdown = styled(StyledDropdown)`
  && {
    margin-left: 10px;
    text-transform: none;
    font-size: 0.969em;

    font-size: 1em;
    border: none;
    padding: 0 1.2em 0 0;
    background: transparent;

    &:hover,
    &:focus-within {
      border: none;
      box-shadow: none;
      .dropdown-selector-value {
        color: ${(props) => props.theme.colors.primary.main};
        text-shadow: 0px 0px 0px ${(props) => props.theme.colors.primary.main};
      }
    }
  }
`;

export const MimeLabel = styled.span`
  margin-left: 10px;
  text-transform: none;
  font-size: 0.929em;
  color: black;
`;
