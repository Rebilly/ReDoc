import { H1, MiddlePanel } from '../../common-elements';
import styled, { extensionsHook } from '../../styled-components';

const delimiterWidth = 15;

export const ApiInfoWrap = MiddlePanel;

export const ApiHeader = styled(H1)`
  margin-top: 0;
  margin-bottom: 0.5em;

  ${extensionsHook('ApiHeader')};
`;

export const DownloadButton = styled.a`
  border: 1px solid ${props => props.theme.colors.primary.main};
  color: ${props => props.theme.colors.primary.main};
  font-weight: normal;
  margin-left: 0.5em;
  padding: 4px 8px 4px;
  display: inline-block;
  text-decoration: none;
  cursor: pointer;

  ${extensionsHook('DownloadButton')};
`;

export const InfoSpan = styled.span`
  &::before {
    content: '|';
    display: ${props => (props.theme.typography.direction === 'ltr') ? 'inline-block' : 'none'};
    opacity: 0.5;
    width: ${delimiterWidth}px;
    text-align: center;
  }

  &::after {
    content: '|';
    display: ${props => (props.theme.typography.direction === 'rtl') ? 'inline-block' : 'none'};
    opacity: 0.5;
    width: ${delimiterWidth}px;
    text-align: center;
  }

  &:last-child::after {
    display: none;
  }
`;

export const InfoSpanBoxWrap = styled.div`
  overflow: hidden;
`;

export const InfoSpanBox = styled.div`
  display: flex;
  flex-wrap: wrap;
  // hide separator on new lines: idea from https://stackoverflow.com/a/31732902/1749888
  margin-left: -${delimiterWidth}px;
`;
