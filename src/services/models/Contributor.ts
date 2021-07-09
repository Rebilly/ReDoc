import { observable,} from 'mobx';
import { OpenAPIInfo } from '../../types'

export class ContributorModel {
   @observable
  //  contributor:[
    info: OpenAPIInfo;
    name: string;
    email: string;
    supportlink: string;
    in: string ='contributor';
  //]

  constructor( ) {
   console.log(this.info);
   }
 

}
