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

        var _floorListControl = null

        var _units = []

        var _unitDivs = []

        var _mapScale = 1

        var _mapRotate = 0

        var _mapRoot = null

        var _markerOrigScale = 1

        var _gestures = null

        var _mapEvent = new IDRMapEvent()

        var _markers = {}

        var _idrMap = new IdrMap()

        var _composs = null

        var that = this

        var _idrPath = new IDRPath()

        var _floorMaps = {}

        function addFloorList() {

            _floorListControl = new idrFloorListControl()

            _floorListControl.setChangeFloorFunc(that, changeFloor)

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            _floorListControl.init(document.getElementById(_containerId), that.regionEx['floorList'], floor)
        }

        function onMapClick(pos) {

            _mapEvent.fireEvent(that.eventTypes.onMapClick, pos)
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

            _gestures = new AlloyFinger(_idrMap.root, {

                rotate:onRoate,

                pinch:onPinch,

                pressMove:onPan
            })
        }
        
        function addUnitsText() {

            _idrMap.refreshUnits()
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
        
        function onUnitClick(unit) {

            _mapEvent.fireEvent(that.eventTypes.onUnitClick, unit)
        }

        function storeUnits(unitsInfo) {

            _units = []

            for (var i = 0; i < unitsInfo.length; ++i) {

                _units.push(new IDRUnit(unitsInfo[i]))
            }

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            floor.unitList = _units

            return floor.unitList
        }

        function loadUnits() {

            networkInstance.serverCallUnits(_regionId, _currentFloorId,

                function (data) {

                    var units = storeUnits(data)

                    _idrMap.refreshUnits(units)

                    _idrMap.addEvents()
                },

                function (str) {

                    alert('获取unit失败!' + str);
                }
            )
        }

        function createMap(svgData) {

            _idrMap.detach()

            _idrMap = new IdrMap()

            _idrMap.init(that.regionEx, _currentFloorId, svgData)

            _idrMap.attachTo(document.getElementById(_containerId))

            _floorMaps[_currentFloorId] = _idrMap

            _mapRoot = _idrMap.root

            loadUnits()
        }

        function setDisplayTimer() {

            // _refreshTimer = setInterval(updateDisplay, 100)
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

            _idrMap.updateMarkerAngleAndScale(marker, scale, rotate)
        }

         function updateMarkersAngleAndScale(scale, rotate) {

            var markers = _markers[_currentFloorId]

            if (markers == undefined) {

                return
            }

            _idrMap.updateMarkersAngleAndScale(markers, scale, rotate)
        }
        
        function addComposs() {

            if (_composs) {

                return
            }

            var div = document.createElement('div')

            div.setAttribute('id', 'composs')

            document.getElementById(_containerId).appendChild(div)

            _composs = new IDRComposs('composs', 0, that)
        }
        
        function loadMap() {

            if (_currentFloorId in _floorMaps) {

                _idrMap = _floorMaps[_currentFloorId]

                _idrMap.attachTo(document.getElementById(_containerId))

                return
            }

            networkManager.serverCallSvgMap(_regionId, _currentFloorId, function(data) {

                createMap(data, _regionId, _currentFloorId)

                onLoadMapSuccess()

            }, function() {

                console.log('地图数据获取失败!' + data);
            })
        }

        function changeFloor(floorId) {

            if (floorId === _currentFloorId) {

                return
            }

            _currentFloorId = floorId

            loadMap()
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

            _idrMap.addMarker(marker)

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

        function onMarkerClick(floorId, markerId) {

            var marker = findMarker(floorId, markerId)

            _mapEvent.fireEvent(that.eventTypes.onMarkerClick, marker)
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

            var center = vec2.fromValues(0.5 * _idrMap.root.clientWidth, 0.5 * _idrMap.root.clientHeight)

            var pos = getSvgPos(mapPos)

            var v = vec2.subtract(pos, center, pos)

            scroll(v)
        }
        
        function updateMinScale() {

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            var mapHeight = floor.height

            var mapWidth = floor.width

            var screenHeight = _idrMap.root.clientHeight

            var screenWidth = _idrMap.root.clientWidth

            var scale = mapWidth/screenWidth > mapHeight/screenHeight ? mapWidth/screenWidth : mapHeight/screenHeight

            minScale = Math.min(scale, minScale)
        }

        function resetMap() {

            console.log('resetMap')

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            var mapHeight = floor.height

            var mapWidth = floor.width

            var screenHeight = _idrMap.root.clientHeight

            var screenWidth = _idrMap.root.clientWidth

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

            _idrMap.setPos(pos)
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

        this.onUnitClick = onUnitClick

        this.onMapClick = onMapClick

        this.onMarkerClick = onMarkerClick
    }

    module.exports = idrMapView;
});