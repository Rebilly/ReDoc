import * as React from 'react';

import { IMenuItem } from '../../services/MenuStore';
import { SearchStore } from '../../services/SearchStore';
import { MenuItem } from '../SideMenu/MenuItem';

import { MarkerService } from '../../services/MarkerService';
import { SearchResult } from '../../services/SearchWorker.worker';

import { OptionsContext } from '../OptionsProvider';
import { RedocRawOptions } from '../../services/RedocNormalizedOptions';

import { bind, debounce } from 'decko';
import { PerfectScrollbarWrap } from '../../common-elements/perfect-scrollbar';
import {
  ClearIcon,
  SearchIcon,
  SearchInput,
  SearchResultsBox,
  SearchWrap,
} from './styled.elements';

export interface SearchBoxProps {
  search: SearchStore<string>;
  marker: MarkerService;
  getItemById: (id: string) => IMenuItem | undefined;
  onActivate: (item: IMenuItem) => void;

  className?: string;
}

export interface SearchBoxState {
  results: SearchResult[];
  term: string;
  activeItemIdx: number;
}

export class SearchBox extends React.PureComponent<SearchBoxProps, SearchBoxState> {
  activeItemRef: MenuItem | null = null;

  static contextType = OptionsContext;

  constructor(props) {
    super(props);
    this.state = {
      results: [],
      term: '',
      activeItemIdx: -1,
    };
  }

  clearResults(term: string) {
    this.setState({
      results: [],
      term,
    });
    this.props.marker.unmark();
  }

  clear = () => {
    this.setState({
      results: [],
      term: '',
      activeItemIdx: -1,
    });
    this.props.marker.unmark();
  };

  handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.keyCode === 27) {
      // ESQ
      this.clear();
    }
    if (event.keyCode === 40) {
      // Arrow down
      this.setState({
        activeItemIdx: Math.min(this.state.activeItemIdx + 1, this.state.results.length - 1),
      });
      event.preventDefault();
    }
    if (event.keyCode === 38) {
      // Arrow up
      this.setState({
        activeItemIdx: Math.max(0, this.state.activeItemIdx - 1),
      });
      event.preventDefault();
    }
    if (event.keyCode === 13) {
      // enter
      const activeResult = this.state.results[this.state.activeItemIdx];
      if (activeResult) {
        const item = this.props.getItemById(activeResult.meta);
        if (item) {
          this.props.onActivate(item);
        }
      }
    }
  };

  setResults(results: SearchResult[], term: string) {
    this.setState({
      results,
    });
    this.props.marker.mark(term);
  }

  @bind
  @debounce(400)
  searchCallback(searchTerm: string) {
    this.props.search.search(searchTerm).then((res) => {
      this.setResults(res, searchTerm);
    });
  }

  search = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { minCharacterLengthToInitSearch = 3 } = this.context as RedocRawOptions;
    const q = event.target.value;
    if (q.length < minCharacterLengthToInitSearch) {
      this.clearResults(q);
      return;
    }

    this.setState(
      {
        term: q,
      },
      () => this.searchCallback(this.state.term),
    );
  };

  render() {
    const { activeItemIdx } = this.state;
    const results = this.state.results.map((res) => ({
      item: this.props.getItemById(res.meta)!,
      score: res.score,
    }));

    results.sort((a, b) => b.score - a.score);

    return (
      <SearchWrap role="search">
        {this.state.term && <ClearIcon onClick={this.clear}>×</ClearIcon>}
        <SearchIcon />
        <SearchInput
          value={this.state.term}
          onKeyDown={this.handleKeyDown}
          placeholder="Search..."
          type="text"
          onChange={this.search}
        />
        {results.length > 0 && (
          <PerfectScrollbarWrap
            options={{
              wheelPropagation: false,
            }}
          >
            <SearchResultsBox data-role="search:results">
              {results.map((res, idx) => (
                <MenuItem
                  item={Object.create(res.item, {
                    active: {
                      value: idx === activeItemIdx,
                    },
                  })}
                  onActivate={this.props.onActivate}
                  withoutChildren={true}
                  key={res.item.id}
                  data-role="search:result"
                />
              ))}
            </SearchResultsBox>
          </PerfectScrollbarWrap>
        )}
      </SearchWrap>
    );
  }
}
