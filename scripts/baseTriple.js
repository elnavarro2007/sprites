<Custom Show Eval>
    if (!BattleManager._dualFix) {
    BattleManager._dualFix = true;
    var STATE_ID = 13;
    var COMBOS = { 13: [3], 14: [2, 3] };
    BattleManager.dualSync = function(usarActual) {
    var cur = this.actor();
    var todos = [];
    Object.keys(COMBOS).forEach(function(k) {
    COMBOS[k].forEach(function(p) { if (todos.indexOf(p) < 0) todos.push(p); });
});
    todos.forEach(function(pid) {
    var comp = $gameActors.actor(pid);
    if (!comp || !comp.isStateAffected(STATE_ID)) return;
    var elegido = $gameParty.battleMembers().some(function(m) {
    if (m === comp) return false;
    var acts = (usarActual && m === cur) ? [m.inputtingAction()] : (m.isWaiting() ? m._actions : []);
    return acts.some(function(a) {
    return a && a.isSkill() && a.item() && COMBOS[a.item().id] && COMBOS[a.item().id].indexOf(pid) >= 0;
});
});
    if (!elegido) {
    comp.removeState(STATE_ID);
    if (comp.numActions() === 0) comp.makeActions();
}
});
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
    if (companero.isAlive() && companero.mp >= 5 && personajePrincipal.mp >= 5 && $gameParty.members().indexOf(personajePrincipal) < $gameParty.members().indexOf(companero)) {
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
    var id1 = 2;
    var id2 = 3;

    var principal = $gameActors.actor(1);
    var companero1 = $gameActors.actor(id1);
    var companero2 = $gameActors.actor(id2);

    if (companero1.isAlive() && companero2.isAlive() &&
    companero1.mp >= 5 && companero2.mp >= 5 && principal.mp >= 5 &&
    $gameParty.members().indexOf(principal) < $gameParty.members().indexOf(companero1) && $gameParty.members().indexOf(principal) < $gameParty.members().indexOf(companero2)) {

    value = true;

    if (BattleManager.isInputting() &&
    BattleManager.actor() !== companero1 &&
    BattleManager.actor() !== companero2) {

    companero1.addState(13);
    companero2.addState(13);
}
} else {
    value = false;
}
</Custom Requirement>

<Custom Execution>
    $gameActors.actor(3).gainMp(-5);
    $gameActors.actor(2).gainMp(-5);
</Custom Execution>