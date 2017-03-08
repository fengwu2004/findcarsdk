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

        this.setPos = function(x, y, mt) {

            console.log(mt)

            var v = xmath.pointTransform(x - 30, y - 30, mt)

            _dom.style.left = v[0] + 'px'

            _dom.style.top = v[1] + 'px'

            _dom.style.position = 'absolute'

            wave()
        }
    }

    module.exports = idrIndicator
})