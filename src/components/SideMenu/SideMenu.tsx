import { observer } from 'mobx-react';
import * as React from 'react';

import { IMenuItem, MenuStore } from '../../services/MenuStore';
import { MenuItems } from './MenuItems';

import { PerfectScrollbarWrap } from '../../common-elements/perfect-scrollbar';
import { RedocAttribution } from './styled.elements';

@observer
export class SideMenu extends React.Component<{ menu: MenuStore; className?: string }> {
  private _updateScroll?: () => void;

  render() {
    const store = this.props.menu;
    return (
      <PerfectScrollbarWrap
        updateFn={this.saveScrollUpdate}
        className={this.props.className}
        options={{
          wheelPropagation: false,
        }}
      >
        <MenuItems items={store.items} onActivate={this.activate} root={true} />
        <RedocAttribution>
          <a target="_blank" href="https://github.com/Rebilly/ReDoc">
            Documentation Powered by ReDoc
          </a>
        </RedocAttribution>
      </PerfectScrollbarWrap>
    );
  }

  activate = (item: IMenuItem) => {
    if (item.expanded === true && item.items.length > 0) {
      this.props.menu.collapse(item);
    } else {
      this.props.menu.activateAndScroll(item, true);
    }
    setTimeout(() => {
      if (this._updateScroll) {
        this._updateScroll();
      }
    });
  };

  private saveScrollUpdate = upd => {
    this._updateScroll = upd;
  };
}
