define(function (require, exports, module) {

    var resource = require('../IDRResourceDefine')

    function IDRMapMarker(pos) {

        this.position = pos

		this.id = null

        this.image = resource.mapMarker

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

        this.image = resource.carMarker

        this.className = 'IDRCarMarker'
    }
    
    function IDRFacMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.image = resource.facMarker

        this.className = 'IDRFacMarker'
    }

    function IDRStartMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.image = resource.startMarker

        this.className = 'IDRStartMarker'
    }

    function IDREndMarker(pos) {

        IDRMapMarker.call(this, pos)

        this.image = resource.endMarker

        this.className = 'IDREndMarker'
    }

    module.exports = {
		"IDRMapMarker":IDRMapMarker,
		"IDRCarMarker":IDRCarMarker,
		"IDRFacMarker":IDRFacMarker,
		"IDRStartMarker":IDRStartMarker,
        "IDREndMarker":IDREndMarker}
});