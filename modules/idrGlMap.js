/**
 * Created by ky on 17-6-20.
 */

function idrGlMap(mapView) {
	
	var maxScale = 1.5
	
	var minScale = 1
	
	var _mapScale = 1
	
	var _mapView = mapView
	
	var _regionEx = null
	
	var _floor = null
	
	var _origScale = 0.5
	
	var _mapRoot = null
	
	var _canvas_txt = null
	
	var _canvas_gl = null
	
	var _floorList = []
	
	var _region = null
	
	var _unitAddFloor = {}
	
	var listener = {
		
		onLoadFinish : function(floorId, floorIndex){
			
			console.log('onLoadFinish')
		},
		
		onLoadFailed : function(floorId, floorIndex){
			
			console.log('onLoadFailed')
		},
		
		onAllFloorLoadFinish : function(){
			
			onAllFloorLoaded()
		},
		
		onStatusChange : function(status){
		
		},
		
		onAnimStart : function(anim){
		},
		
		onAnimFinish : function(anim){
		},
		
		onAnimCancel : function(anim){
		
		},
		
		onClick : function(x, y){
			
			handleClick(x, y)
		},
		
		onDClick : function(x, y){
		
		},
		
		on2FClick : function(x, y){
		
		},
		
		onLongPressUp : function(x, y){
			
			handleLongPressUp(x, y)
		},
		
		onScroll: function(x, y) {
			
			handleMapScroll(x, y)
		}
	}
	
	var _currentFloorId = null
	
	this.init = function(regionEx, floorId, container) {
		
		_regionEx = regionEx
		
		_currentFloorId = floorId
		
		_floor = _regionEx.getFloorbyId(floorId)
		
		createCanvas(container)
		
		for (var i = _regionEx.floorList.length - 1; i >= 0; --i) {
			
			var data = {}
			
			data.id = _regionEx.floorList[i].id
			
			data.svg = _regionEx.floorList[i].mapSvg
			
			data.deflection = _regionEx.northDeflectionAngle
			
			_floorList.push(data)
		}
		
		_region = new Region("testRegion", _canvas_gl, _canvas_txt, listener);
		
		_region.setUIScaleRate(0.38333333)
		
		_region.addTexture("pubIcons", _mapView.publicPath + "/static/img_pub_icons.png");
		
		_region.addTexture("parking", _mapView.publicPath + "/static/img_parking.png");
		
		_region.addFloorsSVG(_floorList);
		
		_region.setFontColor('#825537')
		
		_region.setFontType('24px Arial')
		
		_region.startRender();
		
		_region.displayFloor(_floor.floorIndex)
		
		_region.animPitch(0)//设置为 2d
		
		_region.setAlwaysDrawUnit(true)

        _region.set2DMarkerWaveColor(0x4f000088)
    }
	
	function changeToFloor(floorId) {
		
		_currentFloorId = floorId
		
		_floor = _regionEx.getFloorbyId(floorId)
		
		_region.displayFloor(_floor.floorIndex)
		
		onAllFloorLoaded()
	}
	
	function onAllFloorLoaded() {
		
		_mapView.onLoadMapSuccess()
	}
	
	function createEle(type, id, className) {
		
		var ele = document.createElement(type)
		
		ele.id = id
		
		ele.className = className
		
		return ele
	}
	
	function createCanvas(containor) {
		
		_mapRoot = createEle('div', 'mapRoot', 'indoorunMap_map')
		
		_canvas_gl = document.getElementById('gl-canvas')
		
		if (!_canvas_gl) {
			
			_canvas_gl = createEle('canvas', 'gl-canvas', 'canvas-frame')
			
			_canvas_gl.width = 1080
			
			_canvas_gl.height = 1920
		}
		
		_mapRoot.appendChild(_canvas_gl)
		
		_canvas_txt = document.getElementById('txt-canvas')
		
		if (!_canvas_txt) {
			
			_canvas_txt = createEle('canvas', 'txt-canvas', 'canvas-frame')
			
			_canvas_txt.width = 1080
			
			_canvas_txt.height = 1920
		}
		
		_mapRoot.appendChild(_canvas_txt)
		
		containor.appendChild(_mapRoot)
	}
	
	function updateUnitsColor(units, color) {
		
		units.forEach(function(unit) {
			
			_region.addQuickPolygon(_floor.floorIndex, unit.getPts(), color)
		})
		
		_region.buildQuickPolygonFloor(_floor.floorIndex)
	}
	
	function clearUnitsColor(units) {
		
		units.forEach(function(unit) {
			
			unit.color = null
		})
		
		_region.cleanQuickPolygonFloor(_floor.floorIndex)
	}
	
	function clearFloorUnitsColor(allFloor) {
		
		if (!allFloor) {
			
			_region.cleanQuickPolygonFloor(_floor.floorIndex)
			
			return
		}
		
		for (var i = 0; i < _regionEx.floorList.length; ++i) {
			
			_region.cleanQuickPolygonFloor(_regionEx.floorList[i].floorIndex)
		}
	}
	
	function addUnits(unitList) {
	   
    if (_floor.id in _unitAddFloor) {
        
        return
    }
		
		_unitAddFloor[_floor.id] = true
		
		for (var i = 0; i < unitList.length; ++i) {
			
			var unit = unitList[i]
			
			var unitMapObj = {}
			
			unitMapObj.type = parseFloat(unit.unitTypeId)
			
			unitMapObj.text = unit.name
			
			var pos = unit.getPos()
			
			_region.insertUnit(unitMapObj, _floor.floorIndex, pos.x, pos.y)
		}
	}
	
	function removeMarker(marker) {
		
		if (marker) {
			
			_region.removeMarker(marker.id)
			
			// console.log('移除marker')
		}
	}
	
	function getDistance(pos1, pos2) {
		
		return Math.sqrt((pos2.y - pos1.y) * (pos2.y - pos1.y) + (pos2.x - pos1.x) * (pos2.x - pos1.x))
	}
	
	function findUnit(x, y) {
		
		var minUnit = null
		
		var minDistance = 10000
		
		for (var i = 0; i < _floor.unitList.length; ++i) {
			
			var unit = _floor.unitList[i]
			
			var dis = getDistance({x:x, y:y}, unit.getPos())
			
			if (dis < minDistance) {
				
				minUnit = unit
				
				minDistance = dis
			}
		}
		
		return minUnit
	}
	
	function handleMapScroll(x, y) {
		
		_mapView.onMapScroll(x, y)
	}
	
	function handleLongPressUp(x, y) {
		
		var mapLoc = _region.getTouchPosMapLoc(x, y)
		
		_mapView.onMapLongPress({x:mapLoc.x, y:mapLoc.y, floorId:_currentFloorId})
	}
	
	function handleClick(x, y) {
		
		var markerId = _region.searchMarker(x, y)
		
		console.log(markerId)
		
		if (markerId !== -1) {
			
			_mapView.onMarkerClick(_currentFloorId, markerId)
			
			return
		}
		
		var units = _region.searchUnit(x, y)
		
		if (units.length > 0) {

            var unit = findUnit(units[0].x, units[0].y)
			
			_mapView.onUnitClick(unit)
			
			return
		}

		var icons = _region.searchIcon(x, y)

        if (icons.length > 0) {

            var unit = findUnit(icons[0].x, icons[0].y)

            _mapView.onUnitClick(unit)

            return
        }
		
		var mapLoc = _region.getTouchPosMapLoc(x, y)
		
		_mapView.onMapClick({x:mapLoc.x, y:mapLoc.y, floorId:_currentFloorId})
	}
	
	function addMarker(marker) {
		
		_region.addTexture(marker.className, marker.image)
		
		console.log('_floor.floorIndex' + _floor.floorIndex + ' ' + marker.position.x + ' ' + marker.position.y)
		
		var floor = _regionEx.getFloorbyId(marker.position.floorId)
		
		if (floor) {
			
			marker.id = _region.insertTextureMarker(marker.className, floor.floorIndex, marker.position.x, marker.position.y, 0, 0, 80)
		}
	}
	
	function detach() {
	
	
	}
	
	function attachTo(containor) {
	
	
	}
	
	function setPos(pos) {
		
		if (!pos || pos.floorId !== _currentFloorId) {
			
			_region.cleanLocation()
			
			return
		}
		
		var floor = _regionEx.getFloorbyId(pos.floorId)
		
		if (floor) {
			
			_region.setLocation(floor.floorIndex, pos.x, pos.y)
			
			_region.locateLaunch()
		}
	}
	
	function resetMap() {
		
		_region.overlookMap(_regionEx.getFloorIndex(_currentFloorId))
		
		_region.animPitch(0)//设置为 2d
	}
	
	function scroll(screenVec) {
	
	
	}
	
	function zoom(scale) {
		
		var dis = _region.getLookDistance()
		
		if (dis < 100 || dis > 4000) {
			
			return
		}

		var value = dis * scale

        value = Math.min(value, 4000)

        value = Math.max(100, value)

		_region.animLookDistance(value)
	}
	
	function birdLook() {
		
		_region.overlookRoute()
	}
	
	function showRoutePath(path) {
		
		if (!path) {
			
			_region.cleanRoute()
			
			return
		}
		
		var pathInfloor = getTargetFloorPoints(path, _currentFloorId)
		
		if (!pathInfloor) {
			
			_region.cleanRoute()
			
			return
		}
		
		var data = []
		
		pathInfloor.forEach(function(p) {
			"use strict";
			var pos = {}
			
			pos.floor = _regionEx.getFloorIndex(p.floorId)
			
			pos.x = p.x
			
			pos.y = p.y
			
			data.push(pos)
		})
		
		_region.setRoute(data)
	}
	
	function getNaviStatus() {
		
		if (_region) {
			
			return _region.getNaviStatus()
		}
		
		return null
	}
	
	function getMapPos(svgPos) {
	
	
	}
	
	function getScreenPos(mapPos) {
		
		var floorIndex = _regionEx.getFloorbyId(mapPos.floorId).floorIndex
		
		var v = _region.floorPos2RegionPos(floorIndex, mapPos.x, mapPos.y)
		
		var p = _region.regionPos2Screen(v)
		
		return {x:p[0] * 0.3833333, y:p[1] * 0.3833333}
	}
	
	function rotate(rad, anchor) {
	
	
	}
	
	function centerPos(mapPos, anim) {
		
		var floor = _regionEx.getFloorbyId(mapPos.floorId)
		
		if (anim) {
			
			_region.animLookAt(floor.floorIndex, mapPos.x, mapPos.y)
		}
		else {
			
			_region.lookAtMapLoc(floor.floorIndex, mapPos.x, mapPos.y)
		}
		
	}
	
	function updateDisplay() {
	
	
	}
	
	function updateRoutePath() {
	
	}
	
	function getTargetFloorPoints(path, floorId) {
		
		if (!path) {
			
			return null
		}
		
		var result = []
		
		for (var i = 0; i < path.paths.length; ++i) {
			
			var floorPath = path.paths[i]
			
			if (floorPath.floorId === floorId) {
				
				result = result.concat(floorPath.position)
			}
		}
		
		if (result.length == 0) {
			
			return null
		}
		
		return result
	}
	
	function getMapScale() {
		
		return _mapScale
	}
	
	function getMapRotate() {
		
		var val = _region.getFloorAngle(_floor.floorIndex)
		
		return val
	}
	
	this.updateMinScale = function() {
	
	}
	
	function updateMarkerLocation(marker, pos) {
		
		var floor = _regionEx.getFloorbyId(pos.floorId)
		
		marker.id = _region.updateMarkerLocation(marker.id, floor.floorIndex, pos.x, pos.y)
		
		marker.position = pos
	}
	
	this.getMapScale = getMapScale
	
	this.getMapRotate = getMapRotate
	
	this.detach = detach
	
	this.attachTo = attachTo
	
	this.setPos = setPos
	
	this.addMarker = addMarker
	
	this.resetMap = resetMap
	
	this.birdLook = birdLook
	
	this.showRoutePath = showRoutePath
	
	this.getScreenPos = getScreenPos
	
	this.updateUnitsColor = updateUnitsColor
	
	this.clearFloorUnitsColor = clearFloorUnitsColor
	
	this.getMapPos = getMapPos
	
	this.zoom = zoom
	
	this.scroll = scroll
	
	this.rotate = rotate
	
	this.centerPos = centerPos
	
	this.updateDisplay = updateDisplay
	
	this.updateRoutePath = updateRoutePath
	
	this.changeToFloor = changeToFloor
	
	this.addUnits = addUnits
	
	this.removeMarker = removeMarker
	
	this.root = function () {
		
		return _mapRoot
	}
	
	this.updateMarkerLocation = updateMarkerLocation
	
	this.clearUnitsColor = clearUnitsColor
	
	this.getNaviStatus = getNaviStatus

    this.setDynamicNavi = function (value) {

	    if (_region) {

            _region.setNavigateProj(value)
        }
    }
}

export { idrGlMap as default }