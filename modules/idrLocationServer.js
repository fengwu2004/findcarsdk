/**
 * Created by yan on 23/02/2017.
 */


import BeaconMgr from './idrBeaconManager.js'

import networkInstance from './idrNetworkManager.js'

function idrLocateServer() {
    
    var _floorId = ''
    
    var _beacons = null
    
    var _count = 0
    
    var _regionId = ''
    
    var _x = 0
    
    var _y = 0
    
    var _started = false
    
    var _onLocateSuccess = null
    
    var _onLocateFailed = null
    
    var _locateTimerId = null
    
    var _beaconsMgr = new BeaconMgr()
    
    _beaconsMgr.onBeaconReceiveFunc = onReceiveBeacons
    
    function getValidBeacons(beacons) {

        var temp = []

        for (var i = 0; i < beacons.length; ++i) {

            if (parseInt(beacons[i].rssi) !== 0) {

                temp.push(beacons[i])
            }
        }

        return temp
    }
    
    function filterbeacons(inBeacons) {
        
        var beacons = getValidBeacons(inBeacons)
        
        var newBeacons = ''
    
        for (var i = 0; i < beacons.length; ++i) {
        
            var beacon = beacons[i];
        
            var major = parseInt(beacon.major)
        
            var minor = parseInt(beacon.minor)
        
            var rssi = parseInt(beacon.rssi)
        
            var accuracy = parseInt(beacon.accuracy * 100)
            
            var v0 = String.fromCharCode(accuracy & 0x00ff)
        
            var v1 = String.fromCharCode((accuracy & 0xff00) >> 8)
        
            var v2 = String.fromCharCode(rssi + 256)
         
            var v3 = String.fromCharCode(minor & 0x00ff)
        
            var v4 = String.fromCharCode((minor & 0xff00) >> 8)
        
            var v5 = String.fromCharCode(major & 0x00ff)
        
            var v6 = String.fromCharCode((major & 0xff00) >> 8)
        
            var value = v6 + v5 + v4 + v3 + v2 + v1 + v0
        
            newBeacons = newBeacons + value
        }
        
        return {beacons:newBeacons, count:beacons.length};
    }
    
    function onReceiveBeacons(beacons) {
        
        var newBeacons = filterbeacons(beacons)
    
        _beacons = window.btoa(newBeacons.beacons)
    
        _count = newBeacons.count
    }
    
    function onServerLocate() {
        
        if (_count <= 0) {
            
            return
        }
        
        networkInstance.serverCallLocatingBin(_beacons, _count, _regionId, _floorId, function(res) {
            
            _x = res.x
            
            _y = res.y
            
            _floorId = res.floorId
            
            if (typeof _onLocateSuccess === 'function') {
                
                _onLocateSuccess({x:_x, y:_y, floorId:_floorId, regionId:_regionId});
            }
            
        }, function (str) {
            
            if (typeof _onLocateFailed === 'function') {
                
                _onLocateFailed(str)
            }
        })
    }
    
    this.start = function (regionId, floorId, onLocateSuccess, onLocateFailed) {
        
        _regionId = regionId
        
        _started = true
        
        _floorId = floorId
    
        _onLocateFailed = onLocateFailed
        
        _beaconsMgr.init(onLocateFailed);
        
        _onLocateSuccess = onLocateSuccess
        
        _locateTimerId = setInterval(onServerLocate, 1000)
    }
    
    this.stop = function () {
        
        clearInterval(_locateTimerId)
    
        _started = false
        
        _beacons = null
    }
    
    this.isStart = function() {
        
        return _started
    }
}

export { idrLocateServer as default }