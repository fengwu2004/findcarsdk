/**
 * Created by ky on 17-6-2.
 */
define(function (require, exports, module) {
    
    function IdrMap() {

        var _regionEx = null

        var _mapViewPort = null

        var _floorId = null

        var _unitDivs = null

        var _origScale = 0.5

        var _root = null

        this.init = function (regionEx, floorId, svg) {

            _regionEx = regionEx

            _floorId = floorId

            _root = document.createElement('div');

            _root.id = 'mapRoot';

            _root.className = 'svg_box';

            _root.innerHTML = svg;

            _mapViewPort = document.getElementById('viewport');

            var map = document.getElementById('background')

            if (!map) {

                var floor = regionEx.getFloorbyId(floorId)

                map = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

                map.setAttribute('width', floor.width)

                map.setAttribute('height', floor.height)

                map.style.opacity = 0

                _mapViewPort.appendChild(map)
            }

            map.addEventListener('click', onMapClick, false)
        }

        function addUnitClickRect(unitList) {

            for (var i = 0; i < unitList.length; ++i) {

                var unit = unitList[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','rect')

                unitSvg.id = unit.id

                unitSvg.setAttribute('x', unit.boundLeft)

                unitSvg.setAttribute('y', unit.boundTop)

                unitSvg.setAttribute('width', (unit.boundRight - unit.boundLeft).toString())

                unitSvg.setAttribute('height', (unit.boundBottom - unit.boundTop).toString())

                unitSvg.style.opacity = 0

                _mapViewPort.appendChild(unitSvg)

                unitSvg.addEventListener('click', onUnitClick, true)
            }
        }

        function addUnitsText(unitList) {

            for (var i = 0; i < unitList.length; ++i) {

                var unit = unitList[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','text')

                unitSvg.innerHTML = unit.name

                _unitDivs.push(unitSvg)

                _mapViewPort.appendChild(unitSvg)

                var center = [0.5 * (unit.boundLeft + unit.boundRight), 0.5 * (unit.boundTop + unit.boundBottom)]

                unitSvg.centerX = center[0]

                unitSvg.centerY = center[1]

                var trans = 'matrix(' + _origScale + ',' + 0 + ',' + 0 + ',' + _origScale + ',' + unitSvg.centerX + ',' + unitSvg.centerY + ')'

                unitSvg.setAttribute('transform-origin', '50% 50% 0')

                unitSvg.setAttribute('transform', trans)
            }
        }
        
        function addMarker(marker) {
            
        }

        function onMapClick(evt) {


        }

        function detach() {

            _root.parentNode.removeChild(_root)
        }

        this.detach = detach
    }

    module.exports = IdrMap
});