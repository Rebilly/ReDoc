import {lighten} from 'polished';
import styled from '../../styled-components';

export const ConsoleEditorWrapper = styled.div`
  font-family: ${props => props.theme.typography.code.fontFamily};
  font-size: ${props => props.theme.typography.code.fontSize} !important;
  direction: ltr;
  white-space: ${({ theme }) => (theme.typography.code.wrap ? 'pre-wrap' : 'pre')};
  contain: content;
  overflow-x: auto;
  background: #11171a !important;
  padding: 5px 0;

  & .ace_editor {
    background: #11171a !important;
    width: 100% !important;
  }
  & .ace_editor .ace_marker-layer .ace_selection, & .ace_editor .ace_marker-layer .ace_selected-word {
    background: ${lighten(0.05, '#11171a')} !important;
    border-color: ${lighten(0.05, '#11171a')} !important;
  }
  & .ace_editor .ace_marker-layer .ace_active-line {
    background: rgba(0, 0, 0, 0.2);
  }
  & .ace_editor .ace_line, & .ace_editor .ace_cursor {
    color: #aaa;
  }
  & .ace_editor .ace_marker-layer .ace_bracket {
    border: none !important;
  }
  & .ace_editor .ace_line .ace_fold {
    background: none !important;
    color: #aaa;
    border: none;
  }
  & .ace_editor .ace_line .ace_fold:hover {
    background: none !important;
  }
  & .ace_editor .ace_string {
    color: #71e4ff;
  }
  & .ace_editor .ace_variable {
    color: #a0fbaa;
  }
  & .ace_editor .ace_indent-guide {
    background: none;
    color: rgba(255, 255, 255, 0.3)
  }
  & .ace_editor .ace_indent-guide::after {
    content: "|";
  }
  & .ace_editor .ace_gutter {
    background: ${lighten(0.01, '#11171a')} !important;
    color: #fff !important;
  }
  & .ace_editor .ace_gutter .ace_fold-widget {
    background-image: none;
  }
  & .ace_editor .ace_gutter .ace_fold-widget.ace_open::after {
    content: "-";
  }
  & .ace_editor .ace_gutter .ace_fold-widget.ace_closed::after {
    content: "+";
  }
  & .ace_editor .ace_gutter .ace_gutter-active-line {
    background: rgba(0, 0, 0, 0.2) !important;
  }
  & .ace_editor .ace_gutter .ace_gutter-cell.ace_error {
    background: none !important;
  }
  & .ace_editor .ace_gutter .ace_gutter-cell.ace_error::before {
    position: absolute;
    color: red;
    content: "X";
    left: 0.5em;
  }
`;
