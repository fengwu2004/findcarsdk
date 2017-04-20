define(function (require, exports, module) {

    function IDRMapMarker(pos) {

        this.position = pos

		this.id = null

        this.className = 'IDRMapMarker'

        this.image = null

        this.addToSuperView = function(parent) {

            this.image = document.createElementNS('http://www.w3.org/2000/svg','image')

            this.image.setAttribute('id', this.id);

            this.image.setAttribute('x', this.position.x)

            this.image.setAttribute('y', this.position.y)

            this.image.setAttribute('width', 60/2)

            this.image.setAttribute('height', 80/2)

            this.image.href.baseVal = '../sdk/images/icon4.png'

            parent.appendChild(this.image)
        }

        this.removeFromSuperView = function() {

            this.image.parentNode.removeChild(this.image)
        }

        this.resetPosition = function(p) {

            _position = p
        }
    }
    
    function IDRCarMarker(pos) {

		IDRMapMarker.call(this, pos)

        this.className = 'IDRCarMarker'
    }
    
    function IDRFacMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.className = 'IDRFacMarker'
    }
    
    function IDRTempMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.className = 'IDRFacMarker'
    }

    function IDRStartMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.className = 'IDRStartMarker'
    }

    function IDREndMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.className = 'IDREndMarker'
    }

    module.exports = {
		"IDRMapMarker":IDRMapMarker,
		"IDRTempMarker":IDRTempMarker,
		"IDRCarMarker":IDRCarMarker,
		"IDRFacMarker":IDRFacMarker,
		"IDRTempMarker":IDRTempMarker,
		"IDRStartMarker":IDRStartMarker,
        "IDREndMarker":IDREndMarker}
});