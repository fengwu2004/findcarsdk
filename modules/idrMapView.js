/**
 * Created by yan on 09/02/2017.
 */

import idrDataMgr from './idrDataManager.js'

import networkInstance from './idrNetworkManager.js'

import IDRRouter from './idrRouter.js'

import IDRRegionEx from './idrRegionEx.js'

import IDRUnit from './idrUnit.js'

import idrDebug from './idrDebug'

import IDRMapMarkers from './IDRMapMarker/IDRMapMarker.js'

import IDRComposs from './Composs/IDRComposs.js'

import {idrMapEvent, idrMapEventTypes} from './idrMapEvent.js'

import IDRCoreManager from './idrCoreManager.js'

import IDRLocationServerInstance from './idrLocationServer.js'

import IdrMap from './idrGlMap.js'

import idrBeaconInstance from './idrBeaconManager'

function idrMapView() {

  this.eventTypes = idrMapEventTypes

  this.regionEx = null

  this.autoChangeFloor = true

  var _locator = IDRLocationServerInstance

  var _router = null

  var _container = null

  var _currentPos = null

  var _regionId = null

  var _currentFloorId = null

  var _units = []

  var _mapRoot = null

  var _mapEvent = new idrMapEvent()

  var _dynamicNavi = false

  var _inNavi = false

  var _markers = {}

  var _idrMap = null

  var _path = null

  var _composs = null

  var self = this

  var _naviParm = null

  var _displayAnimId = null

  var _naviStatusUpdateTimer = null

  function onMapClick(pos) {

    _mapEvent.fireEvent(self.eventTypes.onMapClick, pos)
  }

  function showComposs(show) {

    if (!_composs) {

      return
    }

    _composs.show(show)
  }

  function doLocation(success, failed) {

    if (!_locator.isStart()) {

      _locator.start(_regionId, _currentFloorId, success, failed)

      return
    }

    if (!idrBeaconInstance.beaconStart) {

      failed && failed(0)
    }
    else {

      failed && failed(1)
    }
  }

  function getRoutePath(start, end) {

    return _router.routerPath(start, end, false)
  }

  function doRoute(start, end, car) {

    _inNavi = false

    if (!start) {

      _dynamicNavi = true

      start = _currentPos
    }
    else {

      _dynamicNavi = false
    }

    if (!start) {

      return false
    }

    _path = null

    if (car === undefined) {

      _path = _router.routerPath(start, end, false)
    }
    else {

      _path = _router.routerPath(start, end, car)
    }

    if (!_path) {

      return false
    }

    _naviParm = {
      start:start,
      end:end,
      car:car,
      dynamic:_dynamicNavi
    }

    _inNavi = true

    showRoutePath(_path)

    _mapEvent.fireEvent(self.eventTypes.onRouterSuccess, {path:_path, end:end, start:start})

    if (_dynamicNavi) {

      _naviStatusUpdateTimer = setInterval(function() {

        _mapEvent.fireEvent(self.eventTypes.onNaviStatusUpdate, _idrMap.getNaviStatus())

      }, 1000)
    }

    return true
  }

  function stopRoute() {

    _path = null

    _naviParm = null

    _inNavi = false

    _idrMap.showRoutePath(null)

    _mapEvent.fireEvent(self.eventTypes.onRouterFinish, null)

    clearInterval(_naviStatusUpdateTimer)

    _naviStatusUpdateTimer = null
  }

  function showRoutePath(paths) {

    _idrMap.showRoutePath(paths)

    _idrMap.setDynamicNavi(_dynamicNavi)
  }

  function reRoute() {

    if (!_naviParm || !_naviParm.dynamic) {

      return
    }

    if (_naviParm === undefined) {

      _path = _router.routerPath(_currentPos, _naviParm.end, false)
    }
    else {

      _path = _router.routerPath(_currentPos, _naviParm.end, _naviParm.car)
    }

    showRoutePath(_path)
  }

  function onMapScroll(x, y) {

    if (_mapEvent.fireOnce(self.eventTypes.onMapScroll, {x:x, y:y})) {

      return
    }

    _mapEvent.fireEvent(self.eventTypes.onMapScroll, {x:x, y:y})
  }

  function onMapLongPress(pos) {

    if (_mapEvent.fireOnce(type, pos)) {

      return
    }

    _mapEvent.fireEvent(self.eventTypes.onMapLongPress, pos)
  }

  function onUnitClick(unit) {

    if (_mapEvent.fireOnce(self.eventTypes.onUnitClick, unit)) {

      return
    }

    _mapEvent.fireEvent(self.eventTypes.onUnitClick, unit)
  }

  function updateUnitsColor(units, color) {

    _idrMap.updateUnitsColor(units, color)
  }

  function clearUnitsColor(units) {

    _idrMap.clearUnitsColor(units)
  }

  function clearFloorUnitsColor(allfloor) {

    _idrMap.clearFloorUnitsColor(allfloor)
  }

  function createMap() {

    if (!_idrMap) {

      _idrMap = new IdrMap(self)

      _idrMap.init(self.regionEx, _currentFloorId, _container)
    }
    else  {

      _idrMap.changeToFloor(_currentFloorId)
    }
  }

  function updateDisplay() {

    _displayAnimId = requestAnimationFrame(function () {

      if (_composs) {

        _composs.rotateToDegree(_idrMap.getMapRotate())
      }

      updateDisplay()
    })
  }

  function addComposs() {

    if (_composs) {

      return
    }

    var div = document.createElement('div')

    div.setAttribute('id', 'composs')

    _container.appendChild(div)

    _composs = new IDRComposs('composs', 0, self)
  }

  function loadMap() {

    createMap(_regionId, _currentFloorId)
  }

  function changeFloor(floorId) {

    _currentFloorId = floorId

    loadMap()
  }

  function initMap(appid, containerId, regionId) {

    _container = document.getElementById(containerId)

    IDRCoreManager.init(appid, function() {

      console.log('begin loadRegionInfo')

      idrDataMgr.loadRegionInfo(regionId, function(res) {

        self.regionEx = new IDRRegionEx(res['data'])

        _regionId = regionId

        _mapEvent.fireEvent(self.eventTypes.onInitMapSuccess, self.regionEx)

      }, function() {

        console.log('load region data failed')
      })
    })
  }

  function onLoadMapSuccess() {

    addComposs()

    _mapRoot = _idrMap.root()

    _idrMap.showRoutePath(_path)

    _idrMap.setPos(_currentPos)

    var floor = self.regionEx.getFloorbyId(_currentFloorId)

    _idrMap.addUnits(floor.unitList)

    updateDisplay()

    _mapEvent.fireEvent(self.eventTypes.onFloorChangeSuccess, {floorId:_currentFloorId, regionId:_regionId})

    setTimeout(function() {

      if (!_router) {

        networkInstance.serverCallRegionPathData(_regionId, function(res) {

          self.regionEx.regionPath = res.data

          _router = new IDRRouter(self.regionEx.floorList, self.regionEx.regionPath)

        }, null)
      }
    }, 500)
  }

  function addEventListener(type, fn) {

    return _mapEvent.addEvent(type, fn)
  }

  function addOnceEvent(type, fn) {

    return _mapEvent.addOnce(type, fn)
  }

  function removeEventListener(type) {

    return _mapEvent.removeEvent(type)
  }

  function fireEvent(type, data) {

    return _mapEvent.fireEvent(type, data)
  }

  function removeMarker(marker) {

    console.log('移除marker')
    if (!marker) {

      return
    }

    var temp = []

    for (var i = 0; i < _markers[marker.position.floorId].length; ++i) {

      var tempMarker = _markers[marker.position.floorId][i]

      if (tempMarker.id !== marker.id) {

        temp.push(tempMarker)
      }
    }

    _markers[marker.position.floorId] = temp

    _idrMap.removeMarker(marker)
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

    _idrMap.addMarker(marker)

    console.log('加marker')

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

    if (_mapEvent.fireOnce(self.eventTypes.onMarkerClick, marker)) {

      return
    }

    _mapEvent.fireEvent(self.eventTypes.onMarkerClick, marker)
  }

  function getMapPos(screenPos) {

    return _idrMap.getMapPos(screenPos)
  }

  function getScreenPos(mapPos) {

    return _idrMap.getScreenPos(mapPos)
  }

  function zoom(scale) {

    _idrMap.zoom(scale)
  }

  function scroll(screenVec) {

    _idrMap.scroll(screenVec)
  }

  function rotate(rad, anchor) {

    _idrMap.rotate(rad, anchor)
  }

  function centerPos(mapPos, anim) {

    if (!mapPos) {

      return
    }

    if (mapPos.floorId !== _currentFloorId) {

      changeFloor(mapPos.floorId)
    }

    _idrMap.centerPos(mapPos, anim)
  }

  function resetMap() {

    _idrMap.resetMap()
  }

  function birdLook() {

    _idrMap.birdLook()
  }

  function setPos(pos) {

    _idrMap.setPos(pos)
  }

  function Positionfilter(ps, pe, v) {

    if (ps == null) return;

    var d = Math.sqrt((ps.x - pe.x)*(ps.x - pe.x) + (ps.y - pe.y)*(ps.y - pe.y));

    if (d > v){

      pe.x=(ps.x * (d - v) + pe.x * v) / d;

      pe.y=(ps.y * (d - v) + pe.y * v) / d;
    }
  }

  function setUserPos(pos) {

    var p = {x:pos.x, y:pos.y, floorId:pos.floorId}

    if (_currentPos && _currentPos.floorId === pos.floorId) {

      Positionfilter(_currentPos, p, 40)
    }

    _currentPos = p

    if (pos.floorId !== _currentFloorId && self.autoChangeFloor) {

      changeFloor(p.floorId)
    }
    else  {

      setPos(p)
    }
  }

  function updateMarkerLocation(marker, pos) {

    removeMarker(marker)

    marker.position = pos

    addMarker(marker)

    return marker
  }

  function findUnitByPreciseName(name) {

    var lowercase = name.toLowerCase()

    for (var i = 0; i < self.regionEx.floorList.length; ++i) {

      var floor = self.regionEx.floorList[i]

      for (var j = 0; j < floor.unitList.length; ++j) {

        var unit = floor.unitList[j]

        if (lowercase === unit.name.toLowerCase()) {

          return unit
        }
      }
    }

    return null
  }

  function findUnitWithId(unitId) {

    for (var i = 0; i < self.regionEx.floorList.length; ++i) {

      var floor = self.regionEx.floorList[i]

      for (var j = 0; j < floor.unitList.length; ++j) {

        var unit = floor.unitList[j]

        if (unit.id === unitId) {

          return unit
        }
      }
    }

    return null
  }

  function findUnitWithName(floorId, name) {

    var floor = self.regionEx.getFloorbyId(floorId)

    var results = null

    var lowercase = name.toLowerCase()

    for (var i = 0; i < floor.unitList.length; ++i) {

      var unit = floor.unitList[i]

      var index = unit.name.toLowerCase().indexOf(lowercase)

      if (index !== -1 && index + name.length == unit.name.length) {

        if (!results) {

          results = []
        }

        results.push(unit)
      }
    }

    return results
  }

  function findNearUnit(pos, targetunits) {

    return self.regionEx.getNearUnit(pos, targetunits)
  }

  function getNearUnit(pos) {

    var floor = self.regionEx.getFloorbyId(pos.floorId)

    return self.regionEx.getNearUnit(pos, floor.unitList)
  }

  function findUnitsWithType(types) {

    var result = {}

    var floor = null

    for (var k = 0; k < self.regionEx.floorList.length; ++k) {

      var floor = self.regionEx.floorList[k]

      for (var i = 0; i < floor.unitList.length; ++i) {

        var unit = floor.unitList[i]

        for (var j = 0; j < types.length; ++j) {

          if (unit.unitTypeId == types[j]) {

            if (unit.unitTypeId in result) {

              result[unit.unitTypeId].push(unit)
            }
            else  {

              result[unit.unitTypeId] = [unit]
            }
          }
        }
      }
    }

    return result
  }

  this.centerPos = centerPos

  this.resetMap = resetMap

  this.birdLook = birdLook

  this.getMapPos = getMapPos

  this.getScreenPos = getScreenPos

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

  this.addOnceEvent = addOnceEvent

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

  this.getUserPos = function () {

    return _currentPos
  }

  this.getRegionId = function() {

    return _regionId
  }

  this.getFloorId = function() {

    return _currentFloorId
  }

  this.findUnitsWithType = findUnitsWithType

  this.getRoutePath = getRoutePath

  this.onMapLongPress = onMapLongPress

  this.onMapScroll = onMapScroll

  this.findUnitWithId = findUnitWithId

  this.findUnitWithName = findUnitWithName

  this.getNearUnit = getNearUnit

  this.updateMarkerLocation = updateMarkerLocation

  this.clearFloorUnitsColor = clearFloorUnitsColor

  this.findNearUnit = findNearUnit

  this.isDynamicNavi = function () {

    return _dynamicNavi
  }

  this.isInNavi = function () {

    return _inNavi
  }

  this.set25dMap = function () {

    _idrMap.set25dMap()
  }

  this.showComposs = showComposs

  this.addObjModel = function () {

    _idrMap.addObjModel()
  }

  this.reRoute = reRoute

  this.findUnitByPreciseName = findUnitByPreciseName
}

export { idrMapView as default }