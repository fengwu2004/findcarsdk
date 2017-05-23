/**
 * Created by ky on 17-5-4.
 */
define(function (require, exports, module) {

    function idrUnit(unitInfo) {

        for (var key in unitInfo) {

            this[key] = unitInfo[key]
        }

        var that = this

        this.getPos = function() {

            var x = 0.5 * (that.boundLeft + that.boundRight)

            var y = 0.5 * (that.boundTop + that.boundBottom)

            return {x:x, y:y, floorId:that.floorId}
        }
    }

    module.exports = idrUnit
});