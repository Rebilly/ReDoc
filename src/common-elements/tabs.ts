import { darken } from 'polished';
import { Tabs as ReactTabs } from 'react-tabs';

import styled from '../styled-components';

export { Tab, TabList, TabPanel } from 'react-tabs';

export const Tabs = styled(ReactTabs)`
  > ul {
    list-style: none;
    padding: 0;
    margin: 0;
    margin: 0 -5px;

    > li {
      padding: 5px 10px;
      display: inline-block;

      background-color: #ffffff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.5);
      cursor: pointer;
      text-align: center;
      outline: none;
      color: #333333;
      margin: 5px;
      border: 1px solid ${({ theme }) => darken(0.1, theme.rightPanel.backgroundColor)};
      border-radius: 4px;
      min-width: 60px;
      font-size: 0.9em;
      font-weight: bold;

      &.react-tabs__tab--selected {
        color: ${props => props.theme.colors.text.primary};
        border: 1px solid ${({ theme }) => theme.rightPanel.textColor};
      }

      &:only-child {
        flex: none;
        min-width: 100px;
      }

      &.tab-success {
        color: ${props => props.theme.colors.responses.success.color};
      }

      &.tab-redirect {
        color: ${props => props.theme.colors.responses.redirect.color};\
      }

      &.tab-info {
        color: ${props => props.theme.colors.responses.info.color};
      }

      &.tab-error {
        color: ${props => props.theme.colors.responses.error.color};
      }
    }
  }
  > .react-tabs__tab-panel {
    background: ${({ theme }) => theme.codeSample.backgroundColor};
    border-radius: 4px;
    & > div,
    & > pre {
      padding: 20px;
      margin: 0;
    }
  }
`;

export const SmallTabs = styled(Tabs)`
  > ul {
    display: block;
    > li {
      padding: 2px 5px;
      min-width: auto;
      margin: 0 15px 0 0;
      font-size: 13px;
      font-weight: normal;
      border-bottom: 1px dashed;
      color: ${({ theme }) => darken(theme.colors.tonalOffset, theme.rightPanel.textColor)};
      border-radius: 0;
      background: none;

      &:last-child {
        margin-right: 0;
      }

      &.react-tabs__tab--selected {
        color: ${({ theme }) => theme.rightPanel.textColor};
        background: none;
      }
    }
  }
  > .react-tabs__tab-panel {
    & > div,
    & > pre {
      padding: 10px 0;
      margin: 0;
    }
  }
`;
