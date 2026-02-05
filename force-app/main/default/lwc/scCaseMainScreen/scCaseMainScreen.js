import { LightningElement } from 'lwc';
import createCaseModal from 'c/scCreateCaseModal';
export default class ScCaseMainScreen extends LightningElement {
  handleClick(event){
    const action = event.target.name;
    if(action === 'newcase'){
        //open new case modal

        const caseModalResult = createCaseModal.open({
            size: 'medium',
            description: 'Create a new case'
        });
    }
  }
}