/**
 * Created by yan on 08/02/2017.
 */

var host = "http://192.168.0.102:8888/"

import networkInstance from './idrNetworkManager.js'

function idrCoreManager() {
    
    this.appId = '2b497ada3b2711e4b60500163e0e2e6b'
    
    this.clientId = ''
    
    this.time = ''
    
    this.sign = ''
    
    this.sessionKey = ''
    
    var self = this

    function init(appid, initSuccessFunc, initFailedFunc) {
        
        self.appId = appid
    
        networkInstance.serverCallWXSign({'appId': appid}, function(data) {
        
            success(data, initSuccessFunc, initFailedFunc);
        
        }, function(str) {
        
            initFailedFunc && initFailedFunc(str)
        })
    }
    
    function success(obj, succFn, errorFn) {
        
        if (typeof obj !== 'object' && typeof succFn !== 'function') {
            
            return
        }
    
        self.clientId = obj.clientId
    
        self.time = obj.time
    
        self.sign = obj.sign
        
        var str = 'appId=' + self.appId + '&clientId=' + self.clientId + '&time=' + self.time + '&sign=' + self.sign
        
        var url = host + 'initSession.html?' + str;
        
        networkInstance.serverCallInitSession(url, function(data) {
    
            self.sessionKey = data.sessionKey;
            
            console.log('sessionKey: ' + self.sessionKey)
            
            data.code === 'failed' ? (errorFn && errorFn(data)) : succFn && succFn(data);
            
        }, function() {
            
            console.log(str);
            
            errorFn && errorFn();
        })
    }
    
    this.init = init
}

var idrCoreMgr = new idrCoreManager();

export  { idrCoreMgr as default }