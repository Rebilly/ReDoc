import { observer } from 'mobx-react';
import * as React from 'react';

import { SECTION_ATTR } from '../../services/MenuStore';
import { ExternalDocumentation } from '../ExternalDocumentation/ExternalDocumentation';
import { Markdown } from '../Markdown/Markdown';

import { H1, H2, MiddlePanel, Row, ShareLink } from '../../common-elements';
import { MDXComponentMeta } from '../../services/MarkdownRenderer';
import { ContentItemModel } from '../../services/MenuBuilder';
import { GroupModel, OperationModel } from '../../services/models';
import { Operation } from '../Operation/Operation';
import { SecurityDefs } from '../SecuritySchemes/SecuritySchemes';
import { StoreConsumer } from '../StoreBuilder';

@observer
export class ContentItems extends React.Component<{
  items: ContentItemModel[];
  allowedMdComponents?: Dict<MDXComponentMeta>;
}> {
  static defaultProps = {
    allowedMdComponents: {
      'security-definitions': {
        component: SecurityDefs,
        propsSelector: _store => ({
          securitySchemes: _store!.spec.securitySchemes,
        }),
      },
    },
  };

  render() {
    const items = this.props.items;
    if (items.length === 0) {
      return null;
    }
    return items.map(item => (
      <ContentItem item={item} key={item.id} allowedMdComponents={this.props.allowedMdComponents} />
    ));
  }
}

export interface ContentItemProps {
  item: ContentItemModel;
  allowedMdComponents?: Dict<MDXComponentMeta>;
}

@observer
export class ContentItem extends React.Component<ContentItemProps> {
  render() {
    const item = this.props.item;
    let content;
    const { type } = item;
    switch (type) {
      case 'group':
        content = null;
        break;
      case 'tag':
        content = <SectionItem {...this.props} />;
        break;
      case 'section':
        content = <SectionItem {...this.props} />;
        break;
      case 'operation':
        content = <OperationItem item={item as any} />;
        break;
      default:
        throw new Error('Unknown item type');
    }

    return [
      <div key="section" {...{ [SECTION_ATTR]: item.id }}>
        {content}
      </div>,
      (item as any).items && <ContentItems key="content" items={(item as any).items} />,
    ];
  }
}

@observer
export class SectionItem extends React.Component<ContentItemProps> {
  render() {
    const { name, description, externalDocs, level } = this.props.item as GroupModel;
    const components = this.props.allowedMdComponents;
    const Header = level === 2 ? H2 : H1;
    return (
      <Row>
        <MiddlePanel>
          <Header>
            <ShareLink href={'#' + this.props.item.id} />
            {name}
          </Header>
          {components ? (
            <StoreConsumer>
              {store => (
                <Markdown source={description || ''} allowedComponents={components} store={store} />
              )}
            </StoreConsumer>
          ) : (
            <Markdown source={description || ''} />
          )}
          {externalDocs && (
            <p>
              <ExternalDocumentation externalDocs={externalDocs} />
            </p>
          )}
        </MiddlePanel>
      </Row>
    );
  }
}

@observer
export class OperationItem extends React.Component<{
  item: OperationModel;
}> {
  render() {
    return <Operation operation={this.props.item} />;
  }
}
