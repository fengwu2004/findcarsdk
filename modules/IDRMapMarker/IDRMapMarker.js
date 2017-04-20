define(function (require, exports, module) {

    var css = document.createElement('link')

    css.type = 'text/css';

    css.rel = 'stylesheet';

    css.href = "../sdk/modules/IDRMapMarker/IDRMapMarker.css";

    var header = document.querySelector("head");

    header.appendChild(css)

	function IDRMapMarker(pos) {

        this.position = pos

		this.id = null

        this.className = 'IDRMapMarker'

        this.addToSuperView = function(parent) {

            var image = document.createElementNS('http://www.w3.org/2000/svg','image')

            image.setAttribute('id', this.id);

            image.setAttribute('x', this.position.x)

            image.setAttribute('y', this.position.y)

            image.setAttribute('width', '50px')

            image.setAttribute('height', '100px')

            image.setAttribute('xlink:href', 'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/images/icon4.png')

            parent.appendChild(image);
        }

        this.removeFromSuperView = function() {

            var selfElement = document.getElementById(this.id);

            var parentElement = selfElement.parentNode;

            if (parentElement) {

                parentElement.removeChild(selfElement);
            }
        }

        this.resetPosition = function(p) {

            _position = p
        }
    }
    
    function IDRCarMarker(pos, id) {

		IDRMapMarker.call(this, pos, id)

        this.className = 'IDRCarMarker'
    }
    
    function IDRFacMarker(pos, id) {

        IDRMapMarker.call(this, pos, id)

        this.className = 'IDRFacMarker'
    }
    
    function IDRTempMarker(pos, id) {

        IDRMapMarker.call(this, pos, id)

        this.className = 'IDRFacMarker'
    }

    function IDRStartMarker(pos, id) {

        IDRMapMarker.call(this, pos, id)

        this.className = 'IDRStartMarker'
    }

    function IDREndMarker(pos, id) {

        IDRMapMarker.call(this, pos, id)

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