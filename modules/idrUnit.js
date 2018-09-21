
export default class idrUnit {
	
	constructor(unitInfo) {
		
		const {boundLeft, boundRight, boundTop, boundBottom, unitTypeId, id, name, points, floorName, floorIndex, floorId} = unitInfo
		
		this.id = id
		
		this.name = name
		
		this.boundLeft = boundLeft
		
		this.boundRight = boundRight
		
		this.boundTop = boundTop
		
		this.boundBottom = boundBottom
		
		this.floorName = floorName
		
		this.floorIndex = floorIndex
		
		this.floorId = floorId
		
		this.unitTypeId = unitTypeId
		
		if (points) {
			
			this.points = points.split(' ')
		}
		
		this._pts = null
		
		this._points = null
		
		this.position = this.getPos()
	}
	
	getPos() {
		
		let x = 0.5 * (this.boundLeft + this.boundRight)
		
		let y = 0.5 * (this.boundTop + this.boundBottom)
		
		return {x, y, floorId:this.floorId, floorIndex:this.floorIndex}
	}
	
	getPts() {
		
		if (this._pts) {
			
			return this._pts
		}
		
		let pts = this.getPolygon()
		
		this._pts = pts.map(pt => {
			
			let p = pt.split(',').map(Number)
			
			return YFM.Math.Vector.pos(p[0], p[1])
		})
		
		return this._pts
	}
	
	adjustPolygon(points){
		
		const points1 = points[0].split(',')
		
		const x1 = parseFloat(points1[0])
		
		const y1 = parseFloat(points1[1])
		
		const points2 = points[1].split(',')
		
		const x2 = parseFloat(points2[0])
		
		const y2 = parseFloat(points2[1])
		
		const points3 = points[2].split(',')
		
		const x3 = parseFloat(points3[0])
		
		const y3 = parseFloat(points3[1])
		
		const length1 = Math.hypot(x2 - x1, y2 - y1)
		
		const length2 = Math.hypot(x3 - x2, y3 - y2)
		
		if (length1 < length2) {
			
			return points
		}
		
		const start = points[0]
		
		points.shift()
		
		points.push(start)
		
		return points
	}
	
	getPolygon() {
		
		if (!this._points) {
			
			this._points = this.adjustPolygon(this.points)
			
			return this._points
		}
		
		return this._points
	}
}