/**
 * Created by yan on 09/02/2017.
 */

import idrFloorListControl from './idrFloorListControl.js'

import idrDataMgr from './idrDataManager.js'

import networkInstance from './idrNetworkManager.js'

import IDRRouter from './idrRouter.js'

import IDRRegionEx from './idrRegionEx.js'

import IDRUnit from './idrUnit.js'

import IDRMapMarkers from './IDRMapMarker/IDRMapMarker.js'

var IDRCarMarker = IDRMapMarkers['IDRCarMarker']

import IDRComposs from './Composs/IDRComposs.js'

import {idrMapEvent, idrMapEventTypes} from './idrMapEvent.js'

import IDRCoreManager from './idrCoreManager.js'

import IDRLocationServer from './idrLocationServer.js'

import IdrMap from './idrGlMap.js'

function idrMapView() {
    
    this.eventTypes = idrMapEventTypes
    
    this.regionEx = null
    
    var _locator = new IDRLocationServer()
    
    var _router = null
    
    var _container = null
    
    var _currentPos = null
    
    var _regionId = null
    
    var _currentFloorId = null
    
    var _floorListControl = null
    
    var _units = []
    
    var _mapRoot = null
    
    var _mapEvent = new idrMapEvent()
    
    var _markers = {}
    
    var _idrMap = null
    
    var _path = null
    
    var _composs = null
    
    var that = this
    
    function addFloorList() {
        
        _floorListControl = new idrFloorListControl()
        
        _floorListControl.setChangeFloorFunc(that, changeFloor)
        
        var floor = that.regionEx.getFloorbyId(_currentFloorId)
        
        _floorListControl.init(_container, that.regionEx['floorList'], floor)
    }
    
    function onMapClick(pos) {
        
        _mapEvent.fireEvent(that.eventTypes.onMapClick, pos)
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
        
        var floor = that.regionEx.getFloorbyId(_currentFloorId)
        
        if (floor.unitList && floor.unitList.length > 0) {
            
            return
        }
        
        networkInstance.serverCallUnits(_regionId, _currentFloorId,
            
            function (data) {
                
                var units = storeUnits(data)
                
                _idrMap.addUnits(units)
            },
            
            function (str) {
                
                alert('获取unit失败!' + str);
            }
        )
    }
    
    function createMap() {
        
        if (!_idrMap) {
            
            _idrMap = new IdrMap(that)
            
            _idrMap.init(that.regionEx, _currentFloorId, _container)
        }
        else  {
            
            _idrMap.changeToFloor(_currentFloorId)
        }
    }
    
    function updateDisplay() {
        
        requestAnimationFrame(function (p1) {
            
            _idrMap.updateDisplay()
            
            if (_composs) {
                
                _composs.rotateToDegree(-1 * _idrMap.getMapRotate() * 180/Math.PI)
            }
        })
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
        
        createMap(_regionId, _currentFloorId)
        
        loadUnits()
    }
    
    function changeFloor(floorId) {
        
        _currentFloorId = floorId
        
        if (!that.regionEx.isSvgDataExist()) {
            
            that.regionEx.loadSvgMaps(loadMap)
        }
        else  {
            
            loadMap()
        }
    }
    
    function initMap(appid, containerId, regionId) {
        
        _container = document.getElementById(containerId)
        
        IDRCoreManager.init(appid, function() {
            
            idrDataMgr.loadRegionInfo(regionId, function(res) {
                
                that.regionEx = new IDRRegionEx(res['data'])
                
                _router = new IDRRouter(regionId, that.regionEx.floorList, function () {
                    
                    console.log('path data load success')
                })
                
                _regionId = regionId
                
                _mapEvent.fireEvent(that.eventTypes.onInitMapSuccess, that.regionEx)
                
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
        
        _mapRoot = _idrMap.root()
        
        _idrMap.updateRoutePath(_path)
        
        _idrMap.updateMinScale()
        
        _idrMap.setPos(_currentPos)
        
        // addGestures()
        
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
    
    this.updateDisplay = updateDisplay
    
    this.onLoadMapSuccess = onLoadMapSuccess
    
    this.userPos = function () {
        
        return _currentPos
    }
}

export { idrMapView as default }