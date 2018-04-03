/**
 * Created by yan on 08/02/2017.
 */

import networkInstance from './idrNetworkManager.js'

function idrCoreManager() {
	
	var u = navigator.userAgent;
	
	this.isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
	
	this.isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
	
	this.appId = ''
	
	this.clientId = ''
	
	this.time = 'null'
	
	this.sign = 'null'
	
	this.sessionKey = ''
	
	this.isAppEnd = false
	
	var self = this
	
	function initWx(appid, initSuccessFunc, initFailedFunc) {
		
		self.appId = appid
		
		networkInstance.serverCallWXSign({'appId': appid}, function(data) {
			
			self.clientId = data.clientId
			
			success(initSuccessFunc, initFailedFunc);
			
		}, function(str) {
			
			initFailedFunc && initFailedFunc(str)
		})
	}
	
	function getQueryString(name) {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
		var r = window.location.search.substr(1).match(reg);
		if (r != null) {
			return decodeURI(r[2]);
		}
		return null;
	}
	
	function initApp(appid, initSuccessFunc, initFailedFunc) {
		
		success(initSuccessFunc, initFailedFunc)
	}
	
	function success(succFn, errorFn) {
		
		if (typeof succFn !== 'function') {
			
			return
		}
		
		var str = 'appId=' + self.appId + '&clientId=' + self.clientId + '&time=' + self.time + '&sign=' + self.sign
		
		var url = networkInstance.host + 'wx/initSession.html?' + str;
		
		networkInstance.serverCallInitSession(url, function(data) {
			
			self.sessionKey = data.sessionKey;
			
			data.code === 'failed' ? (errorFn && errorFn(data)) : succFn && succFn(data);
			
		}, function() {
			
			errorFn && errorFn();
		})
	}
	
	this.init = function (appid, initSuccessFunc, initFailedFunc) {
		
		self.appId = appid
		
		let mac = getQueryString('mac')
		
		if (mac != undefined) {
			
			self.isAppEnd = true
			
			self.clientId = mac
		}
		else {
			
			self.isAppEnd = false
		}
		
		if (!this.isAppEnd) {
			
			initWx(appid, initSuccessFunc, initFailedFunc)
		}
		else {
			
			initApp(appid, initSuccessFunc, initFailedFunc)
		}
	}
}

var idrCoreMgr = new idrCoreManager();

export  { idrCoreMgr as default }