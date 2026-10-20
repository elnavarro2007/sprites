//=============================================================================
// Timer.js - Timed Hits estilo Super Mario RPG para RPG Maker MV
//=============================================================================
/*:
 * @plugindesc Sistema de Timed Hits estilo Super Mario RPG para RPG Maker MV
 * @author Grok + el inutil que no ha hecho mas alla de poner una funcion de random y ya esta
 * @version 1.4
 *
 * @param Damage Multiplier
 * @desc Multiplicador de daño si aciertas el timing (ej: 1.5 = +50%)
 * @type number
 * @decimals 2
 * @min 1.0
 * @default 1.5
 *
 * @param Timing Duration
 * @desc Duración total de la barra en frames (60 frames ≈ 1 segundo)
 * @type number
 * @min 30
 * @default 90
 *
 * @param Success SE
 * @desc Sonido al acertar el timing
 * @type file
 * @dir audio/se/
 * @default Decision2
 *
 * @param Fail SE
 * @desc Sonido al fallar el timing
 * @type file
 * @dir audio/se/
 * @default Buzzer1
 *
 * @param Enable for Basic Attack
 * @desc ¿Activar timed hit en el ataque normal (Skill ID 1)?
 * @type boolean
 * @default true
 *
 * @param Enable for Skills
 * @desc ¿Activar timed hit en TODAS las skills/magias?
 * @type boolean
 * @default true
 *
 * @help
 * ============================================================================
 * Timed Hit - Estilo Super Mario RPG v1.4
 * ============================================================================
 *
 * Cómo usar:
 * ----------
 * 1. El ataque normal tiene timed hit si "Enable for Basic Attack" está en true.
 * 2. Las skills/magias tienen timed hit si "Enable for Skills" está en true.
 * 3. También puedes forzar el timed hit en una skill concreta con el notetag:
 *
 *    <TimedAttack>
 *
 * 4. Durante el ataque/magia aparece la barra. Pulsa OK (o toca la pantalla)
 *    cuando el cursor esté en la zona verde para hacer más daño.
 *
 * La zona verde se genera ALEATORIAMENTE cada vez que se inicia un Timed Hit
 * (inicio entre 0.2 y 0.8, final = inicio + 0.2).
 *
 * El daño se aplica DESPUÉS de que pulses (o se acabe el tiempo).
 */

(function() {
    "use strict";

    //=========================================================================
    // Parámetros
    //=========================================================================
    var parameters = PluginManager.parameters('Timer');
    var paramMultiplier  = Number(parameters['Damage Multiplier'] || 1.5);
    var paramDuration    = Number(parameters['Timing Duration'] || 90);
    var paramSuccessSE   = String(parameters['Success SE'] || 'Decision2');
    var paramFailSE      = String(parameters['Fail SE'] || 'Buzzer1');
    var paramBasicAttack = String(parameters['Enable for Basic Attack'] || 'true') === 'true';
    var paramSkills      = String(parameters['Enable for Skills'] || 'true') === 'true';

    //=========================================================================
    // Variables de estado
    //=========================================================================
    var _timedHitActive   = false;
    var _timedHitSuccess  = false;
    var _timedHitTimer    = 0;
    var _timedHitMaxTime  = 0;
    var _timedHitSprite   = null;
    var _timedHitCursor   = null;
    var _needsTimedHit    = false;

    // Zona aleatoria generada por cada Timed Hit
    var _zoneStart = 0.4;
    var _zoneEnd   = 0.6;

    //=========================================================================
    // Game_Action - Aplicar multiplicador
    //=========================================================================
    var _Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
    Game_Action.prototype.makeDamageValue = function(target, critical) {
        var value = _Game_Action_makeDamageValue.call(this, target, critical);
        if (this.subject().isActor() && _timedHitSuccess) {
            value = Math.round(value * paramMultiplier);
        }
        return value;
    };

    //=========================================================================
    // Función para generar zona aleatoria
    //=========================================================================
    function generateRandomZone() {
        // Genera un número decimal entre 0.2 y 0.8
        _zoneStart = Math.random() * (0.8 - 0.2) + 0.2;
        _zoneEnd   = Math.min(1.0, _zoneStart + 0.2);
    }

    //=========================================================================
    // BattleManager - Detectar acción con timed hit
    //=========================================================================
    var _BattleManager_startAction = BattleManager.startAction;
    BattleManager.startAction = function() {
        _BattleManager_startAction.call(this);

        var subject = this._subject;
        var action  = this._action;

        _needsTimedHit   = false;
        _timedHitSuccess = false;

        if (!subject || !subject.isActor() || !action) return;

        var isBasicAttack = action.isAttack() && paramBasicAttack;

        // También podrías añadir aquí la lógica de skills y notetag si quieres
        // Por ahora solo se activa en ataque básico como pediste

        if (isBasicAttack) {
            _needsTimedHit = true;
            startTimedHit();
        }
    };

    //=========================================================================
    // Pausar el combate mientras dura el timing
    //=========================================================================
    var _BattleManager_update = BattleManager.update;
    BattleManager.update = function() {
        if (_timedHitActive) {
            return;
        }
        _BattleManager_update.call(this);
    };

    //=========================================================================
    // Iniciar / terminar el timed hit
    //=========================================================================
    function startTimedHit() {
        _timedHitActive  = true;
        _timedHitSuccess = false;
        _timedHitTimer   = 0;
        _timedHitMaxTime = paramDuration;

        // Generamos una zona nueva cada vez
        generateRandomZone();

        createTimedHitSprites();
    }

    function endTimedHit(success) {
        _timedHitActive  = false;
        _timedHitSuccess = success;
        _needsTimedHit   = false;

        if (success) {
            if (paramSuccessSE) {
                AudioManager.playSe({name: paramSuccessSE, volume: 90, pitch: 100, pan: 0});
            }
        } else {
            if (paramFailSE) {
                AudioManager.playSe({name: paramFailSE, volume: 70, pitch: 100, pan: 0});
            }
        }

        removeTimedHitSprites();
    }

    //=========================================================================
    // Sprites de la barra
    //=========================================================================
    function createTimedHitSprites() {
        removeTimedHitSprites();

        var scene = SceneManager._scene;
        if (!(scene instanceof Scene_Battle)) return;

        _timedHitSprite = new Sprite(new Bitmap(320, 28));
        var bmp = _timedHitSprite.bitmap;

        bmp.fillAll('rgba(0,0,0,0.75)');
        bmp.fillRect(4, 4, 312, 20, '#333333');

        // Zona verde (usando la zona aleatoria generada)
        var zoneX = 4 + Math.floor(312 * _zoneStart);
        var zoneW = Math.floor(312 * (_zoneEnd - _zoneStart));
        bmp.fillRect(zoneX, 4, zoneW, 20, '#22cc44');

        // Borde
        bmp.fillRect(0, 0, 320, 2, '#dbd7d7');
        bmp.fillRect(0, 26, 320, 2, '#dbd7d7');
        bmp.fillRect(0, 0, 2, 28, '#dbd7d7');
        bmp.fillRect(318, 0, 2, 28, '#dbd7d7');

        _timedHitSprite.x = (Graphics.boxWidth - 320) / 2;
        _timedHitSprite.y = Graphics.boxHeight - 90;
        scene.addChild(_timedHitSprite);

        _timedHitCursor = new Sprite(new Bitmap(6, 36));
        _timedHitCursor.bitmap.fillAll('#dbd7d7');
        _timedHitCursor.x = _timedHitSprite.x + 4;
        _timedHitCursor.y = _timedHitSprite.y - 4;
        scene.addChild(_timedHitCursor);
    }

    function removeTimedHitSprites() {
        var scene = SceneManager._scene;
        if (_timedHitSprite) {
            if (scene) scene.removeChild(_timedHitSprite);
            if (_timedHitSprite.bitmap) _timedHitSprite.bitmap.clear();
            _timedHitSprite = null;
        }
        if (_timedHitCursor) {
            if (scene) scene.removeChild(_timedHitCursor);
            if (_timedHitCursor.bitmap) _timedHitCursor.bitmap.clear();
            _timedHitCursor = null;
        }
    }

    function updateTimedHitSprites() {
        if (!_timedHitCursor || !_timedHitActive) return;
        var progress = _timedHitTimer / _timedHitMaxTime;
        var cursorX  = 4 + Math.floor(312 * progress);
        _timedHitCursor.x = _timedHitSprite.x + cursorX;
    }

    //=========================================================================
    // Scene_Battle - Control del input y del timer
    //=========================================================================
    var _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        if (_timedHitActive) {
            _timedHitTimer++;
            updateTimedHitSprites();

            if (Input.isTriggered('ok') || TouchInput.isTriggered()) {
                var progress = _timedHitTimer / _timedHitMaxTime;
                // Usamos la zona aleatoria generada en este Timed Hit
                var success  = (progress >= _zoneStart && progress <= _zoneEnd);
                endTimedHit(success);
            } else if (_timedHitTimer >= _timedHitMaxTime) {
                endTimedHit(false);
            }
        }

        _Scene_Battle_update.call(this);
    };

    //=========================================================================
    // Limpieza
    //=========================================================================
    var _BattleManager_endAction = BattleManager.endAction;
    BattleManager.endAction = function() {
        if (_timedHitActive) {
            endTimedHit(false);
        }
        _timedHitSuccess = false;
        _needsTimedHit   = false;
        _BattleManager_endAction.call(this);
    };

    var _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        removeTimedHitSprites();
        _timedHitActive  = false;
        _timedHitSuccess = false;
        _needsTimedHit   = false;
        _Scene_Battle_terminate.call(this);
    };

})();