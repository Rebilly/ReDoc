// import { transparentize } from 'polished';

import { UnderlinedHeader } from '../../common-elements';
import styled from '../../styled-components';
import { ResponseTitle } from './ResponseTitle';

export const StyledResponseTitle = styled(ResponseTitle)`
  padding: 10px;
  border-radius: 2px;
  margin-bottom: 4px;
  line-height: 1.5em;
  background-color: #f2f2f2;
  cursor: pointer;
  text-align:${({ theme }) => (theme.typography.direction === 'rtl') ? 'right' : 'left'};
  color: ${props => props.theme.colors.responses[props.type].color};
  background-color: ${props => props.theme.colors.responses[props.type].backgroundColor};

  ${props =>
    (props.empty &&
      `
cursor: default;
&::before {
  content: "—";
  font-weight: bold;
  width: 1.5em;
  text-align: center;
  display: inline-block;
}
`) ||
    ''};
`;

export const ResponseDetailsWrap = styled.div`
  padding: 10px;
`;

export const HeadersCaption = styled(UnderlinedHeader.withComponent('caption'))`
  text-align: ${({ theme }) => (theme.typography.direction === 'rtl') ? 'right' : 'left'};
  margin-top: 1em;
  caption-side: top;
`;
