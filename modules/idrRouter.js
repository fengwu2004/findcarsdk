/**
 * Created by yan on 15/03/2017.
 */

import PathSearch from './pathRoute/PathSearch.js'

import Position from './pathRoute/Position.js'

function idrRouter(floorList, pathData) {
    
    var _floorList = floorList
    
    var _start = null
    
    var _end = null
    
    var _car = false
	
	  var _pathSearch = new PathSearch(pathData)
    
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
        
        var result = _pathSearch.search(_sIndex, s, _eIndex, e, car, null)
        
        for (var i = 0; i < result.paths.length; ++i) {
            
            var floorId = getFloorId(result.paths[i].floorIndex)
            
            result.paths[i].floorId = floorId
            
            for (var j = 0; j < result.paths[i].position.length; ++j) {
                
                result.paths[i].position[j].floorId = floorId
            }
        }
        
        return result
    }
    
    this.getRouterParm = getRouterParm
    
    this.routerPath = routerPath
}

export { idrRouter as default }