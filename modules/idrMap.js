/**
 * Created by ky on 17-6-2.
 */
define(function (require, exports, module) {

    var IDRIndicator = require('./IDRIndicator/IDRIndicator')

    function IdrMap(mapView) {

        this.root = null

        var _mapView = mapView

        var _regionEx = null

        var _mapViewPort = null

        var _floorId = null

        var _floor = null

        var _unitDivs = null

        var _origScale = 0.5

        var _map = null

        var that = this

        var _idrIndicator = null

        this.init = function(regionEx, floorId, svg) {

            _regionEx = regionEx

            _floorId = floorId

            _floor = _regionEx.getFloorbyId(_floorId)

            _map = document.createElement('div')

            _map.id = 'mapRoot'

            _map.className = 'svg_box'

            _map.innerHTML = svg

            that.root = document.createElement('div')

            that.root.id = 'mapRoot'

            that.root.className = 'svg_box'

            that.root.appendChild(_map)
        }

        function addMapEvent() {

            var map = document.getElementById('background')

            if (!map) {

                var floor = _regionEx.getFloorbyId(floorId)

                map = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

                map.setAttribute('width', floor.width)

                map.setAttribute('height', floor.height)

                map.style.opacity = 0

                _mapViewPort.appendChild(map)
            }

            map.addEventListener('click', onMapClick, false)
        }

        function onMapClick(event) {

            var pos = {x:event.clientX, y:event.clientY, floorId:_floorId}

            _mapView.onMapClick(pos)
        }

        function onUnitClick(event) {

            var unit = that.regionEx.getUnitById(_floorId, event.currentTarget.id)

            _mapView.onClickUnit(unit)
        }

        function addUnitClickRect() {

            var unitList = _floor.unitList

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
        
        function addEvents() {

            addMapEvent()

            addUnitClickRect()
        }

        function addUnitsText(unitList) {

            _unitDivs = []

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

        function updateUnitAngleAndScale(scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            _unitDivs.forEach(function(unitSvg) {

                var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + unitSvg.centerX + ',' + unitSvg.centerY + ')'

                unitSvg.setAttribute('transform', m)
            })
        }

        function updateMarkerAngleAndScale(marker, scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            var x = marker.position.x - marker.el.width.baseVal.value * 0.5 //use bottom middle

            var y = marker.position.y - marker.el.height.baseVal.value //use bottom middle

            var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + x + ',' + y + ')'

            marker.el.style.transform = m

            marker.el.style.webkitTransform = m
        }

        function updateMarkersAngleAndScale(markers, scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            markers.forEach(function(marker) {

                var x = marker.position.x - marker.el.width.baseVal.value * 0.5 //use bottom middle

                var y = marker.position.y - marker.el.height.baseVal.value //use bottom middle

                var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + x + ',' + y + ')'

                marker.el.style.transform = m

                marker.el.style.webkitTransform = m
            })
        }
        
        function addMarker(marker) {

            marker.addToSuperView(_mapViewPort)

            var x = marker.position.x - marker.el.width.baseVal.value * 0.5 //use bottom middle

            var y = marker.position.y - marker.el.height.baseVal.value //use bottom middle

            var trans = 'matrix(' + _origScale + ',' + 0 + ',' + 0 + ',' + _origScale + ',' + x + ',' + y + ')'

            marker.el.style.zIndex = 2

            marker.el.style.transform = trans

            marker.el.style.webkitTransform = trans

            marker.el.style.transformOrigin = '50% 100% 0'

            marker.el.style.webkitTransformOrigin = '50% 100% 0'

            marker.el.addEventListener('click', onMarkerClick, true)
        }

        function onMarkerClick(event) {

            var markerId = event.currentTarget.id

            _mapView.onMarkerClick(_floorId, markerId)
        }

        function detach() {

            if (that.root) {

                that.root.parentNode.removeChild(that.root)
            }
        }
        
        function attachTo(containor) {

            containor.appendChild(that.root)

            _mapViewPort = document.getElementById('viewport')
        }

        function refreshUnits(units) {

            addUnitsText(units)
        }

        function setPos(pos) {

            if (_idrIndicator == null) {

                _idrIndicator = new IDRIndicator()

                _idrIndicator.creat(_mapViewPort, pos)
            }
            else  {

                _idrIndicator.updateLocation(pos)
            }
        }

        this.refreshUnits = refreshUnits

        this.detach = detach

        this.attachTo = attachTo

        this.addEvents = addEvents

        this.setPos = setPos

        this.addMarker = addMarker

        this.updateMarkerAngleAndScale = updateMarkerAngleAndScale

        this.updateMarkersAngleAndScale = updateMarkersAngleAndScale
    }

    module.exports = IdrMap
});