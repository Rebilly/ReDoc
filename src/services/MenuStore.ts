import { action, observable } from 'mobx';
import { querySelector } from '../utils/dom';
import { FieldModel, SpecStore } from './models';

import { history as historyInst, HistoryService } from './HistoryService';
import { ScrollService } from './ScrollService';

import { flattenByProp, SECURITY_SCHEMES_SECTION_PREFIX } from '../utils';
import { GROUP_DEPTH } from './MenuBuilder';

export type MenuItemGroupType = 'group' | 'tag' | 'section';
export type MenuItemType = MenuItemGroupType | 'operation' | 'field';

/** Generic interface for MenuItems */
export interface IMenuItem {
  id: string;
  absoluteIdx?: number;
  name: string;
  description?: string;
  depth: number;
  active: boolean;
  expanded: boolean;
  items: IMenuItem[];
  parent?: IMenuItem;
  deprecated?: boolean;
  type: MenuItemType;

  deactivate(): void;
  activate(): void;

  collapse(): void;
  expand(): void;
}

export const SECTION_ATTR = 'data-section-id';

/**
 * Stores all side-menu related information
 */
export class MenuStore {
  /**
   * Statically try update scroll position
   * Used before hydrating from server-side rendered html to scroll page faster
   */
  static updateOnHistory(id: string = historyInst.currentId, scroll: ScrollService) {
    if (!id) {
      return;
    }
    scroll.scrollIntoViewBySelector(`[${SECTION_ATTR}="${id}"]`);
  }

  /**
   * active item absolute index (when flattened). -1 means nothing is selected
   */
  @observable
  activeItemIdx: number = -1;

  /**
   * whether sidebar with menu is opened or not
   */
  @observable
  sideBarOpened: boolean = false;

  items: IMenuItem[];
  flatItems: IMenuItem[];

  imagesLoaded: boolean = false;

  /**
   * cached flattened menu items to support absolute indexing
   */
  private _unsubscribe: () => void;
  private _hashUnsubscribe: () => void;

  /**
   *
   * @param spec [SpecStore](#SpecStore) which contains page content structure
   * @param scroll scroll service instance used by this menu
   */
  constructor(spec: SpecStore, public scroll: ScrollService, public history: HistoryService) {
    this.items = spec.contentItems;

    this.flatItems = flattenByProp(this.items || [], 'items');
    this.flatItems.forEach((item, idx) => (item.absoluteIdx = idx));

    this.subscribe();
  }

  subscribe() {
    this._unsubscribe = this.scroll.subscribe(this.updateOnScroll);
    this._hashUnsubscribe = this.history.subscribe(this.updateOnHistory);
  }

  @action
  toggleSidebar() {
    this.sideBarOpened = this.sideBarOpened ? false : true;
  }

  @action
  closeSidebar() {
    this.sideBarOpened = false;
  }

  /**
   * update active items on scroll
   * @param isScrolledDown whether last scroll was downside
   */
  updateOnScroll = (isScrolledDown: boolean): void => {
    const step = isScrolledDown ? 1 : -1;
    let itemIdx = this.activeItemIdx;
    while (true) {
      if (itemIdx === -1 && !isScrolledDown) {
        break;
      }

      if (itemIdx >= this.flatItems.length - 1 && isScrolledDown) {
        break;
      }

      if (isScrolledDown) {
        const el = this.getElementAtOrFirstChild(itemIdx + 1);
        if (this.scroll.isElementBellow(el)) {
          break;
        }
      } else {
        const el = this.getElementAt(itemIdx);
        if (this.scroll.isElementAbove(el)) {
          break;
        }
      }
      itemIdx += step;
    }

    let item: FieldModel | undefined = this.flatItems[itemIdx] as FieldModel;
    while (item && item.type === 'field' && item.parent && item.parent.type === 'field' && !item.parent.expanded ||
            item && item.containerContentModel !== undefined && item.containerContentModel.activeMimeIdx !== item.activeContentModel ||
            item && item.responseContainer && !item.responseContainer.expanded ||
            item && item.containerOneOf !== undefined && item.containerOneOf.activeOneOf !== item.activeOneOf) {
      itemIdx += step;
      item = this.flatItems[itemIdx] as FieldModel;
    }

    this.activate(item, true, true);
  };

  /**
   * update active items on hash change
   * @param id current hash
   */
  updateOnHistory = (id: string = this.history.currentId) => {
    if (!id) {
      return;
    }
    let item: IMenuItem | undefined;

    item = this.flatItems.find(i => i.id === id);
    if (item) {
      this.activateAndScroll(item, false);
    } else {
      if (id.startsWith(SECURITY_SCHEMES_SECTION_PREFIX)) {
        item = this.flatItems.find(i => SECURITY_SCHEMES_SECTION_PREFIX.startsWith(i.id));
        this.activate(item);
      }
      this.scroll.scrollIntoViewBySelector(`[${SECTION_ATTR}="${id}"]`);
    }
  };

  /**
   * get section/operation DOM Node related to the item or null if it doesn't exist
   * @param idx item absolute index
   */
  getElementAt(idx: number): Element | null {
    const item = this.flatItems[idx];
    return (item && querySelector(`[${SECTION_ATTR}="${item.id}"]`)) || null;
  }

  /**
   * get section/operation DOM Node related to the item or if it is group item, returns first item of the group
   * @param idx item absolute index
   */
  getElementAtOrFirstChild(idx: number): Element | null {
    let item = this.flatItems[idx];
    if (item && item.type === 'group') {
      item = item.items[0];
    }
    return (item && querySelector(`[${SECTION_ATTR}="${item.id}"]`)) || null;
  }

  /**
   * current active item
   */
  get activeItem(): IMenuItem {
    return this.flatItems[this.activeItemIdx] || undefined;
  }

  getItemById = (id: string) => {
    return this.flatItems.find(item => item.id === id);
  };

  /**
   * activate menu item
   * @param item item to activate
   * @param updateLocation [true] whether to update location
   * @param rewriteHistory [false] whether to rewrite browser history (do not create new entry)
   */
  @action
  activate(
    item: IMenuItem | undefined,
    updateLocation: boolean = true,
    rewriteHistory: boolean = false,
  ) {
    if ((this.activeItem && this.activeItem.id) === (item && item.id)) {
      return;
    }

    if (item && item.type === 'group') {
      return;
    }

    this.deactivate(this.activeItem);
    if (!item) {
      this.history.replace('', rewriteHistory);
      return;
    }

    // do not allow activating group items
    // TODO: control over options
    if (item.depth <= GROUP_DEPTH) {
      return;
    }

    this.activeItemIdx = item.absoluteIdx!;
    if (updateLocation) {
      this.history.replace(item.id, rewriteHistory);
    }

    item.activate();
    item.expand();
  }

  /**
   * makes item and all the parents not active
   * @param item item to deactivate
   */
  deactivate(item: IMenuItem | undefined) {
    if (item === undefined) {
      return;
    }
    item.deactivate();
    while (item !== undefined) {
      if (item.type !== 'field') {
        item.collapse();
      }
      item = item.parent;
    }
  }

  /**
   * activate menu item and scroll to it
   * @see MenuStore.activate
   */
  @action.bound
  activateAndScroll(
    item: IMenuItem | undefined,
    updateLocation?: boolean,
    rewriteHistory?: boolean,
  ) {
    // item here can be a copy from search results so find corresponding item from menu
    const menuItem = (item && this.getItemById(item.id)) || item;
    this.activate(menuItem, updateLocation, rewriteHistory);
    this.scrollToActive();
    if (!menuItem || !menuItem.items.length) {
      this.closeSidebar();
    }
  }

  /**
   * scrolls to active section
   */
  scrollToActive(): void {
    const active = this.activeItemIdx;
    const element = this.getElementAt(active);
    if (element === null || !this.imagesLoaded) {
      setTimeout(() => {
        this.activeItemIdx = active;
        this.scrollToActive();
        this.imagesLoaded = true;
      }, this.imagesLoaded ? 500 : 100);
    } else {
      this.scroll.scrollIntoView(element);
    }
  }

  dispose() {
    this._unsubscribe();
    this._hashUnsubscribe();
  }
}
