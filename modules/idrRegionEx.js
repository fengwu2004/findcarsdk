/**
 * Created by ky on 17-4-21.
 */

import IDRUnit from './idrUnit'

export default class IDRRegionEx {
	
	constructor(regionAllInfo) {
		
		const { floorList, defaultFloorId, address, telephone, latitude, longitude, name } = regionAllInfo
		
		this.floorList = floorList
		
		this.longitude = longitude
		
		this.latitude = latitude
		
		this.defaultFloorId = defaultFloorId
		
		this.telephone = telephone
		
		this.address = address
		
		this.name = name
		
		this._generateUnits()
	}
	
	_generateUnits() {
		
		for (var i = 0; i < this.floorList.length; ++i) {
			
			const { unitList } = this.floorList[i]
			
			delete this.floorList[i].unitList
			
			const {name:floorName, floorIndex, id:floorId} = this.floorList[i]
			
			this.floorList[i].unitList = unitList.map(unit => (
				
				new IDRUnit(unit, floorName, floorIndex, floorId)
			))
		}
	}
	
	findUnitOfFloor(floorIndex, name) {
		
		var floor = this.floorList[floorIndex]
		
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
		
		if (results) {
			
			return results[0]
		}
		
		return results
	}
	
	getFloorName(floorIndex) {
		
		for (var i = 0; i < this.floorList.length; ++i) {
			
			var floor = this.floorList[i]
			
			if (floor.floorIndex === floorIndex) {
				
				return floor.name
			}
		}
		
		return ''
	}
	
	getFloorIndex(floorId) {
		
		for (var i = 0; i < this.floorList.length; ++i) {
			
			var floor = this.floorList[i]
			
			if (floor.id === floorId) {
				
				return floor.floorIndex
			}
		}
		
		return null
	}
	
	getFloorbyId(floorId) {
		
		for (var i = 0; i < this.floorList.length; ++i) {
			
			var floor = this.floorList[i]
			
			if (floor.id === floorId) {
				
				return floor
			}
		}
		
		return null
	}
	
	getUnitById(floorId, unitId) {
		
		var floor = this.getFloorbyId(floorId)
		
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
	
	getUnitWithId(unitId) {
		
		for (let i = 0; i < this.floorList.length; ++i) {
			
			let floor = this.floorList[i]
			
			for (var j = 0; j < floor.unitList.length; ++j) {
				
				var unit = floor.unitList[j]
				
				if (unit.id === unitId) {
					
					return unit
				}
			}
		}
		
		return null
	}
	
	getDistance(pos1, pos2) {
		
		return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
	}
	
	getNearUnit(pos, unitList) {
		
		if (!pos || !pos.floorId) {
			
			return null
		}
		
		if (!unitList) {
			
			var floor = this.getFloorbyId(pos.floorId)
			
			unitList = floor.unitList
		}
		
		var result = null, mindis = 10000
		
		for (var i = 0; i < unitList.length; ++i) {
			
			var unit = unitList[i]
			
			if (unit.floorId !== pos.floorId) {
				
				continue
			}
			
			var dis = this.getDistance(pos, unit.getPos())
			
			if (dis < mindis) {
				
				mindis = dis
				
				result = unit
			}
		}
		
		return result
	}
	
	getAllUnits() {
		
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
}