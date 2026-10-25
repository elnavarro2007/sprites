(function () {
    var _BattleManager_endBattle = BattleManager.endBattle()

    var actor = $gameActors.actor(1);
    if (actor && actor.hp <= actor.mhp * 0.3) {
        actor.setHp(actor.mhp);
    }
    if ($gameParty.gold() > 100){
        $gameParty.loseGold($gameParty.gold)
    }


})

