/**
 * Created by yan on 23/02/2017.
 */


define(function (require, exports, module) {

    var gv = require('./idrCoreManager');

    var BeaconMgr = require('./idrBeaconManager');

    var networkInstance = require('./idrNetworkManager')

    function idrLocateServer() {

        var _floorId = ''

        var _regionId = ''

        var _x = 0

        var _y = 0

        var _onLocateSuccess = null

        var _onLocateFailed = null

        var _beaconsMgr = new BeaconMgr()

        _beaconsMgr.onBeaconReceiveFunc = onReceiveBeacons

        _onLocateSuccess = null;

        var filterbeacons = function(beacons) {

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

        var onReceiveBeacons = function(beacons) {

            var newBeacons = filterbeacons(beacons)

            var beaconParas = JSON.stringify(newBeacons)

            alert('接受到蓝牙')

            onServerLocate(beaconParas)
        }

        var onServerLocate = function(beacons) {

            networkInstance.serverCallLocating(beacons, _regionId, _floorId, function(data) {

                _x = data.x;

                _y = data.y;

                _floorId = data.floorId;

                _regionId = data.regionId;

                _onLocateSuccess(_x + ', ' + _y);
            }, null)
        }

        this.start = function (regionId, floorId, onLocateSuccess) {

            _onLocateSuccess = onLocateSuccess

            _beaconsMgr.init();

            _beaconsMgr.delegator = this;
        }
    }

    module.exports = idrLocateServer;
});