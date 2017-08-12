
function IDRMapMarker(pos, icon) {
    
    this.position = pos
    
    this.id = null
    
    this.image = icon
    
    this.className = 'IDRMapMarker'
    
    this.el = null
    
    var width = 60
    
    var height = 80
    
    this.addToSuperView = function(parent) {
        
        var markers = document.getElementById('markers')
        
        if (markers === null) {
            
            markers = document.createElementNS('http://www.w3.org/2000/svg','g')
            
            markers.id = 'markers'
            
            parent.appendChild(markers)
        }
        
        this.el = document.createElementNS('http://www.w3.org/2000/svg','image')
        
        this.el.setAttribute('id', this.id);
        
        this.el.setAttribute('width', width.toString())
        
        this.el.setAttribute('height', height.toString())
        
        this.el.href.baseVal = this.image
        
        markers.appendChild(this.el)
    }
    
    this.update = function(scale, rotate) {
        
        var a = scale * Math.cos(rotate)
        
        var b = -scale * Math.sin(rotate)
        
        var c = scale * Math.sin(rotate)
        
        var d = scale * Math.cos(rotate)
        
        var x = this.position.x - this.el.width.baseVal.value * 0.5 //use bottom middle
        
        var y = this.position.y - this.el.height.baseVal.value //use bottom middle
        
        var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + x + ',' + y + ')'
        
        this.el.style.transform = m
        
        this.el.style.webkitTransform = m
    }
    
    this.removeFromSuperView = function() {
        
        this.el.parentNode.removeChild(this.el)
    }
    
    this.resetPosition = function(p) {
        
        this.position = p
    }
}

function IDRCarMarker(pos, icon) {
    
    IDRMapMarker.call(this, pos, icon)
    
    this.className = 'IDRCarMarker'
}

function IDRFacMarker(pos, icon) {
    
    IDRMapMarker.call(this, pos, icon)
    
    this.className = 'IDRFacMarker'
}

function IDRStartMarker(pos, icon) {
    
    IDRMapMarker.call(this, pos, icon)
    
    this.className = 'IDRStartMarker'
}

function IDREndMarker(pos, icon) {
    
    IDRMapMarker.call(this, pos, icon)
    
    this.className = 'IDREndMarker'
}

var IDRMarkers = {
    "IDRMapMarker":IDRMapMarker,
    "IDRCarMarker":IDRCarMarker,
    "IDRFacMarker":IDRFacMarker,
    "IDRStartMarker":IDRStartMarker,
    "IDREndMarker":IDREndMarker
}

export { IDRMarkers as default }