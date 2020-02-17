import styled from '../styled-components';

export const Button = styled.button`
  background: #248fb2;
  border-radius: 0px;
  border: none;
  color: white;
  font-size: 0.929em;
  padding: 5px;
`;

export const SubmitButton = styled(Button)`
  background: ${props => props.theme.colors.primary.main}
  padding: 10px 30px;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  outline: none;
  margin: 1em 0;
  min-width: 60px;
  font-weight: bold;
  order: 1;
`;
