public with sharing class SCCaseController {
  @AuraEnabled
  public static string createcase(Case caseRecord) {
    try {
      //Enable assignment rule for case creation
      Database.DMLOptions dmlOpts = new Database.DMLOptions();
      dmlOpts.assignmentRuleHeader.useDefaultRule = true;
      caseRecord.setOptions(dmlOpts);
      caseRecord.Origin = 'Web';

      //assign entitlement process to the case
      Id userId = UserInfo.getUserId();
      User currentUser = [
        SELECT Id, Contact.AccountId
        FROM User
        WHERE Id = :userId
        LIMIT 1
      ];
      if (currentUser.Contact.AccountId != null) {
        List<Entitlement> entitlement = [
          SELECT Id
          FROM Entitlement
          WHERE
            AccountId = :currentUser.Contact.AccountId
            AND Status = 'Active'
            AND Type = 'Web Support'
          ORDER BY CreatedDate DESC
          LIMIT 1
        ];

        if (!entitlement.isEmpty() && entitlement[0].Id != null) {
          caseRecord.EntitlementId = entitlement[0].Id;
        }

        insert as User caseRecord;
      }
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
          IsClosed
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

  @AuraEnabled
  public static List<CaseComment> getCaseComments(Id caseId) {
    return [
      SELECT Id, CommentBody, CreatedDate, CreatedBy.Name
      FROM CaseComment
      WHERE ParentId = :caseId
      ORDER BY CreatedDate DESC
    ];
  }
}
