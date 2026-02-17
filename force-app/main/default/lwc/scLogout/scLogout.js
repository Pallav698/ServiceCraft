import { LightningElement } from "lwc";
import isGuest from "@salesforce/user/isGuest";
import basePath from "@salesforce/community/basePath";

export default class ScLogout extends LightningElement {
  get isGuest() {
    return isGuest;
  }

  handleLogout() {
    const sitePrefix = basePath.replace("/", "");
    window.location.href = "/${sitePrefix}/secur/logout.jsp";
  }
}
