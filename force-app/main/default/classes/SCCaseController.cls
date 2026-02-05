public with sharing class SCCaseController {
    @AuraEnabled
    public static string createcase(Case caseRecord){
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
}