/**
 * Created by yan on 20/02/2017.
 */
/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

import {networkInstance} from "./idrNetworkManager";

import idrDebug from './idrDebug'

idrDebug.showDebugInfo(true)

export const Bluetooth_poweroff = 'Bluetooth_poweroff'

class idrWxManager {
	
	constructor() {
		
		this._beaconStart = false
		
		this._configSuccess = false
		
		this.onBeaconReceiveFunc = null
	}
	
	async init() {
		
		return new Promise((resolve, reject)=>{
			
			networkInstance.serverCallWxAuth()
				.then((res)=>{
					
					return this.configWx(res)
				})
				.then((res)=>{
					
					this._configSuccess = true
					
					return this.startBeacon()
				})
				.then(res=>{
					
					this._beaconStart = true
					
					this.onSearchBeacons()
					
					resolve()
				})
				.catch(res=>{
					
					reject(res)
				})
		})
	}
	
	async startBeacon() {
		
		return new Promise((resolve, reject)=>{
			
			this.stopBeacon()
				.then(res=>{
					
					wx.startSearchBeacons({
						
						ticket:"",
						
						complete:argv => {
							
							if (argv.errMsg == 'startSearchBeacons:bluetooth power off') {
								
								reject(Bluetooth_poweroff)
							}
							else {
								
								resolve()
							}
						}
					});
				})
		})
	}
	
	async stopBeacon() {
		
		return new Promise((resolve, reject)=>{
			
			wx.stopSearchBeacons({
				
				complete:argv => {
					
					resolve()
				}
			});
		})
	}
	
	onSearchBeacons() {
		
		wx.onSearchBeacons({
			
			complete: argv => {
				
				var beacons = argv.beacons;
				
				this.onBeaconReceiveFunc && this.onBeaconReceiveFunc(beacons);
			}
		});
	}
	
	async configWx({appId, timestamp, nonceStr, signature}) {
		
		if (this._configSuccess) {
			
			return Promise.resolve()
		}
		
		return new Promise((resolve, reject)=>{
			
			wx.config({
				debug: false,
				appId,
				timestamp,
				nonceStr,
				signature,
				jsApiList: [
					'checkJsApi',
					'getNetworkType',
					'getLocation',
					'startSearchBeacons',
					'onSearchBeacons',
					'stopSearchBeacons',
					'onMenuShareAppMessage',
					'onMenuShareTimeline',
					'getNetworkType',
					'openLocation',
					'scanQRCode',
					'onMenuShareQZone'
				]
			});
			
			wx.ready(()=>{
				
				resolve('成功')
			})
			
			wx.error((res) => {
				
				reject(res)
			});
		})
	}
}

var instance = new idrWxManager()

export { instance as default }