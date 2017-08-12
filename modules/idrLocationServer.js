/**
 * Created by yan on 23/02/2017.
 */


import BeaconMgr from './idrBeaconManager.js'

import networkInstance from './idrNetworkManager.js'

function idrLocateServer() {
    
    var _floorId = ''
    
    var _beacons = null
    
    var _regionId = ''
    
    var _x = 0
    
    var _y = 0
    
    var _onLocateSuccess = null
    
    var _onLocateFailed = null
    
    var _locateTimerId = null
    
    var _beaconsMgr = new BeaconMgr()
    
    _beaconsMgr.onBeaconReceiveFunc = onReceiveBeacons
    
    function filterbeacons(beacons) {
        
        var newBeacons = []
        
        for (var i = 0; i < beacons.length; ++i) {
            
            var beacon = beacons[i];
            
            if (beacon.rssi != 0) {
                
                var val = {
                    'accuracy':beacon.accuracy,
                    'major':beacon.major,
                    'minor':beacon.minor,
                    'rssi':beacon.rssi
                };
                
                newBeacons.push(val);
            }
        }
        
        return newBeacons;
    }
    
    function onReceiveBeacons(beacons) {
        
        var newBeacons = filterbeacons(beacons)
        
        var beaconParas = JSON.stringify(newBeacons)
        
        _beacons = beaconParas
    }
    
    function onServerLocate() {
        
        if (_beacons === null) {
            
            _beacons = 'empty'
        }
        
        networkInstance.serverCallLocating(_beacons, _regionId, _floorId, function(res) {
            
            var pos = res.data.position
            
            _x = pos.x;
            
            _y = pos.y;
            
            _floorId = pos.floorId;
            
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
        
        _floorId = floorId
    
        _onLocateFailed = onLocateFailed
        
        _beaconsMgr.init(onLocateFailed);
        
        _onLocateSuccess = onLocateSuccess
        
        _locateTimerId = setInterval(onServerLocate, 1000)
    }
    
    this.stop = function () {
        
        clearInterval(_locateTimerId)
        
        _beacons = null
    }
}

export { idrLocateServer as default }