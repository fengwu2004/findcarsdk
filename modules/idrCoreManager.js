import { networkInstance } from "./idrNetworkManager";

class idrCoreManager {
	
	constructor() {
		
		this.time = 'null'
		
		this.sign = 'null'
	}
	
	async _initWx(appId) {
		
		return networkInstance.serverCallWXSign(appId)
	}
	
	async _initSession() {
		
		return networkInstance.serverCallInitSession()
	}
	
	async init(appId) {
		
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