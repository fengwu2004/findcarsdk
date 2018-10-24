export class idrMarker {
	
	constructor({pos, exinfo, callback}, image) {
		
		this.position = pos
		
		this.exinfo = exinfo
		
		this.clickfn = callback
		
		this.image = image
		
		this.typename = image? image : 'idrMarker'
	}
}