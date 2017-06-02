/**
 * Created by yan on 09/02/2017.
 */

define(function (require, exports, module) {

    require('./alloy_finger')

    var matrix2d = require('./mat2d')

    var vec2 = require('./vec2')

    var networkManager = require('./idrNetworkManager');

    var idrFloorListControl = require('./idrFloorListControl');

    var idrDataMgr = require('./idrDataManager');

    var networkInstance = require('./idrNetworkManager')

    var IDRPath = require('./IDRSvgPath/IDRSvgPolyLine')

    var IDRRouter = require('./idrRouter')

    var IDRRegionEx = require('./idrRegionEx')

    var IDRUnit = require('./idrUnit')

    var IDRIndicator = require('./IDRIndicator/IDRIndicator')

    var IDRMapMarkers = require('./IDRMapMarker/IDRMapMarker')

    var IDRCarMarker = IDRMapMarkers['IDRCarMarker']

    var IDRComposs = require('./Composs/IDRComposs')

    var IDRMapEventModule = require('./idrMapEvent')

    var IDRCoreManager = require('./idrCoreManager')

    var IDRMapEvent = IDRMapEventModule[0]

    var IDRLocationServer = require('./idrLocationServer')

    var IdrMap = require('./idrMap')

    function idrMapView() {

        this.eventTypes = IDRMapEventModule[1]

        this.regionEx = null

        var _locator = new IDRLocationServer()

        var _router = null

        var maxScale = 1.5

        var minScale = 0.5

        var _containerId = null

        var _currentPos = null

        var _regionId = null

        var _currentFloorId = null

        var _refreshTimer = null

        var _svgFrame = null

        var _mapViewPort = null

        var _floorListControl = null

        var _svgBox = null

        var _units = []

        var _unitDivs = []

        var _mapScale = 1

        var _mapRotate = 0

        var _origScale = 0.5

        var _markerOrigScale = 1

        var _gestures = null

        var _mapEvent = new IDRMapEvent()

        var _markers = {}

        var _idrIndicator = null

        var _composs = null

        var that = this

        var _idrPath = new IDRPath()

        var _floorMaps = {}

        function addFloorList() {

            _floorListControl = new idrFloorListControl()

            _floorListControl.setChangeFloorFunc(that, changeFloor)

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            _floorListControl.init(_svgFrame, that.regionEx['floorList'], floor)
        }

        function addMap(data) {

            var svg = data;

            var oSvgBox = document.getElementById('svgBox');

            oSvgBox.innerHTML = svg;

            //给每个unit添加一个id

            var aUnit = document.querySelector('#unit');

            var aUnit1 = document.querySelector('#unit_1_');

            if (aUnit) {

                var aPolygon = aUnit.getElementsByTagName('polygon');

                var aRect = aUnit.getElementsByTagName('rect');

                for (var i = 0; i < aPolygon.length; i++) {

                    aPolygon[i].id = 'unit_' + i;
                }

                for (i = 0; i < aRect.length; i++) {

                    aRect[i].id = 'rect_' + i;
                }
            }

            if (aUnit1) {

                var aR = aUnit1.getElementsByTagName('rect');

                Array.prototype.forEach.call(aR, function (node, index, array) {

                    node.id = 'rect_' + index;
                })
            }
            
            _mapViewPort = document.getElementById('viewport');

            var map = document.getElementById('background')

            if (!map) {

                var floor = that.regionEx.getFloorbyId(_currentFloorId)

                map = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

                map.width = floor.width

                map.height = floor.height

                _mapViewPort.appendChild(map)
            }

            map.addEventListener('click', onMapClick, false)

            addGestures(oSvgBox)

            getAllUnits()
        }
        
        function onMapClick(evt) {

            _mapEvent.fireEvent(that.eventTypes.onMapClick, {x:evt.clientX, y:evt.clientY, floorId:_currentFloorId})
        }

        function getTouchCenter(p) {

            var im = matrix2d.create()

            im = matrix2d.invert(im, getMapViewMatrix())

            vec2.transformMat2d(p, p, im)

            return p
        }

        function getTouchesCenter(evt) {

            var x = (evt.touches[0].pageX + evt.touches[1].pageX)/2

            var y = (evt.touches[0].pageY + evt.touches[1].pageY)/2

            var p = vec2.fromValues(x, y)

            var im = matrix2d.create()

            matrix2d.invert(im, getMapViewMatrix())

            vec2.transformMat2d(p, p, im)

            return p
        }

        function onPinch(evt) {

            var p = getTouchesCenter(evt)

            zoom(evt.gradualscale, p)
        }

        function onRoate(evt) {

            var p = getTouchesCenter(evt)

            rotate(evt.angle * Math.PI/180, p)
        }

        function onPan(evt) {

            scroll([evt.deltaX, evt.deltaY])
        }

        function addGestures() {

            _gestures = new AlloyFinger(_svgFrame, {

                rotate:onRoate,

                pinch:onPinch,

                pressMove:onPan
            })
        }
        
        function addUnitsText() {

            for (var i = 0; i < _units.length; ++i) {

                var unit = _units[i]

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
        
        function getTargetFloorPoints(path, floorId) {

            for (var i = 0; i < path.paths.length; ++i) {

                var floorPath = path.paths[i]

                if (floorPath.floorId === _currentFloorId) {

                    return floorPath.position
                }
            }

            return null
        }
        
        function doLocation(locateCallback) {

            _locator.start(_regionId, _currentFloorId, locateCallback, null)
        }
        
        function doRoute(start, end) {

            var path = _router.routerPath(start, end, false)

            var currFloorPoints = getTargetFloorPoints(path, _currentFloorId)

            if (currFloorPoints) {

                showRoutePath(currFloorPoints)
            }
        }
        
        function showRoutePath(paths) {

            _idrPath.updateLine(_mapViewPort, paths)
        }

        function addUnitClickRect() {

            for (var i = 0; i < _units.length; ++i) {

                var unit = _units[i]

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
        
        function onUnitClick(event) {

            var unit = that.regionEx.getUnitById(_currentFloorId, event.currentTarget.id)

            _mapEvent.fireEvent(that.eventTypes.onUnitClick, unit)
        }

        function addUnits(unitsInfo) {

            _units = []

            for (var i = 0; i < unitsInfo.length; ++i) {

                _units.push(new IDRUnit(unitsInfo[i]))
            }

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            floor.unitList = _units

            addUnitsText()
            
            addUnitClickRect()
        }

        function getAllUnits() {

            networkInstance.serverCallUnits(_regionId, _currentFloorId,

                function (data) {

                    addUnits(data)
                },

                function (str) {

                    alert('获取unit失败!' + str);
                }
            )
        }

        function createMap(svg, regionId, floorId) {

            removePreviousMap();

            addMap(svg, regionId, floorId);
        }

        function removePreviousMap() {

            if (_svgFrame) {

                _svgBox = document.querySelector('#svgBox');

                var gtext = document.querySelector('#g_txt');

                var lines = document.querySelector('#line');

                _svgBox.innerHTML = '';

                gtext.innerHTML = '';

                lines.innerHTML = '';
            }
            else {

                _svgFrame = document.createElement('div');

                _svgFrame.id = 'svgFrame';

                _svgFrame.className = 'svg_frame';

                _svgBox = document.createElement('div');

                _svgBox.id = 'svgBox';

                _svgBox.className = 'svg_box';

                var gText = document.createElement('div');

                gText.id = 'g_txt';

                gText.className = 'gTxt';

                lines = document.createElement('div');

                lines.id = 'line';

                _svgFrame.appendChild(_svgBox);

                _svgFrame.appendChild(gText);

                _svgFrame.appendChild(lines);

                var ele = document.getElementById(_containerId)

                ele.appendChild(_svgFrame);
            }
        }

        function setDisplayTimer() {

            _refreshTimer = setInterval(updateDisplay, 100)
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

        function getTransArray(value) {

            if (value == null) {

                return [1, 0, 0, 1, 0, 0]
            }

            var temp = value.substring(7, value.length - 1)

            var valueT = temp.split(',')

            return [valueT[0], valueT[1], valueT[2], valueT[3], valueT[4], valueT[5]]
        }

        function updateDisplay() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            var mdecompose = deTransform(mt)

            if (_idrIndicator && _mapScale !== mdecompose.s) {

                _idrIndicator.updateScale(1/mdecompose.s)
            }

            if (_idrPath && _mapScale !== mdecompose.s) {

                _idrPath.updateScale(1/mdecompose.s)
            }

            if (_mapScale !== mdecompose.s || _mapRotate !== mdecompose.a) {

                // updateUnitAngleAndScale(_origScale * 1/mdecompose.s, -1 * _mapRotate)

                updateMarkersAngleAndScale(_markerOrigScale * 1/mdecompose.s, -1 * _mapRotate)
            }

            if (_composs || _mapRotate !== mdecompose.a) {

                _composs.rotateToDegree(-1 * _mapRotate * 180/Math.PI)
            }

            _mapScale = mdecompose.s

            _mapRotate = mdecompose.a
        }

        function updateMarkerScaleAngle(marker, scale, rotate) {

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

         function updateMarkersAngleAndScale(scale, rotate) {

            var markers = _markers[_currentFloorId]

            if (markers == undefined) {

                return
            }

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
        
        function addComposs() {

            if (_composs) {

                return
            }

            var div = document.createElement('div')

            div.setAttribute('id', 'composs')

            document.getElementById('svgFrame').appendChild(div)

            _composs = new IDRComposs('composs', 0, that)
        }
        
        function retriveMap() {

            networkManager.serverCallSvgMap(_regionId, _currentFloorId, function(data) {

                createMap(data, _regionId, _currentFloorId)

                onLoadMapSuccess()

            }, function() {

                alert('地图数据获取失败!' + data);
            })
        }

        function changeFloor(floorId) {

            if (floorId === _currentFloorId) {

                return
            }

            _currentFloorId = floorId

            retriveMap()
        }
        
        function initMap(appid, containerId, regionId) {

            _containerId = containerId

            IDRCoreManager.init(appid, function() {

                idrDataMgr.loadRegionInfo(regionId, function(regionAllInfo) {

                    that.regionEx = new IDRRegionEx(regionAllInfo)

                    _router = new IDRRouter(regionId, that.regionEx.floorList, function () {

                        console.log('path data load success')
                    })

                    _regionId = regionId

                    _mapEvent.fireEvent(that.eventTypes.onInitMapSuccess, regionAllInfo)

                }, function() {

                    console.log('load region data failed')
                })
            })
        }
        
        function onLoadMapSuccess() {

            if (_floorListControl == null) {

                addFloorList()

                addComposs()
            }

            if (_refreshTimer == null) {

                setDisplayTimer()
            }

            updateMinScale()

            _mapEvent.fireEvent(that.eventTypes.onFloorChangeSuccess, {floorId:_currentFloorId, regionId:_regionId})
        }

        function addEventListener(type, fn) {

            return _mapEvent.addEvent(type, fn)
        }

        function removeEventListener(type) {

            return _mapEvent.removeEvent(type)
        }
        
        function fireEvent(type, data) {

            return _mapEvent.fireEvent(type, data)
        }

        function removeMarker(deleteMarker) {

            var temp = new Array()

            for (var i = 0; i < _markers[deleteMarker.position.floorId].length; ++i) {

                var marker = _markers[deleteMarker.position.floorId][i]

                if (marker.id !== deleteMarker.id) {

                    temp.push(marker)
                }
            }

            _markers[marker.position.floorId] = temp

            marker.removeFromSuperView()
        }

        function addMarker(marker) {

            if (!_markers.hasOwnProperty(marker.position.floorId)) {

                _markers[marker.position.floorId] = new Array()
            }

            _markers[marker.position.floorId].push(marker)

            marker.id = 'marker_' + marker.position.floorId + '_' + _markers[marker.position.floorId].length

            marker.addToSuperView(_mapViewPort)

            var x = marker.position.x - marker.el.width.baseVal.value * 0.5 //use bottom middle

            var y = marker.position.y - marker.el.height.baseVal.value //use bottom middle

            var trans = 'matrix(' + _markerOrigScale + ',' + 0 + ',' + 0 + ',' + _markerOrigScale + ',' + x + ',' + y + ')'

            marker.el.style.zIndex = 2

            marker.el.style.transform = trans

            marker.el.style.webkitTransform = trans

            marker.el.style.transformOrigin = '50% 100% 0'

            marker.el.style.webkitTransformOrigin = '50% 100% 0'

            marker.el.addEventListener('click', onMarkerClick, true)

            updateMarkerScaleAngle(marker, _markerOrigScale/_mapScale, -1 * _mapRotate)

            return marker
        }

        function findMarker(floorId, markerId) {

            if (!_markers.hasOwnProperty(floorId)) {

                return null
            }

            var markersArray = _markers[floorId]

            for (var i = 0; i < markersArray.length; ++i) {

                if (markerId === markersArray[i].id) {

                    return markersArray[i]
                }
            }

            return null
        }

        function onMarkerClick(event) {

            var markerId = event.currentTarget.id

            var marker = findMarker(_currentFloorId, markerId)

            _mapEvent.fireEvent(that.eventTypes.onMarkerClick, marker)
        }

        this.addPoint = function(p) {

            var circle = document.createElementNS('http://www.w3.org/2000/svg','circle')

            circle.setAttribute('cx', p.x.toString())

            circle.setAttribute('cy', p.y.toString())

            circle.setAttribute('r', '10')

            circle.setAttribute('fill', 'red')

            _mapViewPort.appendChild(circle)
        }

        function onTestClick() {

            addComposs()
        }

        function getMapViewMatrix() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            return matrix2d.fromValues(mt[0], mt[1], mt[2], mt[3], mt[4], mt[5])
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

        function updateMapViewTrans(mt) {

            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + mt[4] + ',' + mt[5] + ')'

            _mapViewPort.setAttribute('transform', trans)
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
        
        function scroll(screenVec) {

            var v = vec2.fromValues(screenVec[0], screenVec[1])

            var mt = getMapViewMatrix()

            matrix2d.mytranslate(mt, mt, v)

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

            var center = vec2.fromValues(0.5 * _svgFrame.clientWidth, 0.5 * _svgFrame.clientHeight)

            var pos = getSvgPos(mapPos)

            var v = vec2.subtract(pos, center, pos)

            scroll(v)
        }
        
        function updateMinScale() {

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            var mapHeight = floor.height

            var mapWidth = floor.width

            var screenHeight = _svgFrame.clientHeight

            var screenWidth = _svgFrame.clientWidth

            var scale = mapWidth/screenWidth > mapHeight/screenHeight ? mapWidth/screenWidth : mapHeight/screenHeight

            minScale = Math.min(scale, minScale)
        }

        function resetMap() {

            console.log('resetMap')

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            var mapHeight = floor.height

            var mapWidth = floor.width

            var screenHeight = _svgFrame.clientHeight

            var screenWidth = _svgFrame.clientWidth

            var scale = mapWidth/screenWidth > mapHeight/screenHeight ? mapWidth/screenWidth : mapHeight/screenHeight

            scale = 1/scale

            scale = Math.min(scale, maxScale)

            var mt = matrix2d.create()

            matrix2d.scale(mt, mt, vec2.fromValues(scale, scale))

            matrix2d.mytranslate(mt, mt, vec2.fromValues(0, 0.5 * screenHeight - 0.5 * mapHeight * scale))

            updateMapViewTrans(mt)

            _mapRotate = null

            updateDisplay()
        }
        
        function birdLook() {


        }
        
        function setUserPos(pos) {

            _currentPos = pos

            if (_idrIndicator == null) {

                _idrIndicator = new IDRIndicator()

                _idrIndicator.creat(_mapViewPort, _currentPos)
            }
            else  {

                _idrIndicator.updateLocation(_currentPos)
            }
        }
        
        function setPos(pos) {

            if (pos.floorId !== _currentFloorId) {

                changeFloor(pos.floorId)
            }
            else  {

                setUserPos(pos)
            }
        }

        this.centerPos = centerPos

        this.resetMap = resetMap

        this.birdLook = birdLook

        this.getMapPos = getMapPos

        this.getSvgPos = getSvgPos

        this.zoom = zoom

        this.scroll = scroll

        this.rotate = rotate

        this.setCurrPos = setUserPos

        this.addMarker = addMarker

        this.removeMarker = removeMarker

        this.changeFloor = changeFloor

        this.showRootPath = showRoutePath

        this.addComposs = addComposs

        this.initMap = initMap

        this.addEventListener = addEventListener

        this.removeEventListener = removeEventListener

        this.fireEvent = fireEvent

        this.doRoute = doRoute

        this.doLocation = doLocation
    }

    module.exports = idrMapView;
});