define(function (require, exports, module) {

    var matrix2d = require('../mat2d')

    var vec2 = require('../vec2')

    function IDRIndicator() {

        var css = document.createElement('link')

        css.type = 'text/css';

        css.rel = 'stylesheet';

        css.href = modules + "/IDRIndicator/IDRIndicator.css";

        var header = document.querySelector("head");

        header.appendChild(css)

        var lastPosition = null;

        var lastScale = 1.0;

        var isAnimation = false;

        var rootDom = null

        var waveDom = null

        var centerDom = null

        var moveSpeed = 2

        var width = 50

        var centerWidth = 10

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
            var x = position.x - width/2
            var y = position.y - width/2
            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + x + ',' + y + ')'
            rootDom.setAttribute('transform', trans)
            rootDom.setAttribute('transform-origin', '50% 50% 0')

            parentNode.appendChild(rootDom);

            waveDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            waveDom.href.baseVal = modules + '/IDRIndicator/img_locator_wave.png'
            waveDom.setAttribute('id', 'wave')
            waveDom.setAttribute('width', width.toString() + 'px')
            waveDom.setAttribute('height', width.toString() + 'px')

            centerDom = document.createElementNS("http://www.w3.org/2000/svg", "image");
            centerDom.href.baseVal = modules + '/IDRIndicator/img_di_point.png'
            centerDom.setAttribute('id', 'center')
            x = (width - centerWidth)/2
            centerDom.setAttribute('x', x.toString() + 'px')
            centerDom.setAttribute('y', x.toString() + 'px')
            centerDom.setAttribute('width', centerWidth.toString() + 'px')
            centerDom.setAttribute('height',centerWidth.toString() + 'px')

            rootDom.appendChild(waveDom);
            rootDom.appendChild(centerDom);
        }

        function updateLocation(position) {

            var trans = rootDom.getAttribute('transform')

            var mt = getTransArray(trans)

            if (!lastPosition) {

                var x = position.x - width/2

                var y = position.y - width/2

                var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + x + ',' + y + ')'

                rootDom.setAttribute('transform', trans)

                lastPosition = position;

                return
            }

            beginMove(position)
        }

        function beginMove(position) {

            var count = 0

            var time = Math.sqrt((position.x - lastPosition.x) * (position.x - lastPosition.x) + (position.y - lastPosition.y) * (position.y - lastPosition.y)) / (moveSpeed * 10)

            time = time * 60

            time = Math.max(1, time)

            time = Math.min(59, time)

            var xOffsetX = (position.x - lastPosition.x) / time

            var xOffsetY = (position.y - lastPosition.y) / time

            var frames = window.requestAnimationFrame(onAnim)

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

        function getTransArray(value) {

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

        this.creatSvgLocationDom = creatSvgLocationDom
        this.updateLocation = updateLocation
        this.updateScale = updateScale
        this.updateShownState = updateShownState
    }

    module.exports = IDRIndicator
});
