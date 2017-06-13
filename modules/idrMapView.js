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

    var count = 0

    function idrMapView() {

        this.eventTypes = IDRMapEventModule[1]

        this.regionEx = null

        var _locator = new IDRLocationServer()

        var _router = null

        var _container = null

        var _currentPos = null

        var _regionId = null

        var _currentFloorId = null

        var _refreshTimer = null

        var _floorListControl = null

        var _units = []

        var _mapRoot = null

        var _gestures = null

        var _mapEvent = new IDRMapEvent()

        var _markers = {}

        var _idrMap = new IdrMap()

        var _path = null

        var _composs = null

        var that = this

        var _floorMaps = {}

        function addFloorList() {

            _floorListControl = new idrFloorListControl()

            _floorListControl.setChangeFloorFunc(that, changeFloor)

            var floor = that.regionEx.getFloorbyId(_currentFloorId)

            _floorListControl.init(_container, that.regionEx['floorList'], floor)
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

            matrix2d.invert(im, _idrMap.getMapViewMatrix())

            vec2.transformMat2d(p, p, im)

            return p
        }

        function onPinch(evt) {

            return

            var p = getTouchesCenter(evt)

            zoom(evt.gradualscale, p)
        }

        function onRoate(evt) {

            var p = getTouchesCenter(evt)

            rotate(evt.angle * Math.PI/180, p)
        }

        function onPan(evt) {

            return

            scroll([evt.deltaX, evt.deltaY])
        }

        function addGestures() {

            _gestures && _gestures.destroy()

            _gestures = new AlloyFinger(_mapRoot, {

                rotate:onRoate,

                pinch:onPinch,

                pressMove:onPan
            })
        }
        
        function doLocation(locateCallback) {

            _locator.start(_regionId, _currentFloorId, locateCallback, null)
        }
        
        function doRoute(start, end) {

            _path = _router.routerPath(start, end, false)

            showRoutePath(_path)
        }
        
        function stopRoute() {

            _path = null

            _idrMap.showRoutePath(null)
        }
        
        function showRoutePath(paths) {

            _idrMap.showRoutePath(paths)
        }
        
        function onUnitClick(unit) {

            _mapEvent.fireEvent(that.eventTypes.onUnitClick, unit)
        }

        function updateUnitsColor(units, color) {

            _idrMap.updateUnitsColor(units, color)
        }

        function clearUnitsColor(units) {

            _idrMap.clearUnitsColor(units)
        }

        function storeUnits(unitsInfo) {

            _units = []

            for (var i = 0; i < unitsInfo.length; ++i) {

                var unit = new IDRUnit(unitsInfo[i])

                _units.push(unit)

                unit.getPolygon()
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

            _idrMap = new IdrMap(that)

            _idrMap.init(that.regionEx, _currentFloorId, svgData)

            _idrMap.attachTo(_container)

            _floorMaps[_currentFloorId] = _idrMap

            _idrMap.resizeViewBox()

            loadUnits()
        }

        function setDisplayTimer() {

            _refreshTimer = setInterval(updateDisplay, 100)
        }

        function updateDisplay() {

            // console.log('up')

            _idrMap.updateDisplay()

            if (_composs) {

                _composs.rotateToDegree(-1 * _idrMap.getMapRotate() * 180/Math.PI)
            }
        }
        
        function addComposs() {

            if (_composs) {

                return
            }

            var div = document.createElement('div')

            div.setAttribute('id', 'composs')

            _container.appendChild(div)

            _composs = new IDRComposs('composs', 0, that)
        }
        
        function loadMap() {

            if (_currentFloorId in _floorMaps) {

                _idrMap.detach()

                _idrMap = _floorMaps[_currentFloorId]

                _idrMap.attachTo(_container)

                onLoadMapSuccess()

                return
            }

            networkManager.serverCallSvgMap(_regionId, _currentFloorId, function(data) {

                createMap(data, _regionId, _currentFloorId)

                onLoadMapSuccess()

            }, function(data) {

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

            _container = document.getElementById(containerId)

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

            _mapRoot = _idrMap.root()

            _idrMap.updateRoutePath(_path)

            _idrMap.updateMinScale()

            _idrMap.setPos(_currentPos)

            addGestures()

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

            if (!deleteMarker) {

                return
            }

            var temp = new Array()

            for (var i = 0; i < _markers[deleteMarker.position.floorId].length; ++i) {

                var marker = _markers[deleteMarker.position.floorId][i]

                if (marker.id !== deleteMarker.id) {

                    temp.push(marker)
                }
            }

            _markers[marker.position.floorId] = temp

            deleteMarker.removeFromSuperView()
        }

        function getMarkers(floorId) {

            if (floorId in _markers) {

                return _markers[floorId]
            }

            return null
        }
        
        function addMarker(marker) {

            if (!_markers.hasOwnProperty(marker.position.floorId)) {

                _markers[marker.position.floorId] = new Array()
            }

            _markers[marker.position.floorId].push(marker)

            marker.id = 'marker_' + marker.position.floorId + '_' + _markers[marker.position.floorId].length

            _idrMap.addMarker(marker)

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
        
        function getMapPos(svgPos) {

            return _idrMap.getMapPos(svgPos)
        }
        
        function getSvgPos(mapPos) {

            return _idrMap.getSvgPos(mapPos)
        }

        function zoom(scale, anchor) {

            _idrMap.zoom(scale, anchor)
        }
        
        function scroll(screenVec) {

            _idrMap.scroll(screenVec)
        }

        function rotate(rad, anchor) {

            _idrMap.rotate(rad, anchor)
        }

        function centerPos(mapPos) {

            _idrMap.centerPos(mapPos)
        }

        function resetMap() {

            _idrMap.resetMap()
        }
        
        function birdLook() {

            _idrMap.birdLook()
        }
        
        function setPos(pos) {

            if (_path) {

                var routeParm = _router.getRouterParm()

                doRoute(pos, routeParm.end)

                pos = _path.paths[0].position[0]
            }

            _idrMap.setPos(pos)
        }
        
        function setUserPos(pos) {

            _currentPos = pos

            if (pos.floorId !== _currentFloorId) {

                changeFloor(pos.floorId)
            }
            else  {

                setPos(pos)
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
        
        this.getMarkers = getMarkers

        this.updateUnitsColor = updateUnitsColor

        this.clearUnitsColor = clearUnitsColor

        this.stopRoute = stopRoute
        
        this.userPos = function () {

            return _currentPos
        }
    }

    module.exports = idrMapView;
});