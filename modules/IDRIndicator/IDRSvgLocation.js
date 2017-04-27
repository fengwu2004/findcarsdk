define(function (require, exports, module) {
	"use strict";

	var matrix2d = require('../mat2d')

    var vec2 = require('../vec2')

    var IDRSvgLocation = function() {

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

        var waveDom = null

        var centerDom = null

        var moveSpeed = 1

        function creatSvgLocationDom(parentNode, position) {

            rootDom = document.getElementById("indicator");

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

            waveDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            waveDom.href.baseVal = '../sdk/modules/IDRIndicator/img_locator_wave.png'
            waveDom.setAttribute('id', 'wave')
            waveDom.setAttribute('width', '50px')
            waveDom.setAttribute('height', '50px')

            centerDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            centerDom.href.baseVal = '../sdk/modules/IDRIndicator/img_di_point.png'
            centerDom.setAttribute('id', 'center')
            centerDom.setAttribute('x', '20px')
            centerDom.setAttribute('y', '20px')
            centerDom.setAttribute('width', '10px')
            centerDom.setAttribute('height', '10px')

            rootDom.appendChild(waveDom);
            rootDom.appendChild(centerDom);
        }

        function updateLocation(position) {

            var trans = rootDom.getAttribute('transform')

            var mt = getTransArray(trans)

            if (!lastPosition) {

                var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + position.x + ',' + position.y + ')'

                rootDom.setAttribute('transform', trans)

                lastPosition = position;

                return
            }

            var frames = window.requestAnimationFrame(onAnim)

            var count = 0

            var time = Math.sqrt((position.x - lastPosition.x) * (position.x - lastPosition.x) + (position.y - lastPosition.y) * (position.y - lastPosition.y))/speeds

            time = time * 60

            if (time == 0) {

                time = 1
            }

            var xOffsetX = (position.x - lastPosition.x)/time

            var xOffsetY = (position.y - lastPosition.y)/time
            
            function onAnim() {

                if (count > time) {

                    window.cancelAnimationFrame(frames)

                    lastPosition = position;

                    return
                }

                var trans = rootDom.getAttribute('transform')

                var mt = getTransArray(trans)

                mt[4] = xOffsetX + parseFloat(mt[4])

                mt[5] = xOffsetY + parseFloat(mt[5])

                var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + mt[4] + ',' + mt[5] + ')'

                rootDom.setAttribute('transform', trans)

                ++count

                frames = window.requestAnimationFrame(onAnim)
            }
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
