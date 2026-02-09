public with sharing class SCCaseController {
  @AuraEnabled
  public static string createcase(Case caseRecord) {
    try {
      //Enable assignment rule for case creation
      Database.DMLOptions dmlOpts = new Database.DMLOptions();
      dmlOpts.assignmentRuleHeader.useDefaultRule = true;
      caseRecord.setOptions(dmlOpts);
      caseRecord.Origin = 'Web';
      insert as User caseRecord;
      return 'Success';
    } catch (Exception e) {
      return e.getMessage();
    }
  }

  @AuraEnabled
  public static List<Case> getMycases() {
    try {
      List<Case> caseList = [
        SELECT
          Id,
          CaseNumber,
          Subject,
          Status,
          Priority,
          CreatedDate,
          IsEscalated,
          IsClosed,
          (
            SELECT Id, CommentBody, CreatedDate, CreatedBy.Name
            FROM CaseComments
          )
        FROM Case
        WHERE CreatedById = :UserInfo.getUserId()
        WITH USER_MODE
        ORDER BY CreatedDate DESC
        LIMIT 10
      ];

      if (!caseList.isEmpty()) {
        return caseList;
      }
      return null;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
