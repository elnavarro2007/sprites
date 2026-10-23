<Custom Show Eval>
    if (!BattleManager._dualFix) {
    BattleManager._dualFix = true;
    var DUAL_ID = 13;
    var PARTNER_ID = 3;
    var STATE_ID = 13;
    var esDual = function(act) {
    return act && act.isSkill() && act.item() && act.item().id === DUAL_ID;
};
    BattleManager.dualSync = function(usarActual) {
    var comp = $gameActors.actor(PARTNER_ID);
    if (!comp || !comp.isStateAffected(STATE_ID)) return;
    var cur = this.actor();
    var elegido = $gameParty.battleMembers().some(function(m) {
    if (m === comp) return false;
    if (usarActual && m === cur) return esDual(m.inputtingAction());
    return m.isWaiting() && m._actions.some(esDual);
});
    if (!elegido) {
    comp.removeState(STATE_ID);
    if (comp.numActions() === 0) comp.makeActions();
}
};
    var _next = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
    this.dualSync(true);
    _next.call(this);
};
    var _prev = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
    _prev.call(this);
    this.dualSync(false);
};
}
    var id = 3;
    var companero = $gameActors.actor(id);
    if ($gameParty.battleMembers().contains(companero)) {
    visible = true;
} else {
    visible = false;
}
</Custom Show Eval>

<Custom Requirement>
    var id = 3;
    var personajePrincipal = $gameActors.actor(1);
    var companero = $gameActors.actor(id);
// para corregirlo poner que el usuario secundario vaya antes del actor principal
    if (companero.isAlive() && companero.mp >= 5 && personajePrincipal.mp >= 5 && $gameParty.members().indexOf(companero) != 0) {
    value = true;
    if (BattleManager.isInputting() && BattleManager.actor() !== companero) {
    companero.addState(13);
}
} else {
    value = false;
}
</Custom Requirement>

<Custom Execution>
    $gameActors.actor(3).gainMp(-5);
</Custom Execution>
