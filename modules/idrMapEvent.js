/**
 * Created by ky on 17-5-4.
 */

var idrMapEventTypes = {
    
    onInitMapSuccess:'onInitMapSuccess',
    
    onFloorChangeSuccess:'onFloorChangeSuccess',
    
    onMapClick:'onMapClick',
    
    onMarkerClick:'onMarkerClick',
    
    onUnitClick:'onUnitClick',
    
    onRouterSuccess:'onRouterSuccess',
    
    onRouterFinish:'onRouterFinish',
    
    onMapLongPress:'onMapLongPress',
    
    onMapScroll:'onMapScroll',
    
    onRouterFailed:'onRouterFailed',
    
    onRouterPathUpdate:'onRouterPathUpdate',
    
    onNaviStatusUpdate:'onNaviStatusUpdate'
}

function idrMapEvent() {
    
    this.events = {}

    this.oncesEvents = {}
    
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
    
    this.fireOnce = function (type, data) {

        if (!idrMapEventTypes.hasOwnProperty(type)) {

            return false
        }

        var fn = this.oncesEvents[type]

        if (!fn) {

            return false
        }

        this.oncesEvents[type] = null

        fn(data)

        return true
    }
    
    this.addOnce = function(type, fn) {

        this.oncesEvents[type] = fn
    }
}

export {idrMapEvent as idrMapEvent, idrMapEventTypes as idrMapEventTypes}