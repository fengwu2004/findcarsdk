/**
 * Created by ky on 17-5-4.
 */


export class idrMapEvent {
	
	static get types() {
		
		return {
			
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
			
			onNaviStatusUpdate:'onNaviStatusUpdate',
			
			onMapStatusChange:'onMapStatusChange'
		}
	}
	
	constructor() {
		
		this.events = {}
		
		this.oncesEvents = {}
	}
	
	checkEvent(type) {
		
		if (this.events.hasOwnProperty(type)) {
			
			var property = this.events[type]
			
			return property !== null
		}
		
		return false
	}
	
	removeEvent(type) {
		
		if (!idrMapEvent.types.hasOwnProperty(type)) {
			
			return false
		}
		
		this.events[type] = null
		
		return true
	}
	
	fireEvent(type, data) {
		
		if (!idrMapEvent.types.hasOwnProperty(type)) {
			
			return false
		}
		
		var fn = this.events[type]
		
		fn && fn(data)
		
		return true
	}
	
	addEvent(type, fn) {
		
		if (!idrMapEvent.types.hasOwnProperty(type)) {
			
			return false
		}
		
		this.events[type] = fn
		
		return true
	}
	
	fireOnce(type, data) {
		
		if (!idrMapEvent.types.hasOwnProperty(type)) {
			
			return false
		}
		
		var fn = this.oncesEvents[type]
		
		if (!fn) {
			
			return false
		}
		
		if (fn(data)) {
			
			this.oncesEvents[type] = null
		}
		
		return true
	}
	
	addOnce(type, fn) {
		
		this.oncesEvents[type] = fn
	}
}