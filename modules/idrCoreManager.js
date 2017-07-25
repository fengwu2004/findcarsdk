/**
 * Created by yan on 08/02/2017.
 */

import networkInstance from './idrNetworkManager'

function idrCoreManager() {

}

idrCoreManager.prototype.init = function(appid, initSuccessFunc, initFailedFunc) {
    
    var that = this;
    
    networkInstance.serverCallWXSign('http://wx.indoorun.com/wx/getSign.html', {'appId': appid}, function(data) {
    
        success(data, initSuccessFunc, initFailedFunc);
        
    }, function(str) {
    
        initFailedFunc && initFailedFunc(str)
    })
    
    function success(obj, succFn, errorFn) {
        
        if (typeof obj !== 'object' && typeof succFn !== 'function') {
            
            return;
        }
        
        that.appId = '2b497ada3b2711e4b60500163e0e2e6b';
        
        that.clientId = obj.clientId;
        
        that.time = obj.time;
        
        that.sign = obj.sign;
        
        var str = 'appId=' + '2b497ada3b2711e4b60500163e0e2e6b' + '&clientId=' + obj.clientId + '&time=' + obj.time + '&sign=' + obj.sign;
        
        var url = 'http://wx.indoorun.com/wx/initSession.html?'+ str;
    
        networkInstance.serverCallInitSession(url, function(data) {
    
            that.sessionKey = data.sessionKey;
    
            data.code === 'failed' ? (errorFn && errorFn(data)) : succFn && succFn(data);
            
        }, function() {
    
            console.log(str);
    
            errorFn && errorFn();
        })
    }
}

var idrCoreMgr = new idrCoreManager();

export  { idrCoreMgr as default }