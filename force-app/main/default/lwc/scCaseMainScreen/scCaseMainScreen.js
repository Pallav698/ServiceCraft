import { LightningElement } from 'lwc';
import createCaseModal from 'c/scCreateCaseModal';
import getMycases from "@salesforce/apex/SCCaseController.getMycases";
export default class ScCaseMainScreen extends LightningElement {
  cases;
  isLoading = true;

  connectedCallback() {
    this.loadCases();
  }

  loadCases() {
    this.isLoading = true;
    getMycases()
      .then((result) => {
        this.isLoading = false;
        this.cases = result;
        console.log("Cases loaded: ", this.cases);
      })
      .catch((error) => {
        this.showToast(
          "Error",
          "Error fetching cases: " + error.message,
          "error"
        );
        console.error("Error fetching cases: ", error);
        this.isLoading = false;
      });
  }
  handleClick(event) {
    const action = event.target.name;
    if (action === "newcase") {
      //open new case modal

      const caseModalResult = createCaseModal.open({
        size: "medium",
        description: "Create a new case"
      });
      caseModalResult.then((result) => {
        if (result === "success") {
          this.loadCases();
        }
      });
    }
  }

  handleCaseUpdated(event) {
    const { showSpinner, refreshCases } = event.detail;
    this.isLoading = showSpinner;
    if (refreshCases) {
      this.loadCases();
    }
  }
}