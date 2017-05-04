define(function (require, exports, module) {

    var css = document.createElement('link')

    css.type = 'text/css';

    css.rel = 'stylesheet';

    css.href = "http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/Composs/IDRComposs.css";

    var header = document.querySelector("head");

    header.appendChild(css)

    var Composs = function(id, defaultDegree, map) {

        var composs = document.getElementById(id);

        var idrMap = map

        var currentValue = 0;

        composs.addEventListener('click', onCompossClick)

        function onCompossClick() {

            idrMap.resetMap()
        }

        function rotateToDegree(degree) {

            currentValue = degree

            composs.style.transform = "rotate(" + currentValue + "deg)";
        }

        this.rotateToDegree = rotateToDegree
    };

    module.exports = Composs
});