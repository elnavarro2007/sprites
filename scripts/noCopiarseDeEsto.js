/*:
 * @plugindesc Sistema de pool de acciones compartidas = cantidad de miembros de la party.
 * @author Grok + Usuario
 *
 * @param Show Window
 * @text Mostrar ventana de acciones
 * @type boolean
 * @on Sí
 * @off No
 * @default true
 *
 * @param Window X
 * @text Posición X de la ventana
 * @type number
 * @default 0
 *
 * @param Window Y
 * @text Posición Y de la ventana
 * @type number
 * @default 0
 *
 * @param Window Width
 * @text Ancho de la ventana
 * @type number
 * @default 240
 *
 * @param Text
 * @text Texto a mostrar
 * @type string
 * @default Acciones restantes:
 *
 * @help
 * ============================================================================
 * Party Action Pool - Sistema de acciones compartidas
 * ============================================================================
 *
 * Al iniciar el input de cada turno, el número de acciones disponibles
 * se establece en la cantidad de miembros de la party en batalla.
 *
 * - Confirmar acción de un personaje → el contador baja 1
 * - Cancelar y volver atrás → el contador sube 1 (hasta el máximo)
 * - Cuando llega a 0 → se termina el input y empieza el turno
 *
 * Compatible con el sistema de batalla por defecto de MV.
 */

(function() {
    "use strict";

    var parameters = PluginManager.parameters('PartyActionPool');
    var showWindow = String(parameters['Show Window'] || 'true') === 'true';
    var windowX = Number(parameters['Window X'] || 0);
    var windowY = Number(parameters['Window Y'] || 0);
    var windowWidth = Number(parameters['Window Width'] || 240);
    var displayText = String(parameters['Text'] || 'Acciones restantes:');

    //=============================================================================
    // BattleManager
    //=============================================================================

    var _BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        _BattleManager_startInput.call(this);
        this._remainingActions = $gameParty.battleMembers().length;
        this._maxActions = this._remainingActions;
    };

    var _BattleManager_selectNextCommand = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
        // Solo restamos si realmente avanzamos a un nuevo actor o terminamos
        var previousActor = this.actor();
        _BattleManager_selectNextCommand.call(this);

        // Si había un actor y ahora avanzamos (o terminamos), restamos 1
        if (previousActor && this._remainingActions > 0) {
            this._remainingActions--;
        }

        // Si se acabaron las acciones, forzamos el inicio del turno
        if (this._remainingActions <= 0 && this.isInputting()) {
            this.startTurn();
        }
    };

    var _BattleManager_selectPreviousCommand = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
        var previousActor = this.actor();
        _BattleManager_selectPreviousCommand.call(this);

        // Si volvemos atrás y había un actor, restauramos 1 acción
        if (previousActor && this._remainingActions < this._maxActions) {
            this._remainingActions++;
        }
    };

    //=============================================================================
    // Window_PartyActionCount
    //=============================================================================

    function Window_PartyActionCount() {
        this.initialize.apply(this, arguments);
    }

    Window_PartyActionCount.prototype = Object.create(Window_Base.prototype);
    Window_PartyActionCount.prototype.constructor = Window_PartyActionCount;

    Window_PartyActionCount.prototype.initialize = function(x, y) {
        var width = windowWidth;
        var height = this.fittingHeight(1);
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._remaining = -1;
        this.refresh();
    };

    Window_PartyActionCount.prototype.refresh = function() {
        if (!BattleManager._remainingActions && BattleManager._remainingActions !== 0) return;
        if (this._remaining === BattleManager._remainingActions) return;

        this._remaining = BattleManager._remainingActions;
        this.contents.clear();
        this.drawText(displayText + " " + this._remaining, 0, 0, this.contentsWidth(), 'center');
    };

    Window_PartyActionCount.prototype.update = function() {
        Window_Base.prototype.update.call(this);
        if (BattleManager.isInputting()) {
            this.refresh();
            this.visible = showWindow;
        } else {
            this.visible = false;
        }
    };

    //=============================================================================
    // Scene_Battle
    //=============================================================================

    var _Scene_Battle_createAllWindows = Scene_Battle.prototype.createAllWindows;
    Scene_Battle.prototype.createAllWindows = function() {
        _Scene_Battle_createAllWindows.call(this);
        this.createPartyActionWindow();
    };

    Scene_Battle.prototype.createPartyActionWindow = function() {
        this._partyActionWindow = new Window_PartyActionCount(windowX, windowY);
        this.addWindow(this._partyActionWindow);
    };

})();