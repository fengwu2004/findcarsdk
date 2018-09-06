import { networkInstance } from "./idrNetworkManager";

class idrCoreManager {
	
	constructor() {
		
		this.time = 'null'
		
		this.sign = 'null'
	}
	
	_initWx(appId) {
		
		return networkInstance.serverCallWXSign(appId)
	}
	
	_initSession() {
		
		return networkInstance.serverCallInitSession()
	}
	
	init(appId) {
		
		return new Promise((resolve, reject)=>{
			
			this._initWx(appId)
				
				.then(res=>{
					
					return this._initSession()
				})
				.then(res=>{
					
					resolve(res)
				})
				.catch(res=>{
					
					reject(res)
				})
		})
	}
}

export const idrCoreMgr = new idrCoreManager();