/**
 * Created by yan on 15/03/2017.
 */

import PathSearchV2 from './pathRouteV2/PathSearchV2.js'

import Position from './pathRoute/Position.js'

function idrRouterV2(floorList, pathData) {
	
	var _floorList = floorList
	
	var _start = null
	
	var _end = null
	
	var _car = false
	
	var _pathSearch = new PathSearchV2(pathData)
	
	function getFloorIndex(floorId) {
		
		for (var i = 0; i < _floorList.length; ++i) {
			
			if (_floorList[i].id === floorId) {
				
				return _floorList[i].floorIndex
			}
		}
		
		return -1
	}
	
	function getRouterParm() {
		
		return {start:_start, end:_end, car:_car}
	}
	
	function getFloorId(floorIndex) {
		
		for (var i = 0; i < _floorList.length; ++i) {
			
			if (_floorList[i].floorIndex === floorIndex) {
				
				return _floorList[i].id
			}
		}
		
		return null
	}
	
	/**
	 * @param start 起点
	 * @param end 终点
	 * @param car 是否车行
	 * @return PathResult
	 */
	function routerPath(start, end, car) {
		
		_start = start
		
		_end = end
		
		_car = car
		
		return doRouter(start, end, car)
	}
	
	function doRouter(start, end, car) {
		
		var _sIndex = getFloorIndex(start.floorId)
		
		var _eIndex = getFloorIndex(end.floorId)
		
		var s = new Position
		
		s.x = start.x
		
		s.y = start.y
		
		var e = new Position
		
		e.x = end.x
		
		e.y = end.y
		
		console.log('导航起始点')
		
		console.log(JSON.stringify(start))
		
		console.log(JSON.stringify(end))
		
		console.log('导航起始点--')
		
		var result = _pathSearch.search(_sIndex, s, _eIndex, e, null, car)
		
		let {floorType} = result
		
		floorType.push(0)
		
		var floorPass = []
		
		for (let i = 0; i < floorType.length; ) {
			
			floorPass.push({floor:floorType[i], type:floorType[i + 1]})
			
			i += 2
		}
		
		result.floorType = floorPass
		
		return result
	}
	
	this.getRouterParm = getRouterParm
	
	this.routerPath = routerPath
}

export { idrRouterV2 as default }