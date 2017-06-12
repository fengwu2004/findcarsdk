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
        
        this.getPolygon = function () {

            if (that.points) {

                return that.points
            }

            var left = that.boundLeft

            var top = that.boundTop

            var right = that.boundRight

            var bottom = that.boundBottom

            that.points = []

            that.points.push({x:left, y:top})

            that.points.push({x:right, y:top})

            that.points.push({x:right, y:bottom})

            that.points.push({x:left, y:bottom})

            return that.points
        }
    }

    module.exports = idrUnit
});