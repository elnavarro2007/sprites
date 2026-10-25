<Custom Show Eval>
    if (!BattleManager._dualFix2) {
    BattleManager._dualFix2 = true;
    var DUAL1_ID = 13;   // ID de "Prueba dual" (Recomiendo ponerme aqui los personajes que hacen el ataque dual)


    var DUAL_ID = 15;     // <---- PONER AQUÍ EL ID DE "otros ataques"


    var PARTNER_ID = 4;
    var STATE_ID = 13;
    var esDual2 = function(act) {
    return act && act.isSkill() && act.item() &&
    (act.item().id === DUAL_ID || act.item().id === DUAL1_ID);
};
    BattleManager.dualSync2 = function(usarActual) {
    var comp = $gameActors.actor(PARTNER_ID);
    if (!comp || !comp.isStateAffected(STATE_ID)) return;
    var cur = this.actor();
    var elegido = $gameParty.battleMembers().some(function(m) {
    if (m === comp) return false;
    if (usarActual && m === cur) return esDual2(m.inputtingAction());
    return m.isWaiting() && m._actions.some(esDual2);
});
    if (!elegido) {
    comp.removeState(STATE_ID);
    if (comp.numActions() === 0) comp.makeActions();
}
};
    var _next = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
    this.dualSync2(true);
    _next.call(this);
};
    var _prev = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
    _prev.call(this);
    this.dualSync2(false);
};
}
    var id = 4;
    var companero = $gameActors.actor(id);
    if ($gameParty.battleMembers().contains(companero)) {
    visible = true;
} else {
    visible = false;
}
</Custom Show Eval>

<Custom Requirement>
    var id = 4;
    var personajePrincipal = $gameActors.actor(2);
    var companero = $gameActors.actor(id);

    // IDs de habilidades que usan a un personaje (13 = Prueba dual, 14 = Tripl (esos son ejemplos))
    var USAN_A_ACTOR = [];




    // ¿Algún otro personaje ya tiene en cola una habilidad que use a ese actor???



    var yaOcupado = $gameParty.battleMembers().some(function(m) {
    if (m === personajePrincipal || m === companero) return false;
    return m._actions && m._actions.some(function(act) {
    return act && act.isSkill() && act.item() &&
    USAN_A_ACTOR.indexOf(act.item().id) >= 0;
});
});

    if (companero.isAlive() && !yaOcupado && companero.mp >= 5 && personajePrincipal.mp >= 5 && $gameParty.members().indexOf(personajePrincipal) < $gameParty.members().indexOf(companero) ) {
    value = true;
    if (BattleManager.isInputting() && BattleManager.actor() !== companero) {
    companero.addState(13);
}
} else {
    value = false;
}
</Custom Requirement>

<Custom Execution>
    $gameActors.actor(4).gainMp(-5);
</Custom Execution>