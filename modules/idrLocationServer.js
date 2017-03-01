/**
 * Created by yan on 23/02/2017.
 */


define(function (require, exports, module) {

    var gv = require('./idrCoreManager');

    var BeaconMgr = require('./idrBeaconMgr');

    function idrLocateServer() {

        this.floorId = '';

        this.regionId = '';

        this.x = 0;

        this.y = 0;

        this.onLocateSuccess = null;

        this.onLocateFailed = null;
    }

    function filterbeacons(beacons) {

        var newBeacons = new Array();

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

    idrLocateServer.prototype.start = function (regionId, floorId, onLocateSuccess) {

        this.beaconsMgr = new BeaconMgr();

        this.beaconsMgr.onBeaconReceiveFunc = onReceiveBeacons;

        this.onLocateSuccess = onLocateSuccess;

        this.beaconsMgr.init();

        this.beaconsMgr.delegator = this;

        var that = this;

        function onReceiveBeacons(beacons) {

            var newBeacons = filterbeacons(beacons);

            var beaconParas = JSON.stringify(newBeacons);

            onServerLocate(beaconParas);
        }

        function onServerLocate(beacons) {

            var domain = 'http://wx.indoorun.com';

            var url = domain + '/locate/locating';

            var data = {
                'beacons': beacons,
                'gzId': 'ewr2342342',
                'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
                'OSType': 'iPhone',
                'regionId': that.regionId,
                'floorId': that.floorId,
                'appId': gv.appId,
                'clientId': gv.clientId,
                'sessionKey': gv.sessionKey
            };

            // console.log(data);

            jsLib.ajax({

                type:'post',

                dataType: 'jsonp',

                url: url, //添加自己的接口链接

                data: data,

                timeOut: 100000,

                before: function () {
                    // console.log("before");
                },

                success: function (obj) {

                    if (obj.code !== 'failed') {

                        that.x = obj.x;

                        that.y = obj.y;

                        that.floorId = obj.floorId;

                        that.regionId = obj.regionId;

                        that.onLocateSuccess(that.x + ', ' + that.y);
                    }
                },

                error: function (str) {


                }
            });
        }
    }

    module.exports = idrLocateServer;
});