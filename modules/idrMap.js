/**
 * Created by ky on 17-6-2.
 */
define(function (require, exports, module) {

    var IDRIndicator = require('./IDRIndicator/IDRIndicator')

    var matrix2d = require('./mat2d')

    var vec2 = require('./vec2')

    var IDRPath = require('./IDRSvgPath/IDRSvgPolyLine')

    function IdrMap(mapView) {

        var maxScale = 1.5

        var minScale = 1

        var _mapScale = 1

        var _mapRotate = 0

        var _mapView = mapView

        var _regionEx = null

        var _mapViewPort = null

        var _idrPath = new IDRPath()

        var _markerOrigScale = 0.5

        var _floorId = null

        var _floor = null

        var _unitDivs = null

        var _origScale = 0.5

        var _map = null

        var _idrIndicator = null

        this.init = function(regionEx, floorId, svg) {

            _regionEx = regionEx

            _floorId = floorId

            _floor = _regionEx.getFloorbyId(_floorId)

            _map = document.createElement('div')

            _map.id = 'mapRoot'

            _map.className = 'svg_box'

            _map.innerHTML = svg
        }

        function addMapEvent() {

            var map = document.getElementById('background')

            if (!map) {

                map = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

                map.setAttribute('width', _floor.width)

                map.setAttribute('height', _floor.height)

                map.id = 'mapClickRect'

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

            var unit = _regionEx.getUnitById(_floorId, event.currentTarget.id)

            _mapView.onUnitClick(unit)
        }

        function addUnitClickRect() {

            var unitList = _floor.unitList

            var group = document.createElementNS('http://www.w3.org/2000/svg','g')

            group.id = 'unitClickRect'

            _mapViewPort.appendChild(group)

            for (var i = 0; i < unitList.length; ++i) {

                var unit = unitList[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','rect')

                unitSvg.id = unit.id

                unitSvg.setAttribute('x', unit.boundLeft)

                unitSvg.setAttribute('y', unit.boundTop)

                unitSvg.setAttribute('width', (unit.boundRight - unit.boundLeft).toString())

                unitSvg.setAttribute('height', (unit.boundBottom - unit.boundTop).toString())

                unitSvg.style.opacity = 0

                group.appendChild(unitSvg)

                unitSvg.addEventListener('click', onUnitClick, true)
            }
        }
        
        function addEvents() {

            addMapEvent()

            addUnitClickRect()
        }

        function addUnitsText(unitList) {

            _unitDivs = []

            var group = document.createElementNS('http://www.w3.org/2000/svg','g')

            group.id = 'unitText'

            _mapViewPort.appendChild(group)

            for (var i = 0; i < unitList.length; ++i) {

                var unit = unitList[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','text')

                unitSvg.innerHTML = unit.name

                _unitDivs.push(unitSvg)

                group.appendChild(unitSvg)

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

        function updateMarkers(markers, scale, rotate) {

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

            marker.update(_mapScale, _mapRotate)
        }

        function onMarkerClick(event) {

            var markerId = event.currentTarget.id

            _mapView.onMarkerClick(_floorId, markerId)
        }

        function detach() {

            if (_map) {

                _map.parentNode.removeChild(_map)
            }
        }
        
        function attachTo(containor) {

            containor.appendChild(_map)

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

        function resetMap() {

            var mapHeight = _floor.height

            var mapWidth = _floor.width

            var screenHeight = _map.clientHeight

            var screenWidth = _map.clientWidth

            var scale = mapWidth/screenWidth > mapHeight/screenHeight ? mapWidth/screenWidth : mapHeight/screenHeight

            scale = 1/scale

            scale = Math.min(scale, maxScale)

            var mt = matrix2d.create()

            matrix2d.scale(mt, mt, vec2.fromValues(scale, scale))

            matrix2d.mytranslate(mt, mt, vec2.fromValues(0.5 * screenWidth - 0.5 * mapWidth * scale, 0.5 * screenHeight - 0.5 * mapHeight * scale))

            updateMapViewTrans(mt)

            _mapRotate = null

            updateDisplay()
        }

        function scroll(screenVec) {

            var v = vec2.fromValues(screenVec[0], screenVec[1])

            var mt = getMapViewMatrix()

            matrix2d.mytranslate(mt, mt, v)

            updateMapViewTrans(mt)
        }
        
        function birdLook() {


        }

        function updateMapViewTrans(mt) {

            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + mt[4] + ',' + mt[5] + ')'

            _mapViewPort.setAttribute('transform', trans)
        }

        function showRoutePath(paths) {

            _idrPath.updateLine(_mapViewPort, paths)
        }

        function getTransArray(value) {

            if (value == null) {

                return [1, 0, 0, 1, 0, 0]
            }

            var temp = value.substring(7, value.length - 1)

            var valueT = temp.split(',')

            return [valueT[0], valueT[1], valueT[2], valueT[3], valueT[4], valueT[5]]
        }

        function getMapPos(svgPos) {

            var mt = getMapViewMatrix()

            matrix2d.invert(mt, mt)

            var posIn2d = vec2.fromValues(svgPos[0], svgPos[1])

            return vec2.transformMat2d(posIn2d, posIn2d, mt)
        }

        function getSvgPos(mapPos) {

            var mt = getMapViewMatrix()

            var posIn2d = vec2.fromValues(mapPos.x, mapPos.y)

            return vec2.transformMat2d(posIn2d, posIn2d, mt)
        }

        function getMapViewMatrix() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            return matrix2d.fromValues(mt[0], mt[1], mt[2], mt[3], mt[4], mt[5])
        }

        function zoom(scale, anchor) {

            var mt = getMapViewMatrix()

            var lastScale = Math.sqrt(mt[0] * mt[0] + mt[1] * mt[1])

            var factor = scale

            if (lastScale * scale > maxScale) {

                factor = maxScale/lastScale
            }

            if (lastScale * scale < minScale) {

                factor = minScale/lastScale
            }

            matrix2d.translate(mt, mt, vec2.fromValues(anchor[0], anchor[1]))

            matrix2d.scale(mt, mt, vec2.fromValues(factor, factor))

            matrix2d.translate(mt, mt, vec2.fromValues(-anchor[0], -anchor[1]))

            updateMapViewTrans(mt)
        }

        function rotate(rad, anchor) {

            var p = anchor

            var mt = getMapViewMatrix()

            matrix2d.translate(mt, mt, vec2.fromValues(p[0], p[1]))

            matrix2d.rotate(mt, mt, rad)

            matrix2d.translate(mt, mt, vec2.fromValues(-p[0], -p[1]))

            updateMapViewTrans(mt)
        }

        function centerPos(mapPos) {

            var center = vec2.fromValues(0.5 * _root.clientWidth, 0.5 * _root.clientHeight)

            var pos = getSvgPos(mapPos)

            var v = vec2.subtract(pos, center, pos)

            scroll(v)
        }

        function deTransform(transformList) {

            if (transformList.length != 6) {

                return false;
            }

            var a = transformList[0];
            var b = transformList[1];

            var c = transformList[2];
            var d = transformList[3];

            var tx = transformList[4];
            var ty = transformList[5];

            var sx = Math.sqrt(a * a + b * b);

            var a = Math.atan2(c, d);

            return {
                a: a,
                s: sx,
                tx: tx,
                ty: ty
            }
        }

        function getRotateAndScale() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            var mdecompose = deTransform(mt)

            return [mdecompose.s, mdecompose.a]
        }
        
        function updateDisplay() {

            var scaleRotate = getRotateAndScale()

            var scale = scaleRotate[0]

            var rotate = scaleRotate[1]

            if (_mapScale !== scale) {

                _idrIndicator && _idrIndicator.updateScale(1/scale)

                _idrPath && _idrPath.updateScale(1/scale)
            }

            if (_mapScale !== scale || _mapRotate !== rotate) {

                var markers = _mapView.getMarkers(_floorId)

                markers && updateMarkers(markers, _markerOrigScale * 1/scale, -1 * rotate)
            }

            _mapScale = scale

            _mapRotate = rotate
        }

        function updateMinScale() {

            var mapHeight = _floor.height

            var mapWidth = _floor.width

            var screenHeight = _map.clientHeight

            var screenWidth = _map.clientWidth

            var scale = mapWidth/screenWidth > mapHeight/screenHeight ? mapWidth/screenWidth : mapHeight/screenHeight

            minScale = Math.min(scale, minScale)
        }
        
        function resizeViewBox() {

            var nodes = _map.children

            if (!nodes || nodes.length == 0) {

                return
            }

            var svgMap = nodes[0]

            svgMap.viewBox.baseVal.width = _map.clientWidth

            svgMap.setAttribute('width', _map.clientWidth.toString())

            svgMap.viewBox.baseVal.height = _map.clientHeight

            svgMap.setAttribute('height', _map.clientHeight.toString())
        }
        
        function getMapScale() {

            return _mapScale
        }

        function getMapRotate() {

            return _mapRotate
        }
        
        this.getMapScale = getMapScale

        this.getMapRotate = getMapRotate
        
        this.refreshUnits = refreshUnits

        this.detach = detach

        this.attachTo = attachTo

        this.addEvents = addEvents

        this.setPos = setPos

        this.addMarker = addMarker

        this.resetMap = resetMap
        
        this.birdLook = birdLook

        this.showRoutePath = showRoutePath

        this.getMapViewMatrix = getMapViewMatrix

        this.getSvgPos = getSvgPos

        this.getMapPos = getMapPos

        this.zoom = zoom

        this.scroll = scroll

        this.rotate = rotate

        this.centerPos = centerPos

        this.updateDisplay = updateDisplay

        this.updateMinScale = updateMinScale
        
        this.resizeViewBox = resizeViewBox

        this.root = function () {

            return _map
        }
    }

    module.exports = IdrMap
});