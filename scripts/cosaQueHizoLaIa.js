/*:
 * @plugindesc Sistema de acciones por turno = cantidad de miembros de la party + bonus por críticos.
 * @author Grok + Tú
 *
 * @param Mostrar ventana
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
 * @default 300
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
 * - Si un personaje hace un CRÍTICO → ese personaje podrá actuar 2 veces
 *   en el SIGUIENTE turno
 *
 * Compatible con el sistema de batalla por defecto de MV.
 */

(function() {
    "use strict";

    //=============================================================================
    // Parámetros del plugin
    //=============================================================================
    var parameters = PluginManager.parameters('PartyActionPool');
    var showWindow   = String(parameters['Mostrar ventana'] || 'true') === 'true';
    var windowX      = Number(parameters['Window X'] || 0);
    var windowY      = Number(parameters['Window Y'] || 0);
    var windowWidth  = Number(parameters['Window Width'] || 300);
    var displayText  = String(parameters['Text'] || 'Acciones restantes:');

    //=============================================================================
    // BattleManager
    //=============================================================================

    BattleManager._bonusAcciones = 0;
    BattleManager._actoresConCritico = [];

    function detectarActorMuerto() {
        BattleManager._actorMuerto = 0;
        var members = $gameParty.battleMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].isDead()) {
                BattleManager._actorMuerto++;
            }
        }
    }

    // --- Al empezar la fase de input ---
    var _BattleManager_startInput = BattleManager.startInput;
    BattleManager.startInput = function() {
        detectarActorMuerto();
        _BattleManager_startInput.call(this); // aquí se llama a makeActions()

        // Contamos cuántas acciones extra se han dado por críticos
        var extrasPorCritico = 0;
        var members = $gameParty.battleMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].numActions() > 1) {
                extrasPorCritico += (members[i].numActions() - 1);
            }
        }

        // Acciones totales = miembros vivos + extras por crítico + bonus general
        this.cantidadAcciones = $gameParty.battleMembers().length
            + extrasPorCritico
            + (this._bonusAcciones || 0)
            - (this._actorMuerto || 0);

        this.accionesMaximas = this.cantidadAcciones;

        // Consumimos el bonus general
        this._bonusAcciones = 0;
    };

    // --- Cuando se CONFIRMA una acción ---
    var _BattleManager_selectNextCommand = BattleManager.selectNextCommand;
    BattleManager.selectNextCommand = function() {
        var actorAnterior = this.actor();

        _BattleManager_selectNextCommand.call(this);

        if (actorAnterior && this.cantidadAcciones > 0) {
            this.cantidadAcciones--;
        }

        if (this.cantidadAcciones <= 0 && this.isInputting()) {
            this.startTurn();
        }
    };

    // --- Cuando se CANCELA ---
    var _BattleManager_selectPreviousCommand = BattleManager.selectPreviousCommand;
    BattleManager.selectPreviousCommand = function() {
        var actorAnterior = this.actor();

        _BattleManager_selectPreviousCommand.call(this);

        if (actorAnterior && this.cantidadAcciones < this.accionesMaximas) {
            this.cantidadAcciones++;
        }
    };

    //=============================================================================
    // Detectar CRÍTICO y guardar al actor
    //=============================================================================
    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        var subject = this._subject;
        var action  = this._action;

        if (subject && subject.isActor() && action) {
            var targets = action._targets || [];
            var huboCritico = false;

            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                if (target && target.result && target.result().critical) {
                    huboCritico = true;
                    break;
                }
            }

            if (huboCritico) {
                var id = subject.actorId();
                // Usamos indexOf por compatibilidad
                if (BattleManager._actoresConCritico.indexOf(id) === -1) {
                    BattleManager._actoresConCritico.push(id);
                }
            }
        }

        _BattleManager_endAction.call(this);
    };

    //=============================================================================
    // Dar 2 acciones al actor que hizo crítico el turno anterior
    //=============================================================================
    var _Game_Actor_makeActions = Game_Actor.prototype.makeActions;
    Game_Actor.prototype.makeActions = function() {
        _Game_Actor_makeActions.call(this);

        var lista = BattleManager._actoresConCritico;
        if (!lista || lista.length === 0) return;

        var id = this.actorId();
        var index = lista.indexOf(id);

        if (index >= 0) {
            // Le damos una segunda acción
            this._actions.push(new Game_Action(this));

            // Lo quitamos de la lista (solo dura un turno)
            lista.splice(index, 1);
        }
    };

    //=============================================================================
    // Ventana
    //=============================================================================

    function Window_ConteoAccionesGrupo() {
        this.initialize.apply(this, arguments);
    }

    Window_ConteoAccionesGrupo.prototype = Object.create(Window_Base.prototype);
    Window_ConteoAccionesGrupo.prototype.constructor = Window_ConteoAccionesGrupo;

    Window_ConteoAccionesGrupo.prototype.initialize = function(x, y) {
        var width  = windowWidth;
        var height = this.fittingHeight(1);
        Window_Base.prototype.initialize.call(this, x, y, width, height);
        this._remaining = -1;
        this.refresh();
    };

    Window_ConteoAccionesGrupo.prototype.refresh = function() {
        if (BattleManager.cantidadAcciones === undefined) return;
        if (this._remaining === BattleManager.cantidadAcciones) return;

        this._remaining = BattleManager.cantidadAcciones;
        this.contents.clear();
        this.drawText(displayText + " " + this._remaining, 0, 0, this.contentsWidth(), 'center');
    };

    Window_ConteoAccionesGrupo.prototype.update = function() {
        Window_Base.prototype.update.call(this);

        if (BattleManager.isInputting()) {
            this.refresh();

            // Comprobamos si alguna ventana de selección (skill/item/enemy/actor) está activa
            var scene = SceneManager._scene;
            var hideBySelection = false;

            if (scene) {
                if (scene._skillWindow && scene._skillWindow.active) hideBySelection = true;
                if (scene._itemWindow  && scene._itemWindow.active)  hideBySelection = true;

            }

            this.visible = showWindow && !hideBySelection;
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
        this.createConteoAccionesWindow();
    };

    Scene_Battle.prototype.createConteoAccionesWindow = function() {
        this._conteoAccionesWindow = new Window_ConteoAccionesGrupo(windowX, windowY);
        this.addWindow(this._conteoAccionesWindow);
    };

})();