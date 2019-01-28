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
	
	_onMapClick(pos) {
		
		this._mapEvent.fireEvent(this.eventTypes.onMapClick, pos)
	}
	
	_fireEvent(type, data) {
		
		return this._mapEvent.fireEvent(type, data)
	}
	
	_showRoutePath(paths) {
		
		this._idrMap.showRoutePath(paths)
		
		this._idrMap.setDynamicNavi(this._dynamicNavi)
	}
	
	_onMapScroll(x, y) {
		
		if (this._mapEvent.fireOnce(this.eventTypes.onMapScroll, {x:x, y:y})) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onMapScroll, {x:x, y:y})
	}
	
	_onMapLongPress(pos) {
		
		if (this._mapEvent.fireOnce(this.eventTypes._onMapLongPress, pos)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes._onMapLongPress, pos)
	}
	
	_onUnitClick(unit) {
		
		if (this._mapEvent.fireOnce(this.eventTypes.onUnitClick, unit)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onUnitClick, unit)
	}
	
	_startUpdateDeviceOrientation() {
		
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
				
				this._setUserDirection(this.deviceAlphaDeg)
				
			}, 120)
		}
	}
	
	_checkReachTargetFloor() {
		
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
	
	_onLoadMapSuccess() {
		
		// this._addComposs()
		
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
	
	_onMarkerClick(floorIndex, markerId) {
		
		var marker = this._findMarker(floorIndex, markerId)
		
		if (this._mapEvent.fireOnce(this.eventTypes.onMarkerClick, marker)) {
			
			return
		}
		
		this._mapEvent.fireEvent(this.eventTypes.onMarkerClick, marker)
	}
	
	/**
	 * 功能：开启定位
	 * @param success - 定位成功回调（频率：大约每秒一次）
	 * @param failed - 定位失败回调
	 * @returns {Promise<any>}
	 */
	doLocation(success, failed) {
		
		this._startUpdateDeviceOrientation()
		
		this._locator.mapInfo = this.mapInfo
		
		return new Promise((resolve, reject)=>{
			
			this._locator.start(this._mapId, this._currentFloorIndex)
				.then(()=>{
					
					this._locator.setLocateDelegate(success, failed)
				})
				.catch(res=>{
					
					reject(res)
				})
		})
	}
	
	/**
	 * 功能：设置地图状态
	 * @param type 0：普通状态，2：导航状态，3：地图跟随状态
	 */
	setStatus(type) {
		
		this._idrMap.setStatus(type)
	}
	
	/**
	 * 功能：规划路径，进入导航
	 * @param start - position or null, null或者不填表明使用当前定位点作为起点（动态导航），否则为静态导航
	 * @param end - obj, 具有position属性，导航终点
	 * @param car - bool, 是否车行导航（车行与人行导航路径略有不同）
	 * @returns {*} - promise
	 */
	doRoute({start, end, car}) {
		
		this._inNavi = false
		
		if (!start && !this._currentPos) {
			
			return Promise.reject('定位失败')
		}
		
		const routerData = this._router.routerPath(start ? start : this._currentPos, end.position, car ? 1 : 0, end.junctions)
		
		if (!routerData.path) {
			
			return Promise.reject('路径规划失败')
		}
		
		const points = routerData.path
		
		this._naviParm = {start, end:end, car, points}
		
		this._inNavi = true
		
		this._dynamicNavi = start == null
		
		this._showRoutePath(points)
		
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
	
	/**
	 * g功能：更行unit上的覆盖色
	 * @param units - [idrUnit]
	 * @param color - rgb颜色，例如红色0xff0000
	 */
	updateUnitsColor(units, color) {
		
		this._idrMap.updateUnitsColor(units, color)
	}
	
	/**
	 * 功能：清楚unit覆盖色
	 * @param units - [idrUnit]
	 */
	clearUnitsColor(units) {
		
		this._idrMap.clearUnitsColor(units)
	}
	
	/**
	 * 功能：清除unit覆盖色
	 */
	clearFloorUnitsColor() {
		
		this._idrMap.clearFloorUnitsColor()
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
	
	/**
	 * 功能：设置地图事件回调
	 * @param type - idrMapEvent.type
	 * @param fn - 回调函数
	 */
	addEventListener(type, fn) {
		
		return this._mapEvent.addEvent(type, fn)
	}
	
	/**
	 * 功能： 设置地图时间回调，只执行一次（如果fn返回true，则执行完成后移除event，否则不移除）, 优先级高于通过addEventListener添加的回调
	 * @param type - idrMapEvent.type
	 * @param fn - 回调函数
	 */
	addOnceEvent(type, fn) {
		
		return this._mapEvent.addOnce(type, fn)
	}
	
	/**
	 * 功能： 移除对应type的回调，但不会移除通过addOnceEvent添加的回调
	 * @param type
	 * @returns {boolean}
	 */
	removeEventListener(type) {
		
		return this._mapEvent.removeEvent(type)
	}
	
	/**
	 * 功能：移除对应marker
	 * @param marker - idrMarker
	 */
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
	
	/**
	 * 功能：添加marker
	 * @param marker - idrMarker
	 * @returns {*} - 返回添加的marker，如果用户之后需要移除此marker，需保存返回值
	 */
	addMarker(marker) {
		
		if (!this._markers.hasOwnProperty(marker.position.floorIndex)) {
			
			this._markers[marker.position.floorIndex] = new Array()
		}
		
		this._markers[marker.position.floorIndex].push(marker)
		
		this._idrMap.addMarker(marker)
		
		return marker
	}
	
	/**
	 * 功能: 获取屏幕上一点对应的地图坐标
	 * @param screenPos - {x,y}
	 * @returns {*} - {x,y]
	 */
	getMapPos(screenPos) {
		
		return this._idrMap.getMapPos(screenPos)
	}
	
	/**
	 * 功能: 获取地图上的一点对应的屏幕坐标
	 * @param mapPos - {x,y}
	 * @returns {*|{x, y}}
	 */
	getScreenPos(mapPos) {
		
		return this._idrMap.getScreenPos(mapPos)
	}
	
	/**
	 * 功能：缩放地图
	 * @param scale - float, 缩放因子
	 */
	zoom(scale) {
		
		this._idrMap.zoom(scale)
	}
	
	/**
	 * 功能：平移地图
	 * @param screenVec - {x, y}
	 */
	scroll(screenVec) {
		
		this._idrMap.scroll(screenVec)
	}
	
	/**
	 * 功能：旋转地图
	 * @param rad - 角度
	 * @param anchor - 地图旋转锚点，地图上的坐标
	 */
	rotate(rad, anchor) {
		
		this._idrMap.rotate(rad, anchor)
	}
	
	/**
	 * 居中地图上某一点到屏幕中心
	 * @param {Object(x, y, floorIndex)}mapPos - 地图上某一点
	 * @param {Boolean}anim - 是否带动画
	 */
	centerPos(mapPos, anim) {
		
		if (!mapPos) {
			
			return
		}
		
		if (mapPos.floorIndex !== this._currentFloorIndex) {
			
			this.changeFloor(mapPos.floorIndex)
		}
		
		this._idrMap.centerPos(mapPos, anim)
	}
	
	/**
	 * 重置地图的大小和方向
	 */
	resetMap() {
		
		this._idrMap.resetMap()
	}
	
	/**
	 * 鸟瞰地图
	 */
	birdLook() {
		
		this._idrMap.birdLook()
	}
	
	/**
	 * 功能:获取定位点位置
	 * @returns {null|*} - {x, y, floorIndex}
	 */
	getUserPos() {
		
		return this._currentPos
	}
	
	/**
	 * 功能：设置定位点坐标
	 * @param x - float
	 * @param y - float
	 * @param floorIndex - int
	 */
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
	
	/**
	 * 功能：更新marker的位置
	 * @param marker - idrMarker
	 * @param pos - {x, y, floorIndex}
	 * @returns {*} - 返回更新后的marker
	 */
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
	
	/**
	 * 功能：根据名称查找对应的floorIndex中的unit
	 * @param floorIndex - 楼层index
	 * @param name - unit名称
	 * @returns {*} - [idrUnit]
	 */
	findUnitWithApproximatelyName(floorIndex, name) {
		
		var floor = this.mapInfo.getFloorByIndex(floorIndex)
		
		var results = null
		
		var lowercase = name.toLowerCase()
		
		for (var i = 0; i < floor.unitList.length; ++i) {
			
			var unit = floor.unitList[i]
			
			let index = unit.name.indexOf(lowercase)
			
			if (index != -1 && index + name.length == unit.name.length) {
				
				if (!results) {
					
					results = []
				}
				
				results.push(unit)
			}
		}
		
		return results
	}
	
	/**
	 * 功能：获取离pos最近的unit
	 * @param pos - {x,y,floorIndex}
	 * @param targetunits - [idrUnits]
	 * @returns {null} - idrUnit
	 */
	findNearUnit(pos, targetunits) {
		
		return this.mapInfo.getNearUnit(pos, targetunits)
	}
	
	/**
	 * 功能：获取pos周围最近的unit
	 * @param pos - {x,y,floorIndex}
	 */
	getNearUnit(pos) {
		
		var floor = this.mapInfo.getFloorByIndex(pos.floorIndex)
		
		return this.mapInfo.getNearUnit(pos, floor.unitList)
	}
	
	/**
	 * 功能：获取对应类型的unit信息
	 * @param types， map<type, [unit]>
	 */
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
	
	/**
	 * 功能：获取地图id
	 * @returns {null|*}
	 */
	getMapId() {
		
		return this._mapId
	}
	
	/**
	 * 功能：是否动态导航
	 * @returns {boolean|*}
	 */
	isDynamicNavi() {
		
		return this._dynamicNavi
	}
	
	/**
	 * 功能：是否在导航过程中
	 * @returns {boolean}
	 */
	isInNavi() {
		
		return this._inNavi
	}
	
	/**
	 * 功能：设置2D/3D地图模式
	 * @param value - bool(true:2D地图，false：3D地图)
	 */
	set2DMap(value) {
		
		this._idrMap.set2DMap(value)
	}
	
	/**
	 * 功能：释放地图对应的资源
	 */
	release() {
	
		if (this._naviStatusUpdateTimer != null) {
			
			clearInterval(this._naviStatusUpdateTimer)
		}
		
		if (this.deviceAlphaTimer != null) {
		
			clearInterval(this.deviceAlphaTimer)
		}
		
		this._idrMap.release()
	}
	
	_setUserDirection(alpha) {
		
		if (this._currentPos) {
			
			this._idrMap.setUserDirection(alpha)
		}
	}
	
	/**
	 * 功能：获取楼层id
	 * @returns {*}
	 */
	getFloorId() {
		
		if (!this._floor) {
			
			return null
		}
		
		return this._floor.id
	}
	
	/**
	 * 功能：给unit添加覆盖图层
	 * @param units - [idrUnit]
	 * @param imgfile - 图片路径
	 */
	addUnitsOverlay(units, imgfile) {
		
		this._idrMap.addUnitsOverlay(units, imgfile)
	}
	
	/**
	 * 功能：设置多楼层3D视图是否可见
	 * @param value - bool
	 */
	setThumbnailVisibility(value) {
		
		this._idrMap.setThumbnailVisibility(value)
	}
	
	showAllFloor() {
		
		this._idrMap.showAllFloor()
	}
	
	showCurrFloor() {
		
		this._idrMap.showCurrFloor()
	}
	
	/**
	 * 地图状态改变
	 * @param status(0:普通，2：导航跟随)
	 */
	onMapStatusChange(status) {
		
		this._mapEvent.fireEvent(this.eventTypes.onMapStatusChange, {status})
	}
	
	/**
	 * 添加泡泡
	 * @param obj
	 * @param floor
	 * @param x
	 * @param y
	 * @param offsetx
	 * @param offsety
	 */
	insertPaopao(obj, floor, x, y, offsetx, offsety) {
		
		this._idrMap.insertPaopao(obj, floor, x, y, offsetx, offsety)
	}
}