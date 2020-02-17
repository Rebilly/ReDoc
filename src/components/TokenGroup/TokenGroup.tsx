import * as React from 'react';
import {Button, RightPanelHeader} from '../../common-elements';
import styled from '../../styled-components';

const SaveTokenButton = styled(Button)`
  padding: 10px 30px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  text-align: center;
  outline: none;
  margin: 0
  min-width: 60px;
  max-width: 100px;
  font-weight: bold;
  flex: 1 1;
  order: 2;
`;

const TokenTextField = styled.input`
  padding: 10px 30px 10px 20px;
  border-radius: 4px 0 0 4px;
  background-color: ${props => props.theme.codeSample.backgroundColor};
  color: ${props => props.theme.codeSample.textColor}
  white-space: nowrap;
  align-items: center;
  border: none;
  direction: ltr;
  min-width: 300px;
  flex: 4 1;
  order: 1;
`;

const TokenGroupContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: stretch;
  align-content: flex-start;
`;

const Description = styled.p`
  color: white;
`;

interface TokenGroupProps {
  title: string;
  description?: string;
  onSubmit: () => void;
  onChange: (value: string) => void;
}

export class TokenGroup extends React.PureComponent<TokenGroupProps> {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.change = this.change.bind(this);
  }

  submit() {
    this.props.onSubmit();
  }

  change(e) {
    this.props.onChange(e.target.value);
  }

  render() {
    return (
      <>
        <RightPanelHeader>
          {this.props.title}
        </RightPanelHeader>
        <TokenGroupContainer>
          <TokenTextField onChange={this.change} />
          <SaveTokenButton onClick={this.submit}>Save</SaveTokenButton>
        </TokenGroupContainer>
        <Description>
          {this.props.description}
        </Description>
      </>
    );
  }
}
