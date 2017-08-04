/**
 * Created by yan on 20/02/2017.
 */
/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

import networkInstance from './idrNetworkManager.js'

function idrBeaconMgr() {
    
    this.appId = '';
    
    this.timestamp = '';
    
    this.nonceStr = '';
    
    this.signature = '';
    
    this.onBeaconReceiveFunc = '';
}

idrBeaconMgr.prototype.init = function() {
    
    var obj = this;
    
    networkInstance.serverCallWxAuth(function(data) {
    
        obj.appId = data.appId;
    
        obj.timestamp = data.timestamp;
    
        obj.nonceStr = data.nonceStr;
    
        obj.signature = data.signature;
    
        config(obj);
        
    }, function(data) {
    
        alert('getInfo()数据获取失败!');
    })
}

function config(obj) {
    
    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: obj.appId, // 必填，公众号的唯一标识
        timestamp: obj.timestamp, // 必填，生成签名的时间戳
        nonceStr: obj.nonceStr, // 必填，生成签名的随机串
        signature: obj.signature, // 必填，签名，见附录1
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
            
            complete:function(argv){
                
                alert('开启蓝牙');
            }
        });
        
        wx.onSearchBeacons({
            
            complete: function (argv) {
                
                var beacons = argv.beacons;
                
                if (obj.onBeaconReceiveFunc) {
                    
                    obj.onBeaconReceiveFunc(beacons);
                }
            }
        });
        
        wx.stopSearchBeacons({
            
            complete: function (res) {
                
                resetBeacons();
            }
        });
    });
    
    wx.error(function (res) {
        
        
    });
}

function resetBeacons() {
    
    wx.startSearchBeacons({
        
        ticket: "",
        
        complete: function (argv) {
            
            if (argv && argv.errMsg == 'startSearchBeacons:ok') {
                
                
            }
        }
    });
}

export { idrBeaconMgr as default }