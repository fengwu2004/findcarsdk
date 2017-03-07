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


        }

    }())

    module.exports = xMath
})