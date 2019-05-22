import { action, observable } from 'mobx';
import { querySelector } from '../utils/dom';
import { SpecStore } from './models';

import { history as historyInst, HistoryService } from './HistoryService';
import { ScrollService } from './ScrollService';

import { flattenByProp, SECURITY_SCHEMES_SECTION_PREFIX } from '../utils';
// import { GROUP_DEPTH } from './MenuBuilder';

export type MenuItemGroupType = 'group' | 'tag' | 'section';
export type MenuItemType = MenuItemGroupType | 'operation';

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

  collapsible?: boolean;

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
        const el = this.getElementAt(itemIdx + 1);
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
    this.activate(this.flatItems[itemIdx], true, true);
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
    if (item.type === 'group') {
      // group attempts to return first child - likely requires a smarter
      // search function for highly-nested values, however at this time this
      // should be enough.
      return this.getElementAt(item.items[0].absoluteIdx || -1);
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
   * @param rewriteHistory [false] whether to rewrite browser history (do not create new enrty)
   */
  @action
  activate(
    item: IMenuItem | undefined,
    updateLocation: boolean = true,
    rewriteHistory: boolean = false,
    activateFirstChild: boolean = true,
  ) {
    if ((this.activeItem && this.activeItem.id) === (item && item.id)) {
      return;
    }
    this.deactivate(this.activeItem);

    if (!item || item.collapsible === false) {
      this.history.replace('', rewriteHistory);
      this.activeItemIdx = -1;
      return;
    }

    this.activeItemIdx = item.absoluteIdx || -1;

    if (updateLocation) {
      this.history.replace(item.id, rewriteHistory);
    }

    if (item.type === 'group' && activateFirstChild) {
      this.activate(item.items[0], updateLocation, rewriteHistory);
    } else {
      item.activate();
      item.expand();
    }
  }

  /**
   * Collapsed the given item without collapsing all parent items like
   * `deactivate` does.  This is used to close a group item when clicked
   * if it is already expanded.
   *
   * @param {IMenuItem} item
   */
  collapse(item: IMenuItem, updateScrollPosition: boolean = true) {
    this.activate(item.parent, true, true, false);
    if (updateScrollPosition) {
      const activeItem = this.activeItem;
      if (item.items.length > 0) {
        this.scroll.scrollIntoView(this.getElementAt(item.absoluteIdx || -1));
      } else if (!activeItem) {
        const parentIdx = (item.parent && item.parent.absoluteIdx) || -1;
        this.scroll.scrollIntoView(this.getElementAt(parentIdx));
      } else {
        this.scroll.scrollIntoView(this.getElementAt(activeItem.absoluteIdx || -1));
      }
    }
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
      item.collapse();
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
    this.scroll.scrollIntoView(this.getElementAt(this.activeItemIdx));
  }

  dispose() {
    this._unsubscribe();
    this._hashUnsubscribe();
  }
}
