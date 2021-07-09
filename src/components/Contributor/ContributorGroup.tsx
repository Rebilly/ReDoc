import * as React from 'react';
import { InfoSpan } from './../ApiInfo/styled.elements';
import { ContributorModel } from '../../services/models/Contributor';

export interface ContributorGroup {
  key:string;
  place: string;
  contributors: ContributorModel[];
  field: any;
  isLast: boolean;
}

export class ContributorGroup extends React.PureComponent<ContributorGroup, any> {
  render() {
    const { place, contributors,field,isLast } = this.props;
      console.log("isLast isLast",isLast);
    
    const contributorName =  (field && field['name'] && (
      <InfoSpan>
        { field['name']}
            </InfoSpan>
      )) ||
      null;

    const   contributorEmail =
      ( field &&  field['email'] && (
        <InfoSpan>
          <a href={'mailto:' +  field['email']}>{ field['email']}</a>
        </InfoSpan>
      )) ||
      null;

    const  contributorSupportLink = ( field &&  field['supportlink'] && (
      <InfoSpan>
        <a href={ field['supportlink']}>Support</a>
      </InfoSpan>
      )) ||
      null;

    if (!contributors || !contributors.length) {
      return null;
    }

  return (
      <div key={place}>
        {contributorName}{contributorEmail}{contributorSupportLink}
      </div>
    );
  }
}
