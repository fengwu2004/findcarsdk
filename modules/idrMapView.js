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

            _idrMap.showRoutePath(paths)
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

            _idrMap.attachTo(_container)

            _floorMaps[_currentFloorId] = _idrMap

            _mapRoot = _idrMap.root

            loadUnits()
        }

        function setDisplayTimer() {

            // _refreshTimer = setInterval(updateDisplay, 100)
        }

        function updateDisplay() {

            _idrMap.updateDisplay()
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

            _container.appendChild(div)

            _composs = new IDRComposs('composs', 0, that)
        }
        
        function loadMap() {

            if (_currentFloorId in _floorMaps) {

                _idrMap = _floorMaps[_currentFloorId]

                _idrMap.attachTo(_container)

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

            _idrMap.updateMinScale()

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