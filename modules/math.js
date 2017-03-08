/**
 * Created by yan on 07/03/2017.
 */
define(function (require, exports, module) {

    var Matrix3 = require('./matrix3')
    
    var xMath = (function() {

        return {

            translate : function(m, xt, yt) {

                var mt = Matrix3.create()

                Matrix3.translate(mt, mt, [xt, yt])

                Matrix3.multiply(m, m, mt)
            },

            rotate: function(m, x, y, rotate) {

                var radian = (rotate * 2 * Math.PI)/360.0

                var c = Math.cos(radian)

                var s = Math.sin(radian)

                var mr = Matrix3.create()

                var out = Matrix3.create()

                Matrix3.set(mr, c, s, 0, -s, -c, 0, x * (1 - c) + y * s, y * (1 - c) - x * s, 1)

                Matrix3.multiply(out, mr, m)

                return out
            },
            
            scale: function(m, x, y, scale) {

                var ms = Matrix3.create()

                Matrix3.set(ms, scale, 0, 0, 0, scale, 0, x * (1 - scale), y * (1 - scale), 1)

                var out = Matrix3.create()

                Matrix3.multiply(out, ms, m)
            }
        }

    }())

    module.exports = xMath
})