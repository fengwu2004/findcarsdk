function DebugManager() {
	
	this.label = document.getElementById('debug')
	
	this.stopDebugLog = false
	
	this.debugInfo = function(str) {
		
		if (this.stopDebugLog) {
			
			this.label.innerText = str
		}
	}
	
	this.showDebugInfo = function(show) {
		
		if (show) {
		
			this.label.style.visibale = 'visible'
		}
		else {
			
			this.label.style.visibale = 'hidden'
		}
	}
}

var intance = new DebugManager()

export { intance as default }