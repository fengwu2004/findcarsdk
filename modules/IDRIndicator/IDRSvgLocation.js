define(function (require, exports, module) {
	"use strict";

	var matrix2d = require('../mat2d')

    var vec2 = require('../vec2')

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

        var rootDom = null

        function creatSvgLocationDom(parentNode, position) {

            rootDom = document.getElementById("SvgLocation");

            if (rootDom) {

                updateLocation(position);

                return;
            }

            lastPosition = position

            rootDom = document.createElementNS("http://www.w3.org/2000/svg", "g");
            rootDom.setAttribute('id', 'SvgLocation')
            var mt = matrix2d.create()
            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + position.x + ',' + position.y + ')'
            rootDom.setAttribute('transform', trans)
            rootDom.setAttribute('transform-orgin', '50% 50% 0')

            parentNode.appendChild(rootDom);

            var waveDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            waveDom.href.baseVal = '../sdk/modules/IDRIndicator/img_locator_wave.png'
            waveDom.setAttribute('id', 'Locating')
            waveDom.setAttribute('width', '50px')
            waveDom.setAttribute('height', '50px')

            var point = document.createElementNS("http://www.w3.org/2000/svg", "image");
            point.href.baseVal = '../sdk/modules/IDRIndicator/img_di_point.png'
            point.setAttribute('id', 'LocatingBase')
            point.setAttribute('x', '20px')
            point.setAttribute('y', '20px')
            point.setAttribute('width', '10px')
            point.setAttribute('height', '10px')

            rootDom.appendChild(waveDom);
            rootDom.appendChild(point);
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

        var getTransArray = function(value) {

            if (value == null) {

                return [1, 0, 0, 1, 0, 0]
            }

            var temp = value.substring(7, value.length - 1)

            var valueT = temp.split(',')

            return [valueT[0], valueT[1], valueT[2], valueT[3], valueT[4], valueT[5]]
        }

        function updateScale(scale) {

            if (rootDom == null) {

                return
            }

            var trans = rootDom.getAttribute('transform')

            var mt = getTransArray(trans)

            matrix2d.scale(mt, mt, vec2.fromValues(scale ,scale))

            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + lastPosition.x + ',' + lastPosition.y + ')'

            rootDom.setAttribute('transform', trans)
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
