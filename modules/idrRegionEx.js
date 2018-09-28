/**
 * Created by ky on 17-4-21.
 */

import IDRUnit from './idrUnit'

export default class IDRRegionEx {
	
	constructor(regionAllInfo) {
		
		let { floorList, defaultFloorId, address, telephone, latitude, longitude, name, northDeflectionAngle } = regionAllInfo
		
		this.floorList = floorList.sort((a, b)=>{
			
			if (a.floorIndex > b.floorIndex) {
				
				return 1
			}
			
			if (a.floorIndex < b.floorIndex) {
				
				return -1
			}
			
			return 0
		})
		
		this.longitude = longitude
		
		this.latitude = latitude
		
		this.defaultFloorId = defaultFloorId
		
		this.telephone = telephone
		
		this.address = address
		
		this.name = name
		
		this.northDeflectionAngle = northDeflectionAngle
		
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
			
			this.floorList[i].unitsMap = new Map()
			
			for (let j = 0; j < this.floorList[i].unitList.length; ++j) {
				
				this.floorList[i].unitsMap.set(this.floorList[i].unitList[j].id, this.floorList[i].unitList[j])
			}
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
		
		return floor.unitsMap.get(unitId)
	}
	
	getUnitWithId(unitId) {
		
		for (let i = 0; i < this.floorList.length; ++i) {
			
			let floor = this.floorList[i]
			
			let unit = floor.unitsMap.get(unitId)
			
			if (unit != null) {
				
				return unit
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
}