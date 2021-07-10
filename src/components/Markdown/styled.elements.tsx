import { headerCommonMixin, linkifyMixin } from '../../common-elements';
import { PrismDiv } from '../../common-elements/PrismDiv';
import styled, { css, extensionsHook, ResolvedThemeInterface } from '../../styled-components';

import { StyledComponent } from 'styled-components';

export const linksCss = css`
  a {
    text-decoration: ${props => props.theme.typography.links.textDecoration};
    color: ${props => props.theme.typography.links.color};

    &:visited {
      color: ${props => props.theme.typography.links.visited};
    }

    &:hover {
      color: ${props => props.theme.typography.links.hover.color};
      text-decoration: ${props => props.theme.typography.links.hover.textDecoration};
    }
  }
`;

export const StyledMarkdownBlock = styled(
  PrismDiv as StyledComponent<
    'div',
    ResolvedThemeInterface,
    { compact?: boolean; inline?: boolean }
  >,
)`

  font-family: ${props => props.theme.typography.fontFamily};
  font-weight: ${props => props.theme.typography.fontWeightRegular};
  line-height: ${props => props.theme.typography.lineHeight};

  p {
    &:last-child {
      margin-bottom: 0;
    }
  }

  ${({ compact }) =>
    compact &&
    `
    p:first-child {
      margin-top: 0;
    }
    p:last-child {
      margin-bottom: 0;
    }
  `}

  ${({ inline }) =>
    inline &&
    ` p {
    display: inline-block;
  }`}

  h1 {
    ${headerCommonMixin(1)};
    color: ${props => props.theme.colors.primary.main};
    margin-top: 0;
  }

  h2 {
    ${headerCommonMixin(2)};
    color: ${props => props.theme.colors.text.primary};
  }

  code {
    color: ${({ theme }) => theme.typography.code.color};
    background-color: ${({ theme }) => theme.typography.code.backgroundColor};

    font-family: ${props => props.theme.typography.code.fontFamily};
    border-radius: 2px;
    border: 1px solid rgba(38, 50, 56, 0.1);
    padding: 0 ${({ theme }) => theme.spacing.unit}px;
    font-size: ${props => props.theme.typography.code.fontSize};
    font-weight: ${({ theme }) => theme.typography.code.fontWeight};

    word-break: break-word;
  }

  pre {
    font-family: ${props => props.theme.typography.code.fontFamily};
    white-space:${({ theme }) => (theme.typography.code.wrap ? 'pre-wrap' : 'pre')};
    background-color: ${({ theme }) => theme.codeBlock.backgroundColor};
    color: white;
    padding: ${props => props.theme.spacing.unit * 4}px;
    overflow-x: auto;
    line-height: normal;
    border-radius: 0px;
    border: 1px solid rgba(38, 50, 56, 0.1);

    code {
      background-color: transparent;
      color: white;
      padding: 0;

      &:before,
      &:after {
        content: none;
      }
    }
  }

  blockquote {
    margin: 0;
    margin-bottom: 1em;
    padding: 0 15px;
    color: #777;
    border-left: 4px solid #ddd;
  }

  img {
    max-width: 100%;
    box-sizing: content-box;
  }

  ul,
  ol {
    padding-left: 2em;
    margin: 0;
    margin-bottom: 1em;

    ul, ol {
      margin-bottom: 0;
      margin-top: 0;
    }
  }

  table {
    display: block;
    width: 100%;
    overflow: auto;
    word-break: normal;
    word-break: keep-all;
    border-collapse: collapse;
    border-spacing: 0;
    margin-top: 1.5em;
    margin-bottom: 1.5em;
  }

  table tr {
    background-color: #fff;
    border-top: 1px solid #ccc;

    &:nth-child(2n) {
      background-color: ${({ theme }) => theme.schema.nestedBackground};
    }
  }

  table th,
  table td {
    padding: 6px 13px;
    border: 1px solid #ddd;
  }

  table th {
    text-align: left;
    font-weight: bold;
  }

  ${linkifyMixin('.share-link')};

  ${linksCss}

  ${extensionsHook('Markdown')};
`;
