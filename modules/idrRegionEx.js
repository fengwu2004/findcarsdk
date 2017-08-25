/**
 * Created by ky on 17-4-21.
 */

import networkManager from './idrNetworkManager.js'

function IDRRegionEx(regionAllInfo) {
    
    for (var key in regionAllInfo) {
        
        this[key] = regionAllInfo[key]
    }
    
    this.floorSvgs = {}
    
    var that = this
    
    var floorList = this.floorList
    
    var svgDataLoaded = false
    
    function getFloorIndex(floorId) {
        
        for (var i = 0; i < floorList.length; ++i) {
            
            var floor = floorList[i]
            
            if (floor.id === floorId) {
                
                return floor.floorIndex
            }
        }
        
        return null
    }
    
    function getFloorbyId(floorId) {
        
        for (var i = 0; i < floorList.length; ++i) {
            
            var floor = floorList[i]
            
            if (floor.id === floorId) {
                
                return floor
            }
        }
        
        return null
    }
    
    function getUnitById(floorId, unitId) {
        
        var floor = getFloorbyId(floorId)
        
        if (floor == null) {
            
            return null
        }
        
        for (var i = 0; i < floor.unitList.length; ++i) {
            
            var unit = floor.unitList[i]
            
            if (unit.id === unitId) {
                
                return unit
            }
        }
        
        return null
    }
    
    function allLoaded() {
        
        for (var i = 0; i < floorList.length; ++i) {
            
            var floorId = floorList[i].id
            
            if (!(floorId in that.floorSvgs)) {
                
                return false
            }
        }
        
        return true
    }
    
    function loadMaps(callBack) {
        
        var time = (new Date()).getTime()
        
        for (var i = 0; i < floorList.length; ++i) {
            
            (function() {
                
                var floorId = floorList[i].id
                
                networkManager.serverCallSvgMap(that.id, floorId, function(res) {
                    
                    console.log(floorId)
                    
                    that.floorSvgs[floorId] = res['data']
                    
                    var va = (new Date()).getTime() - time
                    
                    if (allLoaded()) {
    
                        console.log('时间是多少:' + va.toString())
                        
                        console.log('所有地图数据加载成功')
                        
                        svgDataLoaded = true
                        
                        typeof callBack == "function" && callBack()
                    }
                    
                }, function(data) {
                    
                    console.log('地图数据获取失败!' + data);
                })
            })()
        }
    }
    
    function isSvgDataExist() {
        
        return svgDataLoaded
    }
    
    function getDistance(pos1, pos2) {
        
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
    }
    
    function getNearUnit(pos, unitList) {
        
        if (!pos || !pos.floorId) {
            
            return null
        }
        
        var result = null, mindis = 10000
        
        for (var i = 0; i < unitList.length; ++i) {
        
            var unit = unitList[i]
            
            var dis = getDistance(pos, unit.getPos())
            
            if (dis < mindis) {
                
                mindis = dis
                
                result = unit
            }
        }
        
        return result
    }
    
    this.getFloorbyId = getFloorbyId
    
    this.getUnitById = getUnitById
    
    this.loadSvgMaps = loadMaps
    
    this.isSvgDataExist = isSvgDataExist
    
    this.getFloorIndex = getFloorIndex
    
    this.getNearUnit = getNearUnit 
}

export { IDRRegionEx as default }