
function IDRMapMarker(pos, icon) {
    
    this.position = pos
    
    this.id = null
    
    this.image = icon
    
    this.className = 'IDRMapMarker'
    
    this.el = null
    
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

function IDRTempMarker(pos, icon) {
	
	IDRMapMarker.call(this, pos, icon)
	
	this.className = 'IDRTempMarker'
}

function IDRTreasureboxMarker(pos, icon) {

    IDRMapMarker.call(this, pos, icon)

    this.className = 'IDRTreasureboxMarker'
}

function IDROpenedTreasureboxMarker(pos, icon) {

    IDRMapMarker.call(this, pos, icon)

    this.className = 'IDROpenedTreasureboxMarker'
}

var IDRMarkers = {
    "IDRMapMarker":IDRMapMarker,
    "IDRCarMarker":IDRCarMarker,
    "IDRFacMarker":IDRFacMarker,
    "IDRStartMarker":IDRStartMarker,
    "IDREndMarker":IDREndMarker,
    "IDRTempMarker":IDRTempMarker,
    "IDRTreasureboxMarker":IDRTreasureboxMarker,
    "IDROpenedTreasureboxMarker":IDROpenedTreasureboxMarker
}

export { IDRMarkers as default }