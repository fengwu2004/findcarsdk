function DebugManager() {
	
	this.label = document.getElementById('debug')
	
	this.debugInfo = function(str) {
		
		this.label.innerText = str
	}
	
	this.showDebugInfo = function(show) {
		
		if (show) {
		
			this.label.style.visibility = 'visible'
		}
		else {
			
			this.label.style.visibility = 'hidden'
		}
	}
}

var intance = new DebugManager()

export { intance as default }