// import { observer } from 'mobx-react';
import * as React from 'react';
import { ContributorGroup } from './ContributorGroup';
import { mapWithLast } from '../../utils';
import { ContributorModel } from '../../services/models/Contributor';

import {
  InfoSpanBox,
  InfoSpanBoxWrap,
} from './../ApiInfo/styled.elements';
function safePush(obj, prop, item) {
  if (!obj[prop]) {
    obj[prop] = [];
  }
  obj[prop].push(item);
}
export interface ContributorProps {
  contributor: ContributorModel[];
}

const CONTRIBUTOR_PLACES = ['contributor'];

export class Contributor extends React.Component<ContributorProps> {
  orderParams(params: ContributorModel[]): Record<string, ContributorModel[]> {
    const res = {};
    params.forEach(param => {
      safePush(res, 'contributor', param);
    });
    return res;
  }
  render() {
    const { contributor = [] } = this.props;
    const paramsMap = this.orderParams(contributor);
    const contributorPlaces = contributor.length > 0 ? CONTRIBUTOR_PLACES : [];
  
    return (
           <>   
            Contributed by:{' '}
            <InfoSpanBoxWrap> <InfoSpanBox>

              {contributorPlaces.map(place => (
                mapWithLast(paramsMap[place], (contributorDetails, isLast) => (
                  <ContributorGroup  place={place} contributors={paramsMap[place]} field = {contributorDetails} isLast = {isLast} />
              ))
              ))}

            </InfoSpanBox></InfoSpanBoxWrap>
           </>
        
          );
  }
}
