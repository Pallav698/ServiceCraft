import { LightningElement, api } from "lwc";
import { updateRecord } from "lightning/uiRecordApi";
import ID_FIELD from "@salesforce/schema/Case.Id";
import IS_ESCALATED_FIELD from "@salesforce/schema/Case.IsEscalated";
import STATUS_FIELD from "@salesforce/schema/Case.Status";
import LightningAlert from "lightning/alert";
import scCommentsModal from "c/scCommentsModal";
export default class ScDisplayCases extends LightningElement {
  @api cases;

  async handleClick(event) {
    const action = event.target.name;
    const caseRec = event.target.value;

    if (action === "escalate") {
      this.handleEscalateClick(caseRec);
    }

    if (action === "reopen") {
      this.handleReopenClick(caseRec);
    }

    if (action === "comment") {
      //open comments modal
      const commentsModalResult = await scCommentsModal.open({
        size: "medium",
        description: "Case Comments",
        caseId: caseRec.Id
      });

      if (commentsModalResult === "refresh") {
        this.notifyCaseUpdate(false, true);
      }
    }
  }

  handleReopenClick(caseRec) {
    this.notifyCaseUpdate(true, false);
    const fields = {};
    fields[ID_FIELD.fieldApiName] = caseRec.Id;
    fields[STATUS_FIELD.fieldApiName] = "Open";
    const recordInput = { fields };
    this.updateCaseRecord(recordInput, "reopened");
  }

  updateCaseRecord(recordInput, updateType) {
    updateRecord(recordInput)
      .then(() => {
        this.notifyCaseUpdate(false, true);
        this.showToast(
          "Success",
          "Case " + updateType + " successfully",
          "success"
        );
      })
      .catch((error) => {
        this.notifyCaseUpdate(false, false);
        this.showToast(
          "Error",
          "Error " + updateType + " case: " + error.message,
          "error"
        );
        console.error("Error " + updateType + " case: ", error);
      });
  }

  handleEscalateClick(caseRec) {
    this.notifyCaseUpdate(true, false);
    const fields = {};
    fields[ID_FIELD.fieldApiName] = caseRec.Id;
    fields[IS_ESCALATED_FIELD.fieldApiName] = true;
    fields[STATUS_FIELD.fieldApiName] = "Escalated";
    const recordInput = { fields };
    this.updateCaseRecord(recordInput, "escalated");
  }

  async showToast(title, message, variant) {
    const theme =
      variant === "success" || variant === "error" || variant === "warning"
        ? variant
        : "info";
    await LightningAlert.open({
      message,
      theme,
      label: title
    });
  }

  //notify parent to refresh cases after case updates
  notifyCaseUpdate(showSpinner, refreshCases) {
    this.dispatchEvent(
      new CustomEvent("caseupdated", {
        detail: {
          showSpinner: showSpinner,
          refreshCases: refreshCases
        }
      })
    );
  }
}
