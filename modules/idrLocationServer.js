/**
 * Created by yan on 23/02/2017.
 */


import idrWxManagerInstance from './idrWxManager.js'
import idrDebug from './idrDebug'
import { idrCoreMgr } from './idrCoreManager'
import { idrNetworkInstance } from "./idrNetworkManager";

class idrLocateServer {
	
	constructor() {
		
		this._floorId = ''
		
		this._beacons = null
		
		this._count = 0
		
		this._regionId = ''
		
		this._x = 0
		
		this._y = 0
		
		this._started = false
		
		this._onLocateSuccess = null
		
		this._onLocateFailed = null
		
		this._locateTimerId = null
		
		this.onCheckSpeacialBeacons = null
		
		this.mapInfo = null
		
		this.debug = true
		
		this.debugPos = null
		
		this.result = null
	}
	
	_getValidBeacons(beacons) {
		
		var temp = []
	
		if (!beacons) {
			
			return []
		}
		
		for (var i = 0; i < beacons.length; ++i) {
			
			if (parseInt(beacons[i].rssi) !== 0) {
				
				temp.push(beacons[i])
			}
		}
		
		return temp
	}
	
	filterbeacons(inBeacons) {
		
		var beacons = this._getValidBeacons(inBeacons)
		
		var newBeacons = ''
		
		for (var i = 0; i < beacons.length; ++i) {
			
			const beacon = beacons[i];
			
			const { major, minor, rssi } = beacon
			
			var accuracy = parseInt(beacon.accuracy * 100)
			
			var v0 = String.fromCharCode(accuracy & 0x00ff)
			
			var v1 = String.fromCharCode((accuracy & 0xff00) >> 8)
			
			var v2 = String.fromCharCode(parseInt(rssi) + 256)
			
			var v3 = String.fromCharCode(parseInt(minor) & 0x00ff)
			
			var v4 = String.fromCharCode((parseInt(minor) & 0xff00) >> 8)
			
			var v5 = String.fromCharCode(parseInt(major) & 0x00ff)
			
			var v6 = String.fromCharCode((parseInt(major) & 0xff00) >> 8)
			
			var value = v6 + v5 + v4 + v3 + v2 + v1 + v0
			
			newBeacons = newBeacons + value
		}
		
		return {beacons:newBeacons, count:beacons.length};
	}
	
	onReceiveBeacons(beacons) {
		
		var tempBeacons = beacons
		
		if (idrCoreMgr.isAndroid && idrCoreMgr.isApp) {
			
			tempBeacons = JSON.parse(beacons)
			
			idrDebug.showDebugInfo(true)
		}
		
		var newBeacons = this.filterbeacons(tempBeacons)
		
		this.onCheckSpeacialBeacons && this.onCheckSpeacialBeacons(tempBeacons)
		
		this._beacons = window.btoa(newBeacons.beacons)
		
		this._count = newBeacons.count
		
		idrDebug.debugInfo('蓝牙数量' + this._count)
	}
	
	onServerLocate_Debug() {
		
		if (this.debugPos != null) {
			
			this.result = this.debugPos
		}
		else {
			
			this.result = {x: 348, y: 623, floorIndex: 0, regionId: "15208407076393939"}
		}
		
		if (typeof this._onLocateSuccess === 'function') {
			
			this._onLocateSuccess(this.result)
		}
	}
	
	onServerLocate() {
		
		idrNetworkInstance.serverCallLocatingBin({beacons:this._beacons, count:this._count, regionId:this._regionId, floorId:this._floorId}, res => {
			
			this._x = res.x
			
			this._y = res.y
			
			this._floorId = res.floorId
			
			let floorIndex = this.mapInfo.getFloorIndex(res.floorId)
			
			if (typeof this._onLocateSuccess === 'function') {
				
				this._onLocateSuccess({x:this._x, y:this._y, floorId:this._floorId, regionId:this._regionId, floorIndex});
			}
		}, res => {
			
			if (typeof this._onLocateFailed === 'function') {
				
				this._onLocateFailed(res)
			}
		})
	}
	
	setLocateDelegate(success, failed) {
		
		this._onLocateSuccess = success
		
		this._onLocateFailed = failed
		
		idrWxManagerInstance.onBeaconReceiveFunc = (beacons) => this.onReceiveBeacons(beacons)
	}
	
	start(regionId, floorId) {
		
		this._regionId = regionId
		
		this._floorId = floorId
		
		if (idrCoreMgr.isApp) {
		
			return new Promise((resolve, reject)=>{
				
				clearInterval(this._locateTimerId)
				
				this._locateTimerId = setInterval(() => this.onServerLocate(), 1000)
				
				resolve()
			})
		}
		
		if (this.debug) {
			
			return new Promise((resolve, reject)=>{
				
				clearInterval(this._locateTimerId)
				
				this._locateTimerId = setInterval(() => this.onServerLocate_Debug(), 1000)
				
				resolve()
			})
		}
		
		return new Promise((resolve, reject)=>{
			
			idrWxManagerInstance.init()
				.then(()=>{
					
					clearInterval(this._locateTimerId)
					
					this._locateTimerId = setInterval(() => this.onServerLocate(), 1000)
					
					resolve()
				})
				.catch(res=>{
					
					reject(res)
				})
		})
	}
	
	stop() {
		
		clearInterval(this._locateTimerId)
		
		this._started = false
		
		this._beacons = null
	}
}

var idrLocateServerInstance = new idrLocateServer()

window.locateServer = idrLocateServerInstance

export { idrLocateServerInstance as default }