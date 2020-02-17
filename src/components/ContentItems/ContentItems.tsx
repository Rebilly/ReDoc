import { observer } from 'mobx-react';
import * as React from 'react';
import { AppStore } from '../../services';

import { ExternalDocumentation } from '../ExternalDocumentation/ExternalDocumentation';
import { AdvancedMarkdown } from '../Markdown/AdvancedMarkdown';

import { H1, H2, MiddlePanel, Row, Section, ShareLink } from '../../common-elements';
import { ContentItemModel } from '../../services/MenuBuilder';
import { GroupModel } from '../../services/models';
import { Operation } from '../Operation/Operation';

export interface ContentItemsProps {
  items: ContentItemModel[];
  store: AppStore;
}

@observer
export class ContentItems extends React.Component<ContentItemsProps> {
  render() {
    const { items, store } = this.props;
    if (items.length === 0) {
      return null;
    }
    return items.map(item => <ContentItem store={store} item={item} key={item.id} />);
  }
}

export interface ContentItemProps {
  item: ContentItemModel;
  store: AppStore;
}

@observer
export class ContentItem extends React.Component<ContentItemProps> {
  render() {
    const { item, store } = this.props;
    let content;
    const { type } = item;
    switch (type) {
      case 'group':
        content = null;
        break;
      case 'tag':
      case 'section':
        content = <SectionItem {...this.props} />;
        break;
      case 'operation':
        content = <Operation securitySchemes={store.spec.securitySchemes} operation={item as any} />;
        break;
      default:
        content = <SectionItem {...this.props} />;
    }

    return (
      <>
        {content && (
          <Section id={item.id} underlined={item.type === 'operation'}>
            {content}
          </Section>
        )}
        {item.items && <ContentItems store={store} items={item.items} />}
      </>
    );
  }
}

const middlePanelWrap = component => <MiddlePanel compact={true}>{component}</MiddlePanel>;

@observer
export class SectionItem extends React.Component<ContentItemProps> {
  render() {
    const { name, description, externalDocs, level } = this.props.item as GroupModel;

    const Header = level === 2 ? H2 : H1;
    return (
      <>
        <Row>
          <MiddlePanel compact={false}>
            <Header>
              <ShareLink to={this.props.item.id} />
              {name}
            </Header>
          </MiddlePanel>
        </Row>
        <AdvancedMarkdown source={description || ''} htmlWrap={middlePanelWrap} />
        {externalDocs && (
          <Row>
            <MiddlePanel>
              <ExternalDocumentation externalDocs={externalDocs} />
            </MiddlePanel>
          </Row>
        )}
      </>
    );
  }
}
