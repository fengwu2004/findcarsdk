/**
 * Created by yan on 09/02/2017.
 */

import {idrNetworkInstance} from "./idrNetworkManager";

import idrRouter from './idrRouter.js'

import idrRouterV2 from './idrRouterV2'

import { idrMapInfo } from './idrMapInfo.js'

import idrComposs from './idrComposs.js'

import {idrMapEvent} from './idrMapEvent.js'

import { idrCoreMgr } from "./idrCoreManager";

import idrLocateServerInstance from './idrLocationServer.js'

import IdrMap from './idrGlMap.js'

export class idrMapView {
	
	constructor() {
		
		this.eventTypes = idrMapEvent.types
		
		this.mapInfo = null
		
		this.autoChangeFloor = true
		
		this._locator = idrLocateServerInstance
		
		this._router = null
		
		this._container = null
		
		this._currentPos = null
		
		this._mapId = null
		
		this._floor = null
		
		this._currentFloorIndex = 0
		
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
		
		this.deviceAlphaDeg = 0
		
		this.deviceAlphaDegStart = false
		
		this.deviceAlphaTimer = null
		
		var userAgent = navigator.userAgent.toLowerCase();
		
		this.isAndroid = userAgent.match(/android/i) == "android";
	}
	
	onMapClick(pos) {
		
		this._mapEvent.fireEvent(this.eventTypes.onMapClick, pos)
	}
	
	startUpdateDeviceOrientation() {
		
		if (this.isAndroid) {
			
			return
		}
		
		if (!this.deviceAlphaDegStart) {
			
			window.addEventListener('deviceorientation', e => {
				
				if ('webkitCompassHeading' in event) {
					
					this.deviceAlphaDeg = e.webkitCompassHeading
				}
			});
			
			this.deviceAlphaDegStart = true
			
			this.deviceAlphaTimer = setInterval(()=>{
				
				this.setUserDirection(this.deviceAlphaDeg)
				
			}, 120)
		}
	}
	
	doLocation(success, failed) {
		
		this.startUpdateDeviceOrientation()
		
		this._locator.mapInfo = this.mapInfo
		
		return new Promise((resolve, reject)=>{
			
			this._locator.start(this._mapId, this._currentFloorIndex)
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
	
	checkReachTargetFloor() {
		
		if (!this._inNavi) {
			
			return false
		}
		
		if (!this._currentPos) {
			
			return false
		}
		
		if (this._naviParm && this._naviParm.end.floorIndex == this._currentPos.floorIndex) {
			
			return true
		}
		
		return false
	}
	
	doRoute({start, end, car}) {
		
		this._inNavi = false
		
		if (!start && !this._currentPos) {
			
			return Promise.reject('定位失败')
		}
		
		const routerData = this._router.routerPath(start ? start : this._currentPos, end.position, car, end.junctions)
		
		if (!routerData.path) {
			
			return Promise.reject('路径规划失败')
		}
		
		const points = routerData.path
		
		this._naviParm = {start, end:end, car, points}
		
		this._inNavi = true
		
		this.showRoutePath(points)
		
		if (!start) {
			
			this.autoChangeFloor = true
			
			this._naviStatusUpdateTimer = setInterval(()=> {
				
				this._mapEvent.fireEvent(this.eventTypes.onNaviStatusUpdate, this._idrMap.getNaviStatus())
				
			}, 1000)
		}
		
		return Promise.resolve({start:start ? start : this._currentPos, end:end, path:routerData})
	}
	
	/**
	 * 停止导航
	 */
	stopRoute() {
		
		this._path = null
		
		this._naviParm = null
		
		this._inNavi = false
		
		this._idrMap.showRoutePath(null)
		
		this._mapEvent.fireEvent(this.eventTypes.onRouterFinish, null)
		
		clearInterval(this._naviStatusUpdateTimer)
		
		this._naviStatusUpdateTimer = null
		
		this.setStatus(YFM.Map.STATUS_TOUCH)
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
	
	_createMap() {
		
		if (!this._idrMap) {
			
			this._idrMap = new IdrMap(this)
			
			this._idrMap.init(this.mapInfo, this._currentFloorIndex, this._container)
		}
		else  {
			
			this._idrMap.changeToFloor(this._currentFloorIndex)
		}
	}
	
	_updateDisplay() {
		
		this._displayAnimId = requestAnimationFrame(() => {
			
			if (this._composs) {
				
				this._composs.rotateToDegree(this._idrMap.getMapRotate())
			}
			
			this._updateDisplay()
		})
	}
	
	_addComposs() {
		
		if (this._composs) {
			
			return
		}
		
		var div = document.createElement('div')
		
		div.setAttribute('id', 'composs')
		
		this._container.appendChild(div)
		
		this._composs = new idrComposs('composs', this.mapInfo.northDeflectionAngle, this)
	}
	
	_loadMap() {
		
		this._createMap(this._mapId, this._currentFloorIndex)
	}
	
	/**
	 * 切换楼层
	 * @param {number} floorIndex - 楼层index
	 */
	changeFloor(floorIndex) {
		
		this._currentFloorIndex = floorIndex
		
		this._floor = this.mapInfo.getFloorByIndex(floorIndex)
		
		this._loadMap()
	}
	
	/**
	 * 初始化地图
	 * @param {string} appId - 当前默认值为"yf1248331604"
	 * @param {string} containerId - 地图容器的id
	 * @param {string} mapId - 地图的id
	 */
	initMap(appId, containerId, mapId) {
		
		this._container = document.getElementById(containerId)
		
		idrCoreMgr.init(appId)
			.then(()=>{
				
				return idrNetworkInstance.serverCallMapInfo(mapId)
			})
			.then(({data})=>{
				
				this.mapInfo = new idrMapInfo(data)
				
				this._mapId = mapId
				
				this._mapEvent.fireEvent(this.eventTypes.onInitMapSuccess, this.mapInfo)
			})
			.catch(e=>{
				
				console.log(e)
			})
	}
	
	addUnit(unitList) {
	
		this._idrMap.addUnits(unitList)
	}
	
	onLoadMapSuccess() {
		
		this._addComposs()
		
		this._mapRoot = this._idrMap.root()
		
		this._idrMap.setPos(this._currentPos)
		
		this._idrMap.addUnits(this._floor.unitList)
		
		this._updateDisplay()
		
		setTimeout(() => {
			
			if (!this._router) {
				
				idrNetworkInstance.serverCallRegionPathData(this._mapId)
					.then(res=>{
				
						this.mapInfo.regionPath = res.data
						
						if (res.data.version != undefined) {
							
							this._router = new idrRouterV2(this.mapInfo.floorList, this.mapInfo.regionPath)
						}
						else {
							
							this._router = new idrRouter(this.mapInfo.floorList, this.mapInfo.regionPath)
						}
						
						this._mapEvent.fireEvent(this.eventTypes.onFloorChangeSuccess, {floorIndex:this._currentFloorIndex, regionId:this._mapId})
					})
					.catch(e=>{
						
						console.log(e)
					})
			}
			else {
				
				this._mapEvent.fireEvent(this.eventTypes.onFloorChangeSuccess, {floorIndex:this._currentFloorIndex, regionId:this._mapId})
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
		
		for (var i = 0; i < this._markers[marker.position.floorIndex].length; ++i) {
			
			var tempMarker = this._markers[marker.position.floorIndex][i]
			
			if (tempMarker.id !== marker.id) {
				
				temp.push(tempMarker)
			}
		}
		
		this._markers[marker.position.floorIndex] = temp
		
		this._idrMap.removeMarker(marker)
	}
	
	addMarker(marker) {
		
		if (!this._markers.hasOwnProperty(marker.position.floorIndex)) {
			
			this._markers[marker.position.floorIndex] = new Array()
		}
		
		this._markers[marker.position.floorIndex].push(marker)
		
		this._idrMap.addMarker(marker)
		
		return marker
	}
	
	_findMarker(floorIndex, markerId) {
		
		if (!this._markers.hasOwnProperty(floorIndex)) {
			
			return null
		}
		
		var markersArray = this._markers[floorIndex]
		
		for (var i = 0; i < markersArray.length; ++i) {
			
			if (markerId === markersArray[i].id) {
				
				return markersArray[i]
			}
		}
		
		return null
	}
	
	onMarkerClick(floorIndex, markerId) {
		
		var marker = this._findMarker(floorIndex, markerId)
		
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
		
		if (mapPos.floorIndex !== this._currentFloorIndex) {
			
			this.changeFloor(mapPos.floorIndex)
		}
		
		this._idrMap.centerPos(mapPos, anim)
	}
	
	resetMap() {
		
		this._idrMap.resetMap()
	}
	
	birdLook() {
		
		this._idrMap.birdLook()
	}
	
	_setPos(pos) {
		
		this._idrMap.setPos(pos)
	}
	
	_Positionfilter(ps, pe, v) {
		
		if (ps == null) return;
		
		var d = Math.sqrt((ps.x - pe.x)*(ps.x - pe.x) + (ps.y - pe.y)*(ps.y - pe.y));
		
		if (d > v){
			
			pe.x=(ps.x * (d - v) + pe.x * v) / d;
			
			pe.y=(ps.y * (d - v) + pe.y * v) / d;
		}
	}
	
	getUserPos() {
		
		return this._currentPos
	}
	
	setUserPos({x, y, floorIndex}) {
		
		let p = {x, y, floorIndex}
		
		if (this._currentPos && this._currentPos.floorIndex === floorIndex) {
			
			this._Positionfilter(this._currentPos, p, 40)
		}
		
		this._currentPos = p
		
		if (floorIndex !== this._currentFloorIndex && this.autoChangeFloor) {
			
			this.changeFloor(floorIndex)
		}
		else  {
			
			this._setPos(this._currentPos)
		}
	}
	
	updateMarkerLocation(marker, pos) {
		
		this.removeMarker(marker)
		
		marker.position = pos
		
		this.addMarker(marker)
		
		return marker
	}
	
	/**
	 *
	 * @param unitId
	 * @returns {*}
	 */
	findUnitWithId(unitId) {
		
		for (var i = 0; i < this.mapInfo.floorList.length; ++i) {
			
			var floor = this.mapInfo.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (unit.id === unitId) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	/**
	 *
	 * @param floorId
	 * @param name
	 * @returns {*}
	 */
	findUnitWithName(floorId, name) {
		
		var floor = this.mapInfo.getFloorbyId(floorId)
		
		var results = null
		
		var lowercase = name.toLowerCase()
		
		for (var i = 0; i < floor.unitList.length; ++i) {
			
			var unit = floor.unitList[i]
			
			if (lowercase == unit.name.toLowerCase()) {
				
				if (!results) {
					
					results = []
				}
				
				results.push(unit)
			}
		}
		
		return results
	}
	
	findNearUnit(pos, targetunits) {
		
		return this.mapInfo.getNearUnit(pos, targetunits)
	}
	
	getNearUnit(pos) {
		
		var floor = this.mapInfo.getFloorByIndex(pos.floorIndex)
		
		return this.mapInfo.getNearUnit(pos, floor.unitList)
	}
	
	findUnitsWithType(types) {
		
		var result = {}
		
		for (var k = 0; k < this.mapInfo.floorList.length; ++k) {
			
			var floor = this.mapInfo.floorList[k]
			
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
	
	getRegionId() {
		
		return this._mapId
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
	
	release() {
		
		this._idrMap.release()
	}
	
	setUserDirection(alpha) {
		
		if (this._currentPos) {
			
			this._idrMap.setUserDirection(alpha)
		}
	}
	
	getFloorId() {
		
		if (!this._floor) {
			
			return null
		}
		
		return this._floor.id
	}
}