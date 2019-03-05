import { idrNetworkInstance } from "./idrNetworkManager";

class idrCoreManager {
	
	constructor() {
		
		this.time = 'null'
		
		this.sign = 'null'
		
		var u = navigator.userAgent
		
		this.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
		
		let clientId = this.getQueryString('uuid')
		
		this.clientId = clientId
		
		this.isApp = clientId != undefined
	}
	
	_initWx(appId) {
		
		return idrNetworkInstance.serverCallWXSign(appId)
	}
	
	getQueryString(name) {
		
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		
		var r = window.location.search.substr(1).match(reg);
		
		if (r != null) {
			
			return decodeURI(r[2]);
		}
		
		return null;
	}
	
	_initSession() {
		
		return idrNetworkInstance.serverCallInitSession()
	}
	
	init(appId) {
		
		if (this.isApp) {
			
			idrNetworkInstance.appId = appId
			
			idrNetworkInstance.clientId = this.clientId
		
			return new Promise((resolve) => {
				
				this._initSession()
					.then(()=>{
					
						resolve()
					})
			})
		}
		
		return new Promise((resolve, reject)=>{
			
			this._initWx(appId)
				
				.then(()=>{
					
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