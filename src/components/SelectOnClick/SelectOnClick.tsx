import * as React from 'react';

import { ClipboardService } from '../../services';
import styled from '../../styled-components';

interface SelectOnClickProps {
  onSelectUrl: () => void;
}

export class SelectOnClick extends React.PureComponent<SelectOnClickProps> {
  private child: HTMLDivElement | null;
  handleClick = () => {
    ClipboardService.selectElement(this.child);
    this.props.onSelectUrl();
  };

  render() {
    const { children } = this.props;
    return (
      <SelectArea ref={el => (this.child = el)} onClick={this.handleClick.bind(this, children)}>
        {children}
      </SelectArea>
    );
  }
}
const SelectArea = styled.div`
  width: 80%;
`;
