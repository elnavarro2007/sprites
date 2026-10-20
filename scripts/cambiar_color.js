(function() {
    // Índices de la paleta del windowskin (0-31)
    var COLOR_PV = 2;   // naranja
    var COLOR_PM = 4;   // celeste
    var COLOR_PT = 3;   // verde

    function wrap(name, colorIndex) {
        var original = Window_Base.prototype[name];
        Window_Base.prototype[name] = function() {
            var self = this;
            this.systemColor = function() { return self.textColor(colorIndex); };
            try {
                original.apply(this, arguments);
            } finally {
                delete this.systemColor;
            }
        };
    }

    wrap('drawActorHp', COLOR_PV);
    wrap('drawActorMp', COLOR_PM);
    wrap('drawActorTp', COLOR_PT);
})();