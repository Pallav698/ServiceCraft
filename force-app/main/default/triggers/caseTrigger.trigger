trigger caseTrigger on Case(before insert) {
  if (Trigger.isBefore && Trigger.isInsert) {
    Sc_CaseTriggerHandler.beforeInsert(Trigger.new);
  }
}
