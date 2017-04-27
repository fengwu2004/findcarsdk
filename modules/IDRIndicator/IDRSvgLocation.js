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
            rootDom.setAttribute('transform-origin', '50% 50% 0')

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

            var trans = rootDom.getAttribute('transform')

            var mt = getTransArray(trans)

            if (!lastPosition) {

                var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + position.x + ',' + position.y + ')'

                rootDom.setAttribute('transform', trans)

                lastPosition = position;

                return
            }

            var anim = document.getElementById('move')

            if (anim == null) {

                anim = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");

                rootDom.appendChild(anim)
            }

            anim.setAttribute('id', 'move')

            anim.setAttribute('attributeName', 'transform')

            anim.setAttribute('begin', '0s')

            anim.setAttribute('dur', '3s')

            anim.setAttribute('type', 'translate')

            anim.setAttribute('from', lastPosition.x + ' ' + lastPosition.y)

            anim.setAttribute('to', position.x + ' ' + position.y)

            lastPosition = position;

            isAnimation = true;

            setTimeout(function() {

                var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + position.x + ',' + position.y + ')'

                rootDom.setAttribute('transform', trans)

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

            var trans = 'matrix(' + scale + ',' + mt[1] + ',' + mt[2] + ',' + scale + ',' + mt[4] + ',' + mt[5] + ')'

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
