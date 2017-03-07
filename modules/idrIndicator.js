/**
 * Created by yan on 07/03/2017.
 */
define(function (require, exports, module) {
    
    function idrIndicator() {

        var _dom = null
        
        var wave = function() {


        }

        this.setDom = function(dom) {

            _dom = dom
        }

        this.setPos = function(x, y) {

            _dom.style.left = 50 + 'px'

            _dom.style.top = 50 + 'px'

            _dom.style.position = 'absolute'

            wave()
        }
    }

    module.exports = idrIndicator
})