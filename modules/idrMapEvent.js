/**
 * Created by ky on 17-5-4.
 */
define(function (require, exports, module){

    var idrMapEventTypes = {

        onInitMapSuccess:'onInitMapSuccess',

        onFloorChangeSuccess:'onFloorChangeSuccess',

        onMapClick:'onMapClick',

        onMarkerClick:'onMarkerClick',

        onUnitClick:'onUnitClick',
    }

    function idrMapEvent() {

        this.events = {}

        this.checkEvent = function(type) {

            if (this.events.hasOwnProperty(type)) {

                var property = this.events[type]

                return property !== null
            }

            return false
        }

        this.removeEvent = function(type) {

            if (!idrMapEventTypes.hasOwnProperty(type)) {

                return false
            }

            this.events[type] = null

            return true
        }
        
        this.fireEvent = function(type, data) {

            if (!idrMapEventTypes.hasOwnProperty(type)) {

                return false
            }

            var fn = this.events[type]

            fn && fn(data)

            return true
        }
        
        this.addEvent = function(type, fn) {

            if (!idrMapEventTypes.hasOwnProperty(type)) {

                return false
            }

            this.events[type] = fn

            return true
        }
    }

    module.exports = [idrMapEvent, idrMapEventTypes]
});