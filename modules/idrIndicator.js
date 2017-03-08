/**
 * Created by yan on 07/03/2017.
 */
define(function (require, exports, module) {

    var matrix3 = require('./matrix3')

    var xmath = require('./math')
    
    function idrIndicator() {

        var _dom = null
        
        var wave = function() {


        }

        this.setDom = function(dom) {

            _dom = dom
        }

        this.setPos = function(x, y, trans) {

            var mt = matrix3.create()

            matrix3.set(mt, trans[0], trans[1], 0, trans[2], trans[3], 0, trans[4], trans[5], trans[1])

            matrix3.invert(mt, mt)

            var v = xmath.pointTransform(x, y, mt)

            _dom.style.left = v[0] + 'px'

            _dom.style.top = v[1] + 'px'

            _dom.style.position = 'absolute'

            wave()
        }
    }

    module.exports = idrIndicator
})