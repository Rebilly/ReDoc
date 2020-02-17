import styled from '../../styled-components';

export const OperationEndpointWrap = styled.div`
  cursor: pointer;
  position: relative;
  margin-bottom: 5px;
  .showToolTip {
    visibility: initial;
    background-color: white;
    color: black;
    padding: 3px;
    position: initial;
    width: 53px;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
  };
  .hideToolTip {
    visibility:hidden;
    padding: 3px;
    position: initial;
    width: 53px;
    text-align: center;
    margin-bottom: 10px;
    border-radius: 4px;
  }
`;

export const ServerRelativeURL = styled.span`
  font-family: ${props => props.theme.typography.code.fontFamily};
  margin-left: 10px;
  flex: 1;
  overflow-x: hidden;
  text-overflow: ellipsis;
`;

export const EndpointInfo = styled.div<{ expanded?: boolean; inverted?: boolean }>`
  padding: 10px 30px 10px ${props => (props.inverted ? '10px' : '20px')};
  border-radius: ${props => (props.inverted ? '0' : '4px 4px 0 0')};
  background-color: ${props =>
    props.inverted ? 'transparent' : props.theme.codeSample.backgroundColor};
  display: flex;
  white-space: nowrap;
  align-items: center;
  border: ${props => (props.inverted ? '0' : '1px solid transparent')};
  border-bottom: ${props => (props.inverted ? '1px solid #ccc' : '0')};
  transition: border-color 0.25s ease;
  direction: ltr;

  ${props =>
    (props.expanded && !props.inverted && `border-color: ${props.theme.colors.border.dark};`) || ''}

  .${ServerRelativeURL} {
    color: ${props => (props.inverted ? props.theme.colors.text.primary : '#ffffff')}
  }
`;

export const HttpVerb = styled.span.attrs((props: { type: string }) => ({
  className: `http-verb ${props.type}`,
}))<{ type: string }>`
  font-size: 0.929em;
  line-height: 20px;
  background-color: ${(props: any) => props.theme.colors.http[props.type] || '#999999'};
  color: #ffffff;
  padding: 3px 10px;
  text-transform: uppercase;
  font-family: ${props => props.theme.typography.headings.fontFamily};
  margin: 0;
`;

export const ServersOverlay = styled.div<{ expanded: boolean }>`
  position: absolute;
  width: 100%;
  z-index: 100;
  background: #fafafa;
  color: #263238;
  box-sizing: border-box;
  box-shadow: 0px 0px 6px rgba(0, 0, 0, 0.33);
  overflow: hidden;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  transition: all 0.25s ease;
  text-align: ${({ theme }) => (theme.typography.direction === 'rtl') ? 'right' : 'left'};
  ${props => (props.expanded ? '' : 'transform: translateY(-50%) scaleY(0);')}
`;

export const ServerItem = styled.div`
  padding: 10px;
  background-color: #002c2d;
  color: white;
  display: flex;
  flex-wrap: nowrap;
  &.selected {
      background-color: #3c7173;
  }
  div:first-child {
      width: 20%;
      padding-top: 5px;
      }
`;

export const ServerUrl = styled.div`
  text-align: left;
  user-select: none;
  padding: 5px !important;
  background-color: #ffffff33;
  word-break: break-all;
  width: 100% !important;
  color: #00ff1c;
  > span {
    color: white;
  };
`;
