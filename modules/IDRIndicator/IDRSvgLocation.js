define(function (require, exports, module) {
	"use strict";

    var IDRSvgLocation = function() {

		/*

		 <svg id="SvgLocation" x="100" y="100" height="50px" width="50px">

		 <image id="Loacating" xlink:href="img_locator_wave.png" x="0" y="0" height="50px" width="50px">
		 </image>
		 <image id="LoacatingBase" xlink:href="img_di_point.png" x="20" y="20" height="10px" width="10px">
		 </image>

		 <animate id="x" attributeName="x" to="60" begin="0s" dur="1s" fill="freeze" />
		 <animate id="y" attributeName="y" to="60" begin="0s" dur="1s" fill="freeze" />

		 </svg>
		 */

        var css = document.createElement('link')

        css.type = 'text/css';

        css.rel = 'stylesheet';

        css.href = "../sdk/modules/IDRIndicator/IDRSvgLocation.css";

        var header = document.querySelector("head");

        header.appendChild(css)

        var lastPosition = null;

        var lastScale = 1.0;

        var isAnimation = false;

        function creatSvgLocationDom(parentNode, position) {

            var locationDom = document.getElementById("SvgLocation");

            if (locationDom) {

                updateLocation(position);

                return;
            }

            locationDom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            locationDom.setAttribute('id', 'SvgLocation')
            locationDom.setAttribute("x", position.x);
            locationDom.setAttribute("y", position.y);

            parentNode.appendChild(locationDom);

            var waveDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            waveDom.href.baseVal = '../sdk/modules/IDRIndicator/img_locator_wave.png'
            waveDom.setAttribute('id', 'Locating')

            var point = document.createElementNS("http://www.w3.org/2000/svg", "image");
            point.href.baseVal = '../sdk/modules/IDRIndicator/img_di_point.png'
            point.setAttribute('id', 'LocatingBase')
            point.setAttribute('x', '20px')
            point.setAttribute('y', '20px')
            point.setAttribute('width', '10px')
            point.setAttribute('height', '10px')

            locationDom.appendChild(waveDom);
            locationDom.appendChild(point);
        }

        function updateLocation(position) {

            if (isAnimation) {

                return;
            }

            var locationDom = document.getElementById("SvgLocation");

            if (!lastPosition) {

                var xAnimationDom = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                xAnimationDom.innerHTML = "<animate id=xAnimationDom attributeName=x begin=indefinite from=0 to=0 dur=1s repeatCount=indefinite/>";
                xAnimationDom = xAnimationDom.childNodes[0];

                var yAnimationDom = document.createElementNS("http://www.w3.org/2000/svg", "animate");
                yAnimationDom.innerHTML = "<animate id=yAnimationDom attributeName=y begin=indefinite from=0 to=0 dur=1s repeatCount=indefinite/>";
                yAnimationDom = yAnimationDom.childNodes[0];

                locationDom.appendChild(xAnimationDom);
                locationDom.appendChild(yAnimationDom);

                lastPosition = position;
            }

            var xAnimationDom = document.getElementById("xAnimationDom");
            var yAnimationDom = document.getElementById("yAnimationDom");

            xAnimationDom.setAttribute("from", lastPosition.x);
            xAnimationDom.setAttribute("to", position.x);
            yAnimationDom.setAttribute("from", lastPosition.y);
            yAnimationDom.setAttribute("to", position.y);

            xAnimationDom.beginElement();
            yAnimationDom.beginElement();

            lastPosition = position;

            isAnimation = true;

            setTimeout(function() {
                locationDom.setAttribute("x", position.x);
                locationDom.setAttribute("y", position.y);
                isAnimation = false;
            }, 1000);

        }

        function updateScale(scale) {

            var locationDom = document.getElementById("SvgLocation");
            locationDom.style.transform = "scale(" + scale + ")";

            var width = 50 * scale + "px";
            var index = (50 - 50 * scale) / 2 + "px";

            var loacatingDom = document.getElementById("Locating");
            loacatingDom.style.transform = "scale(" + scale + ")";
            loacatingDom.setAttribute("width", width);
            loacatingDom.setAttribute("height", width);
            loacatingDom.setAttribute("x", index);
            loacatingDom.setAttribute("y", index);

            var locatingBase = document.getElementById("LocatingBase");
            locatingBase.style.transform = "scale(" + scale + ")";
        }

        function updateShownState(show) {

            var locationDom = document.getElementById("SvgLocation");

            if (show) {

                locationDom.style.display = "inline";
            } else {

                locationDom.style.display = "none";
            }
        }

        return {
            creatSvgLocationDom: creatSvgLocationDom,
            updateLocation: updateLocation,
            updateScale: updateScale,
            updateShownState: updateShownState
        }
    };

    module.exports = IDRSvgLocation
})
