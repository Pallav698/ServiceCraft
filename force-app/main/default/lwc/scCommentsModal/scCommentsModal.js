import { api } from "lwc";
import LightningModal from "lightning/modal";
import { createRecord } from "lightning/uiRecordApi";
import getCaseComments from "@salesforce/apex/SCCaseController.getCaseComments";

import CASE_COMMENT_OBJECT from "@salesforce/schema/CaseComment";
import COMMENT_FIELD from "@salesforce/schema/CaseComment.CommentBody";
import PARENT_ID_FIELD from "@salesforce/schema/CaseComment.ParentId";
import IS_PUBLISHED_FIELD from "@salesforce/schema/CaseComment.IsPublished";

export default class ScCommentsModal extends LightningModal {
  @api caseId;

  comments = [];
  newComment = "";
  isBusy = false;

  connectedCallback() {
    this.loadComments();
  }

  get hasComments() {
    return this.comments && this.comments.length > 0;
  }

  loadComments() {
    this.isBusy = true;

    getCaseComments({ caseId: this.caseId })
      .then((result) => {
        this.comments = result;
        this.isBusy = false;
      })
      .catch((error) => {
        console.error(error);
        this.isBusy = false;
      });
  }

  handleCommentChange(event) {
    this.newComment = event.target.value;
  }

  handleAddComment() {
    if (!this.newComment?.trim()) {
      return;
    }

    this.isBusy = true;

    const fields = {
      [COMMENT_FIELD.fieldApiName]: this.newComment,
      [PARENT_ID_FIELD.fieldApiName]: this.caseId,
      [IS_PUBLISHED_FIELD.fieldApiName]: true
    };

    createRecord({
      apiName: CASE_COMMENT_OBJECT.objectApiName,
      fields
    })
      .then(() => {
        this.newComment = "";
        this.loadComments();
      })
      .catch((error) => {
        console.error(error);
        this.isBusy = false;
      });
  }

  handleClose() {
    this.close("refresh");
  }
}
