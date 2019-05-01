import { SECTION_ATTR } from '../services/MenuStore';
import styled, { media } from '../styled-components';

export const MiddlePanel = styled.div`
  width: calc(100% - ${props => props.theme.rightPanel.width});
  padding: 0 ${props => props.theme.spacing.sectionHorizontal}px;

  ${media.lessThan('medium', true)`
    width: 100%;
    padding: ${props =>
      `${props.theme.spacing.sectionVertical}px ${props.theme.spacing.sectionHorizontal}px`};
  `};
`;

export const Section = styled.div.attrs(props => ({
  [SECTION_ATTR]: props.id,
  className: props.className ? `section ${props.className}` : 'section',
})) <{ underlined?: boolean }>`
  padding: ${props => props.theme.spacing.sectionVertical}px 0;

  &:last-child {
    min-height: calc(100vh + 1px);
  }

  & > &:last-child {
    min-height: initial;
  }

  ${media.lessThan('medium', true)`
    padding: 0;
  `}
  ${(props: any) =>
    (props.underlined &&
      `
    position: relative;

    &:not(:last-of-type):after {
      position: absolute;
      bottom: 0;
      width: 100%;
      display: block;
      content: '';
      border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    }
  `) ||
    ''}
`;

export const RightPanel = styled.div`
  width: ${props => props.theme.rightPanel.width};
  color: ${({ theme }) => theme.rightPanel.textColor};
  background-color: ${props => props.theme.rightPanel.backgroundColor};
  padding: 0 ${props => props.theme.spacing.sectionHorizontal}px;

  ${media.lessThan('medium', true)`
    width: 100%;
    padding: ${props =>
      `${props.theme.spacing.sectionVertical}px ${props.theme.spacing.sectionHorizontal}px`};
  `};
`;

export const DarkRightPanel = styled(RightPanel)`
  background-color: ${props => props.theme.rightPanel.backgroundColor};
`;

export const Row = styled.div`
  display: flex;
  width: 100%;
  padding: 0;

  ${media.lessThan('medium', true)`
    flex-direction: column;
  `};
`;
