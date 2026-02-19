public with sharing class Sc_CaseTriggerHandler {
  public static final String CASE_RECORD_TYPE_NAME = 'Support';
  public static final String promptTemplateName = 'Case_Email_Classifier';

  public static void beforeInsert(List<SObject> newCases) {
    List<Case> casesToUpdate = new List<Case>();
    for (SObject obj : newCases) {
      Case c = (Case) obj;
      if (
        c.RecordTypeId ==
        Schema.SObjectType.Case.getRecordTypeInfosByName()
          .get(CASE_RECORD_TYPE_NAME)
          .getRecordTypeId() &&
        (c.Subject != null ||
        c.Description != null) &&
        c.Origin == 'Email'
      ) {
        // Prepare input parameters for the prompt template
        Map<String, ConnectApi.WrappedValue> inputParams = new Map<String, ConnectApi.WrappedValue>();
        ConnectApi.WrappedValue subjectValue = new ConnectApi.WrappedValue();
        subjectValue.value = c.Subject;
        inputParams.put('Input:EmailSubject', subjectValue);
        ConnectApi.WrappedValue bodyValue = new ConnectApi.WrappedValue();
        bodyValue.value = c.Description;
        inputParams.put('Input:EmailBody', bodyValue);

        // Invoke prompt template to classify the case
        String classification = invokePrompt(promptTemplateName, inputParams);
        Map<String, Object> classificationResult = (Map<String, Object>) JSON.deserializeUntyped(
          classification
        );
        if (classificationResult.containsKey('priority')) {
          c.Priority = (String) classificationResult.get('priority');
        }
        if (
          classificationResult.containsKey('language') &&
          classificationResult.get('language') != null
        ) {
          c.Language__c = (String) classificationResult.get('language');
        }
      }
    }
  }

  private static String invokePrompt(
    String promptTemplateDeveloperName,
    Map<String, ConnectApi.WrappedValue> inputParams
  ) {
    // Prepare input for generating prompt template
    ConnectApi.EinsteinPromptTemplateGenerationsInput promptGenerationsInput = new ConnectApi.EinsteinPromptTemplateGenerationsInput();

    // Set hyper parameters
    promptGenerationsInput.inputParams = inputParams;
    promptGenerationsInput.additionalConfig = new ConnectApi.EinsteinLlmAdditionalConfigInput();
    promptGenerationsInput.additionalConfig.numGenerations = 1;
    promptGenerationsInput.additionalConfig.enablePiiMasking = true;
    promptGenerationsInput.additionalConfig.applicationName = 'PromptTemplateGenerationsInvocable';

    // Set if it's a preview or not
    promptGenerationsInput.isPreview = false;

    // Call the service to generate messages for the prompt template
    ConnectApi.EinsteinPromptTemplateGenerationsRepresentation generationsOutput = ConnectApi.EinsteinLLM.generateMessagesForPromptTemplate(
      promptTemplateDeveloperName,
      promptGenerationsInput
    );

    // Consume response
    ConnectApi.EinsteinLLMGenerationItemOutput response = generationsOutput.generations[0];
    return response.text;
  }
}
