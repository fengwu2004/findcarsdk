/**
 * Created by yan on 20/02/2017.
 */
/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

import networkInstance from './idrNetworkManager.js'
import idrDebug from './idrDebug'

function idrBeaconMgr() {
	
	// idrDebug.showDebugInfo(true)
	
	var _appId = ''
	
	var _timestamp = ''
	
	var _nonceStr = ''
	
	var _signature = ''
	
	this.beaconStart = false
	
	this.beaconCount = 0
	
	this.onBeaconReceiveFunc = null
	
	var self = this
	
	function init(failedCallback) {
		
		networkInstance.serverCallWxAuth(function(data) {
			
			_appId = data.appId;
			
			_timestamp = data.timestamp;
			
			_nonceStr = data.nonceStr;
			
			_signature = data.signature;
			
			config(failedCallback);
			
		}, function(data) {
			
			console.log('serverCallWxAuth获取失败!' + data);
		})
	}
	
	function config(failedCallback) {
		
		idrDebug.debugInfo('初始化微信')
		
		wx.config({
			debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
			appId: _appId, // 必填，公众号的唯一标识
			timestamp: _timestamp, // 必填，生成签名的时间戳
			nonceStr: _nonceStr, // 必填，生成签名的随机串
			signature: _signature, // 必填，签名，见附录1
			jsApiList: [    // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
				'checkJsApi',
				'getNetworkType',
				'getLocation',
				'startSearchBeacons',
				'onSearchBeacons',
				'stopSearchBeacons',
				'onMenuShareAppMessage',
				'onMenuShareTimeline',
				'getNetworkType',
				'scanQRCode',
				'onMenuShareQZone'
			]
		});
		
		wx.ready(function () {
			
			wx.startSearchBeacons({
				
				ticket:"",
				
				complete:function(argv) {
					
					idrDebug.debugInfo(JSON.stringify(argv))
					
					if (argv.errMsg == 'startSearchBeacons:bluetooth power off') {
						
						self.beaconStart = false
						
						failedCallback(0)
					}
					else {
						
						self.beaconStart = true
					}
				}
			});
			
			wx.onSearchBeacons({
				
				complete: function (argv) {
					
					var beacons = argv.beacons;
					
					self.beaconCount = beacons.length
					
					self.onBeaconReceiveFunc && self.onBeaconReceiveFunc(beacons);
					
					idrDebug.debugInfo('蓝牙数量' + beacons.length)
				}
			});
		});
		
		wx.error(function (res) {
			
			idrDebug.debugInfo('初始化微信失败' + JSON.stringify(res))
		});
	}
	
	this.init = init
}

var instance = new idrBeaconMgr()

export { instance as default }