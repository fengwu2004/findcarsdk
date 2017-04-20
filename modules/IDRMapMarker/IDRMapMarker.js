define(function (require, exports, module) {

    var css = document.createElement('link')

    css.type = 'text/css';

    css.rel = 'stylesheet';

    css.href = "../sdk/modules/IDRMapMarker/IDRMapMarker.css";

    var header = document.querySelector("head");

    header.appendChild(css)

	function IDRMapMarker(pos, id) {

        var _position = pos

		var _id = id

        this.className = 'IDRMapMarker'

        this.addToSuperView = function(parent) {

            var div = document.createElement("div");

            div.setAttribute("class", this.className);

            div.setAttribute("id", _id);

            div.style.position = 'absolute'

            div.style.top = '100px'

            div.style.left = '100px'

            var action = this.clickAction;

            div.addEventListener("click", function() {
                action(this);
            }, false);

            parent.appendChild(div);
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