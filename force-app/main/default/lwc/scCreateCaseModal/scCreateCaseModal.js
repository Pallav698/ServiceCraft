import { wire, api } from "lwc";
import LightningModal from "lightning/modal";
import CASE_OBJECT from "@salesforce/schema/Case";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import LightningAlert from "lightning/alert";
import createcase from "@salesforce/apex/SCCaseController.createcase";
export default class ScCreateCaseModal extends LightningModal {
  caseObjName = "Case";
  recordTypeName = "Support";
  recordTypeId;
  isLoading = true;

  //get record type id
  @wire(getObjectInfo, { objectApiName: CASE_OBJECT })
  wiredObjectInfo({ data, error }) {
    if (data) {
      const rtInfo = Object.values(data.recordTypeInfos).find(
        (rt) => rt.name === this.recordTypeName
      );
      this.recordTypeId = rtInfo?.recordTypeId;
    } else if (error) {
      // Consider surfacing this error to the user if needed
      this.recordTypeId = undefined;
    }
  }
  handleSubmit(event) {
    event.preventDefault();
    this.isLoading = true;
    const fields = event.detail.fields;

    createcase({ caseRecord: fields })
      .then((result) => {
        if (result === "Success") {
          this.showToast("Success", "Case created successfully", "success").then(
            () => this.close()
          );
        }
        this.isLoading = false;
      })
      .catch((error) => {
        console.error("Error creating case:", error);
        this.isLoading = false;
        this.showToast("Error", "Failed to create case", "error");
      });
  }

  handleLoad() {
    this.isLoading = false;
  }

  async showToast(title, message, variant) {
    const theme =
      variant === "success" || variant === "error" || variant === "warning"
        ? variant
        : "info";
    await LightningAlert.open({
      message,
      theme,
      label: title,
    });
  }
}
