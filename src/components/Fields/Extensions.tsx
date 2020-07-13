import * as React from 'react';

import { ExtensionValue, FieldLabel } from '../../common-elements/fields';

import styled from '../../styled-components';

import { AppStore } from '../../services';
import { StyledMarkdownBlock } from '../Markdown/styled.elements';
import { OptionsContext } from '../OptionsProvider';
import { StoreConsumer } from '../StoreBuilder';

const Extension = styled(StyledMarkdownBlock)`
  margin: 2px 0;
`;

export interface ExtensionComponentMeta {
  component: React.ComponentType;
  propsSelector: (store?: AppStore) => any;
  props?: object;
}

export interface ExtensionsProps {
  extensions: {
    [k: string]: any;
  };
}

export class Extensions extends React.PureComponent<ExtensionsProps> {
  renderExtensionComponent(key: string, meta: ExtensionComponentMeta) {
    const exts = this.props.extensions;

    return (
      <StoreConsumer>
        {store => (
          <meta.component
            {...{
              ...meta.props,
              ...meta.propsSelector(store),
              ...{
                [key]: exts[key],
              },
            }}
          />
        )}
      </StoreConsumer>
    );
  }

  renderSimpleExtension(key: string) {
    const exts = this.props.extensions;

    return (
      <>
        <FieldLabel> {key.substring(2)}: </FieldLabel>{' '}
        <ExtensionValue>
          {typeof exts[key] === 'string' ? exts[key] : JSON.stringify(exts[key])}
        </ExtensionValue>
      </>
    );
  }

  render() {
    const exts = this.props.extensions;
    return (
      <OptionsContext.Consumer>
        {options => (
          <>
            {options.showExtensions &&
              Object.keys(exts).map(key => (
                <Extension key={key}>
                  {options.extensionsComponents[key]
                    ? this.renderExtensionComponent(key, options.extensionsComponents[key])
                    : this.renderSimpleExtension(key)}
                </Extension>
              ))}
          </>
        )}
      </OptionsContext.Consumer>
    );
  }
}
