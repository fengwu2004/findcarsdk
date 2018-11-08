export class idrMarker {
	
	constructor({pos, image, callback, extInfo}) {
		
		this.position = pos
		
		this.extInfo = extInfo
		
		this.clickfn = callback
		
		this.image = image
		
		this.typename = image? image : 'idrMarker'
	}
}