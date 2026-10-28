<Custom Show Eval>
    if (!BattleManager._tripleFix) {
    BattleManager._tripleFix = true;
    BattleManager._tripleLock = false;
    BattleManager._tripleTurn = false;

    var TRIPLE_ID = 14;
    var PARTNER_ID1 = 3;   // coranio
    var PARTNER_ID2 = 2;   // Nestor
    var STATE_ID = 13;

    var esTriple = function(act) {
    return act && act.isSkill() && act.item() && act.item().id === TRIPLE_ID;
};

    var getPartners = function() {
    return [$gameActors.actor(PARTNER_ID1), $gameActors.actor(PARTNER_ID2)];
};

    BattleManager.tripleSync = function(usarActual) {
    var comp1 = $gameActors.actor(PARTNER_ID1);
    var comp2 = $gameActors.actor(PARTNER_ID2);
    if (!comp1 || !comp2) return;

    var cur = this.actor();

    var elegido = $gameParty.battleMembers().some(function(m) {
    if (m === comp1 || m === comp2) return false;

    if (usarActual && m === cur) {
    return esTriple(m.inputtingAction());
}
    return m.isWaiting() && m._actions.some(esTriple);
});

    // AÑADIDO: bandera que bloquea el input de los compañeros
    this._tripleLock = !!elegido;

    if (elegido) {
    // Forzar que ninguno pueda actuar
    comp1.clearActions();
    comp2.clearActions();
    if (comp1._actionState) comp1.setActionState('waiting');
    if (comp2._actionState) comp2.setActionState('waiting');
    return;
}

    if (!comp1.isStateAffected(STATE_ID)) return;
    if (!comp2.isStateAffected(STATE_ID)) return;

    comp1.removeState(STATE_ID);
    comp2.removeState(STATE_ID);

    if (comp1.numActions() === 0) comp1.makeActions();
    if (comp2.numActions() === 0) comp2.makeActions();
};

    var _next = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
    this.tripleSync(true);
    _next.call(this);
};

    var _prev = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
    _prev.call(this);
    this.tripleSync(false);
};

    // ===== AÑADIDO 1: los compañeros NO pueden recibir input mientras haya triple =====
    var _canInput = Game_Actor.prototype.canInput;
    Game_Actor.prototype.canInput = function() {
    if (BattleManager._tripleLock && getPartners().indexOf(this) >= 0) return false;
    return _canInput.call(this);
};

    // ===== AÑADIDO 2: bloqueo durante la ejecución del turno =====
    var _startTurn = BattleManager.startTurn;
    BattleManager.startTurn = function() {
    var partners = getPartners();
    this._tripleTurn = $gameParty.battleMembers().some(function(m) {
    if (partners.indexOf(m) >= 0) return false;
    return m._actions && m._actions.some(esTriple);
});
    if (this._tripleTurn) {
    partners.forEach(function(p) { if (p) p.clearActions(); });
}
    _startTurn.call(this);
};

    var _getNextSubject = BattleManager.getNextSubject;
    BattleManager.getNextSubject = function() {
    var partners = getPartners();
    for (;;) {
    var subject = _getNextSubject.call(this);
    if (!subject) return null;
    if (this._tripleTurn && partners.indexOf(subject) >= 0) {
    subject.clearActions();
    continue;
}
    return subject;
}
};

    // ===== AÑADIDO 3: al terminar el turno se libera todo =====
    var _endTurn = BattleManager.endTurn;
    BattleManager.endTurn = function() {
    _endTurn.call(this);
    this._tripleTurn = false;
    this._tripleLock = false;
    getPartners().forEach(function(p) {
    if (p) p.removeState(STATE_ID);
});
};
}

    var id1 = 3;
    var id2 = 2;
    var companero1 = $gameActors.actor(id1);
    var companero2 = $gameActors.actor(id2);

    if ($gameParty.battleMembers().contains(companero1) &&
    $gameParty.battleMembers().contains(companero2)) {
    visible = true;
} else {
    visible = false;
}
</Custom Show Eval>

<Custom Requirement>
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