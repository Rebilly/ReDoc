import * as React from 'react';
import * as yaml from 'yaml-js';
import styled from '../src/styled-components';

const Button = styled.button`
  background-color: #fff;
  color: #333;
  padding: 2px 10px;
  touch-action: manipulation;
  cursor: pointer;
  user-select: none;
  border: 1px solid #ccc;
  font-size: 16px;
  height: 28px;
  box-sizing: border-box;
  vertical-align: middle;
  line-height: 1;
  outline: none;
  white-space: nowrap;

  @media (max-width: 699px) {
    display: none;
  }
`;

const Separator = styled.em`
  padding: 0 1rem;

  @media (max-width: 699px) {
    display: none;
  }
`;

export interface ClipboardImporterProps {
  onPaste?: (val: any) => void;
}

export default class ClipboardImporter extends React.Component<any, any> {
  render() {
    if (!('clipboard' in navigator)) {
      return null;
    }
    return <>
      <Button title='Import spec from clipboard' onClick={() => this.import()}>Import from 📋</Button>
      <Separator>or</Separator>
    </>;
  }

  private import() {
    navigator.clipboard.readText()
      .then(text => {
        if (!text) {
          return;
        }
        const fromYamlOrJson = yaml.load(text);
        if (fromYamlOrJson) {
          this.props.onPaste(fromYamlOrJson);
        }
      })
      .catch(() => {
        console.error('Failed to get spec from clipboard')
      })
  }
}
