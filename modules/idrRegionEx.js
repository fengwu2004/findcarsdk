/**
 * Created by ky on 17-4-21.
 */

import IDRUnit from './idrUnit'

function IDRRegionEx(regionAllInfo) {
	
	for (var key in regionAllInfo) {
		
		this[key] = regionAllInfo[key]
	}

    this.floorList.reverse()
	
	var floorList = this.floorList

    var t = new Date()

	for (var i = 0; i < this.floorList.length; ++i) {
		
		var unitList = this.floorList[i].unitList
		
		var units = []

        var floorName = this.floorList[i].name
		
		for (var j = 0; j < unitList.length; ++j) {

		    var idrunit = new IDRUnit(unitList[j])

            idrunit.floorName = floorName

			units.push(idrunit)
		}

		delete this.floorList[i].unitList
		
		this.floorList[i].unitList = units
	}

	console.log('加载unit时间' + (new Date().getTime() - t.getTime()).toString())

	function getFloorName(floorId) {

        for (var i = 0; i < floorList.length; ++i) {

            var floor = floorList[i]

            if (floor.id === floorId) {

                return floor.name
            }
        }

        return ''
    }
	
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
	
	function getDistance(pos1, pos2) {
		
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
	}
	
	function getNearUnit(pos, unitList) {
		
		if (!pos || !pos.floorId) {
			
			return null
		}

		if (!unitList) {

            var floor = getFloorbyId(pos.floorId)

            unitList = floor.unitList
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
	
	function getAllUnits(currnetFloorId) {
		
		var results = []
		
		for (var i = 0; i < this.floorList.length; ++i) {
			
			var units = this.floorList[i].unitList
			
			for (var j = 0; j < units.length; ++j) {
				
				if (units[j].unitTypeId != '0') {
					
					continue
				}
				
				results.push(units[j])
			}
		}
		
		return results
	}
	
	this.getFloorbyId = getFloorbyId
	
	this.getUnitById = getUnitById
	
	this.getFloorIndex = getFloorIndex
	
	this.getNearUnit = getNearUnit
	
	this.getAllUnits = getAllUnits
}

export { IDRRegionEx as default }