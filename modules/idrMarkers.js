
export class idrMarker {
	
	constructor({pos, exinfo, callback}, icon) {
	
		this.position = pos
		
		this.exinfo = exinfo
		
		this.clickfn = callback
		
		this.icon = icon
		
		this.typename = icon ? icon : 'idrMarker'
	}
}