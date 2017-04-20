define(function (require, exports, module) {

    function IDRMapMarker(pos) {

        this.position = pos

		this.id = null

        this.image = '../sdk/images/icon4.png'

        this.className = 'IDRMapMarker'

        this.el = null

        this.addToSuperView = function(parent) {

            this.el = document.createElementNS('http://www.w3.org/2000/svg','image')

            this.el.setAttribute('id', this.id);

            this.el.setAttribute('x', this.position.x)

            this.el.setAttribute('y', this.position.y)

            this.el.setAttribute('width', 60/2)

            this.el.setAttribute('height', 80/2)

            this.el.href.baseVal = this.image

            parent.appendChild(this.el)
        }

        this.removeFromSuperView = function() {

            this.el.parentNode.removeChild(this.el)
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