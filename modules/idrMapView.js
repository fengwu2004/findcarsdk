/**
 * Created by yan on 09/02/2017.
 */

import {networkInstance} from "./idrNetworkManager";

import IDRRouter from './idrRouter.js'

import IDRRegionEx from './idrRegionEx.js'

import IDRComposs from './IDRComposs.js'

import {idrMapEvent, idrMapEventTypes} from './idrMapEvent.js'

import { idrCoreMgr } from "./idrCoreManager";

import IDRLocationServerInstance from './idrLocationServer.js'

import IdrMap from './idrGlMap.js'

class idrMapView {
	
	constructor() {
		
		this.eventTypes = idrMapEventTypes
		
		this.regionEx = null
		
		this.autoChangeFloor = true
		
		this._locator = IDRLocationServerInstance
		
		this._router = null
		
		this._container = null
		
		this._currentPos = null
		
		this._regionId = null
		
		this._currentFloorId = null
		
		this._units = []
		
		this._mapRoot = null
		
		this._mapEvent = new idrMapEvent()
		
		this._dynamicNavi = false
		
		this._inNavi = false
		
		this._markers = {}
		
		this._idrMap = null
		
		this._path = null
		
		this._composs = null
		
		this._naviParm = null
		
		this._displayAnimId = null
		
		this._naviStatusUpdateTimer = null
	}
	
	onMapClick(pos) {
		
		this._mapEvent.fireEvent(this.eventTypes.onMapClick, pos)
	}
	
	showComposs(show) {
		
		if (!this._composs) {
			
			return
		}
		
		this._composs.show(show)
	}
	
	async doLocation(success, failed) {
		
		return new Promise((resolve, reject)=>{
			
			this._locator.start(this._regionId, this._currentFloorId)
				.then(res=>{
					
					this._locator.setLocateDelegate(success, failed)
				})
				.catch(res=>{
					
					reject(res)
				})
		})
	}
	
	setStatus(type) {
		
		this._idrMap.setStatus(type)
	}
	
	getRoutePath(start, end) {
		
		return this._router.routerPath(start, end, false)
	}
	
	checkReachTargetFloor() {
		
		if (!this._inNavi) {
			
			return false
		}
		
		if (!this._currentPos) {
			
			return false
		}
		
		if (this._naviParm && this._naviParm.end.floorId == this._currentPos.floorId) {
			
			return true
		}
		
		return false
	}
	
	doRoute(start, end, car) {
		
		this._inNavi = false
		
		if (!start) {
			
			this._dynamicNavi = true
			
			start = this._currentPos
		}
		else {
			
			this._dynamicNavi = false
		}
		
		if (!start) {
			
			return false
		}
		
		this._path = null
		
		let carnavi = car === undefined?false : car
		
		this._path = this._router.routerPath(start, end, carnavi)
		
		if (!this._path) {
			
			return false
		}
		
		this._naviParm = {
			start:start,
			end:end,
			car:carnavi,
			dynamic:this._dynamicNavi
		}
		
		this._inNavi = true
		
		this.showRoutePath(this._path)
		
		this._mapEvent.fireEvent(this.eventTypes.onRouterSuccess, {path:this._path, end:end, start:start})
		
		if (this._dynamicNavi) {
			
			this._naviStatusUpdateTimer = setInterval(()=> {
				
				this._mapEvent.fireEvent(this.eventTypes.onNaviStatusUpdate, this._idrMap.getNaviStatus())
				
			}, 1000)
		}
		
		return true
	}
	
	stopRoute() {
		
		this._path = null
		
		this._naviParm = null
		
		this._inNavi = false
		
		this._idrMap.showRoutePath(null)
		
		this._mapEvent.fireEvent(this.eventTypes.onRouterFinish, null)
		
		clearInterval(this._naviStatusUpdateTimer)
		
		this._naviStatusUpdateTimer = null
	}
	
	showRoutePath(paths) {
		
		this._idrMap.showRoutePath(paths)
		
		this._idrMap.setDynamicNavi(this._dynamicNavi)
	}
	
	reRoute() {
		
		if (!this._naviParm || !this._naviParm.dynamic) {
			
			return
		}
		
		if (this._naviParm === undefined) {
			
			this._path = this._router.routerPath(this._currentPos, this._naviParm.end, false)
		}
		else {
			
			this._path = this._router.routerPath(this._currentPos, this._naviParm.end, this._naviParm.car)
		}
		
		this.showRoutePath(this._path)
	}
	
	onMapScroll(x, y) {
		
		if (this._mapEvent.fireOnce(this.eventTypes.onMapScroll, {x:x, y:y})) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onMapScroll, {x:x, y:y})
	}
	
	onMapLongPress(pos) {
		
		if (this._mapEvent.fireOnce(this.eventTypes.onMapLongPress, pos)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onMapLongPress, pos)
	}
	
	onUnitClick(unit) {
		
		if (this._mapEvent.fireOnce(this.eventTypes.onUnitClick, unit)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onUnitClick, unit)
	}
	
	updateUnitsColor(units, color) {
		
		this._idrMap.updateUnitsColor(units, color)
	}
	
	clearUnitsColor(units) {
		
		this._idrMap.clearUnitsColor(units)
	}
	
	clearFloorUnitsColor(allfloor) {
		
		this._idrMap.clearFloorUnitsColor(allfloor)
	}
	
	createMap() {
		
		if (!this._idrMap) {
			
			this._idrMap = new IdrMap(this)
			
			this._idrMap.init(this.regionEx, this._currentFloorId, this._container)
		}
		else  {
			
			this._idrMap.changeToFloor(this._currentFloorId)
		}
	}
	
	updateDisplay() {
		
		this._displayAnimId = requestAnimationFrame(() => {
			
			if (this._composs) {
				
				this._composs.rotateToDegree(this._idrMap.getMapRotate())
			}
			
			this.updateDisplay()
		})
	}
	
	addComposs() {
		
		if (this._composs) {
			
			return
		}
		
		var div = document.createElement('div')
		
		div.setAttribute('id', 'composs')
		
		this._container.appendChild(div)
		
		this._composs = new IDRComposs('composs', this.regionEx.northDeflectionAngle, this)
	}
	
	loadMap() {
		
		this.createMap(this._regionId, this._currentFloorId)
	}
	
	changeFloorByIndex(floorIndex) {
		
		this._currentFloorId = this.regionEx.floorList[floorIndex].id
		
		this.loadMap()
	}
	
	changeFloor(floorId) {
		
		this._currentFloorId = floorId
		
		this.loadMap()
	}
	
	initMap(appId, containerId, regionId) {
		
		this._container = document.getElementById(containerId)
		
		idrCoreMgr.init(appId)
			.then(res=>{
				
				return networkInstance.serverCallRegionAllInfo(regionId)
			})
			.then(({data})=>{
				
				this.regionEx = new IDRRegionEx(data)
				
				this._regionId = regionId
				
				this._mapEvent.fireEvent(this.eventTypes.onInitMapSuccess, this.regionEx)
			})
			.catch(e=>{
				
				console.log(e)
			})
	}
	
	onLoadMapSuccess() {
		
		this.addComposs()
		
		this._mapRoot = this._idrMap.root()
		
		this._idrMap.setPos(this._currentPos)
		
		var floor = this.regionEx.getFloorbyId(this._currentFloorId)
		
		this._idrMap.addUnits(floor.unitList)
		
		this.updateDisplay()
		
		setTimeout(() => {
			
			if (!this._router) {
				
				networkInstance.serverCallRegionPathData(this._regionId)
					.then(res=>{
						
						this.regionEx.regionPath = res.data
						
						this._router = new IDRRouter(this.regionEx.floorList, this.regionEx.regionPath)
						
						this._mapEvent.fireEvent(this.eventTypes.onFloorChangeSuccess, {floorId:this._currentFloorId, regionId:this._regionId})
					})
					.catch(e=>{
						
						console.log(e)
					})
			}
			else {
				
				this._mapEvent.fireEvent(this.eventTypes.onFloorChangeSuccess, {floorId:this._currentFloorId, regionId:this._regionId})
			}
		}, 0)
	}
	
	addEventListener(type, fn) {
		
		return this._mapEvent.addEvent(type, fn)
	}
	
	addOnceEvent(type, fn) {
		
		return this._mapEvent.addOnce(type, fn)
	}
	
	removeEventListener(type) {
		
		return this._mapEvent.removeEvent(type)
	}
	
	fireEvent(type, data) {
		
		return this._mapEvent.fireEvent(type, data)
	}
	
	removeMarker(marker) {
		
		if (!marker) {
			
			return
		}
		
		var temp = []
		
		for (var i = 0; i < this._markers[marker.position.floorId].length; ++i) {
			
			var tempMarker = this._markers[marker.position.floorId][i]
			
			if (tempMarker.id !== marker.id) {
				
				temp.push(tempMarker)
			}
		}
		
		this._markers[marker.position.floorId] = temp
		
		this._idrMap.removeMarker(marker)
	}
	
	getMarkers(floorId) {
		
		if (floorId in this._markers) {
			
			return this._markers[floorId]
		}
		
		return null
	}
	
	addMarker(marker) {
		
		if (!this._markers.hasOwnProperty(marker.position.floorId)) {
			
			this._markers[marker.position.floorId] = new Array()
		}
		
		this._markers[marker.position.floorId].push(marker)
		
		this._idrMap.addMarker(marker)
		
		return marker
	}
	
	findMarker(floorId, markerId) {
		
		if (!this._markers.hasOwnProperty(floorId)) {
			
			return null
		}
		
		var markersArray = this._markers[floorId]
		
		for (var i = 0; i < markersArray.length; ++i) {
			
			if (markerId === markersArray[i].id) {
				
				return markersArray[i]
			}
		}
		
		return null
	}
	
	onMarkerClick(floorId, markerId) {
		
		var marker = this.findMarker(floorId, markerId)
		
		if (this._mapEvent.fireOnce(this.eventTypes.onMarkerClick, marker)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onMarkerClick, marker)
	}
	
	getMapPos(screenPos) {
		
		return this._idrMap.getMapPos(screenPos)
	}
	
	getScreenPos(mapPos) {
		
		return this._idrMap.getScreenPos(mapPos)
	}
	
	zoom(scale) {
		
		this._idrMap.zoom(scale)
	}
	
	scroll(screenVec) {
		
		this._idrMap.scroll(screenVec)
	}
	
	rotate(rad, anchor) {
		
		this._idrMap.rotate(rad, anchor)
	}
	
	centerPos(mapPos, anim) {
		
		if (!mapPos) {
			
			return
		}
		
		if (mapPos.floorId !== this._currentFloorId) {
			
			this.changeFloor(mapPos.floorId)
		}
		
		this._idrMap.centerPos(mapPos, anim)
	}
	
	resetMap() {
		
		this._idrMap.resetMap()
	}
	
	birdLook() {
		
		this._idrMap.birdLook()
	}
	
	setPos(pos) {
		
		this._idrMap.setPos(pos)
	}
	
	Positionfilter(ps, pe, v) {
		
		if (ps == null) return;
		
		var d = Math.sqrt((ps.x - pe.x)*(ps.x - pe.x) + (ps.y - pe.y)*(ps.y - pe.y));
		
		if (d > v){
			
			pe.x=(ps.x * (d - v) + pe.x * v) / d;
			
			pe.y=(ps.y * (d - v) + pe.y * v) / d;
		}
	}
	
	setUserPos(pos) {
		
		var p = {x:pos.x, y:pos.y, floorId:pos.floorId}
		
		if (this._currentPos && this._currentPos.floorId === pos.floorId) {
			
			this.Positionfilter(this._currentPos, p, 40)
		}
		
		this._currentPos = p
		
		if (pos.floorId !== this._currentFloorId && this.autoChangeFloor) {
			
			this.changeFloor(p.floorId)
		}
		else  {
			
			this.setPos(p)
		}
	}
	
	updateMarkerLocation(marker, pos) {
		
		this.removeMarker(marker)
		
		marker.position = pos
		
		this.addMarker(marker)
		
		return marker
	}
	
	findUnitWithNameAndFloor(name, floorId) {
		
		var lowercase = name.toLowerCase()
		
		for (var i = 0; i < this.regionEx.floorList.length; ++i) {
			
			var floor = this.regionEx.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (lowercase === unit.name.toLowerCase() && floorId === unit.floorId) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	findUnitByPreciseName(name) {
		
		var lowercase = name.toLowerCase()
		
		for (var i = 0; i < this.regionEx.floorList.length; ++i) {
			
			var floor = this.regionEx.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (lowercase === unit.name.toLowerCase()) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	findUnitWithId(unitId) {
		
		for (var i = 0; i < this.regionEx.floorList.length; ++i) {
			
			var floor = this.regionEx.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (unit.id === unitId) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	findUnitOfFloor(floorIndex, name) {
		
		var floor = this.regionEx.floorList[floorIndex]
		
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
	
	findUnitWithName(floorId, name) {
		
		var floor = this.regionEx.getFloorbyId(floorId)
		
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
	
	findNearUnit(pos, targetunits) {
		
		return this.regionEx.getNearUnit(pos, targetunits)
	}
	
	getNearUnit(pos) {
		
		var floor = this.regionEx.getFloorbyId(pos.floorId)
		
		return this.regionEx.getNearUnit(pos, floor.unitList)
	}
	
	findUnitsWithType(types) {
		
		var result = {}
		
		for (var k = 0; k < this.regionEx.floorList.length; ++k) {
			
			var floor = this.regionEx.floorList[k]
			
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
	
	getUserPos() {
		
		return this._currentPos
	}
	
	getRegionId() {
		
		return this._regionId
	}
	
	getFloorId() {
		
		return this._currentFloorId
	}
	
	isDynamicNavi() {
		
		return this._dynamicNavi
	}
	
	isInNavi() {
		
		return this._inNavi
	}
	
	set2DMap(value) {
		
		this._idrMap.set2DMap(value)
	}
	
	findUnitWithNameAndFloor(name, floorId) {
		
		var lowercase = name.toLowerCase()
		
		for (var i = 0; i < this.regionEx.floorList.length; ++i) {
			
			var floor = this.regionEx.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (lowercase === unit.name.toLowerCase() && floorId === unit.floorId) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	//path:[{x,y,floorId}]
	setRoutePath(path) {
		
		this._idrMap.setRoutePath(path)
	}
	
	release() {
		
		this._idrMap.release()
	}
	
	setUnitReserved(units) {
		
		this._idrMap.setUnitsReserved(units)
	}
	
	addBlueCarToMap(unit) {
		
		this._idrMap.updateOwnerUnitsColor(unit)
	}
}

export { idrMapView as default }