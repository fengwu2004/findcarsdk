/**
 * Created by yan on 01/03/2017.
 */
define(function (require, exports, module) {

    var coreManager = require('idrCoreManager');

    var networkInstance = new idrNetworkManager();

    function idrNetworkManager() {

    }

    idrNetworkManager.prototype.serverCallSvgMap = function (regionId, floorId, success, failed) {

        var url = 'http://wx.indoorun.com/wx/getSvg.html';

        var data = {
            'regionId': regionId,
            'floorId': floorId,
            'appId': coreManager.appId,
            'clientId': coreManager.clientId,
            'sessionKey': coreManager.sessionKey
        };

        jsLib.ajax({

            type: "get",

            dataType: 'jsonp',

            url: url, //添加自己的接口链接

            data: data,

            timeOut: 10000,

            before:function () {

            },

            success:function (response) {

                if (response != null && response.code == "success") {

                    if (typeof success === "function") {

                        success(response.data);
                    }
                }
            },

            error:function (response) {

                if (typeof failed === "function") {

                    failed(response);
                }
            }
        });
    }

    idrNetworkManager.prototype.serverCallUnits = function(regionId, floorId, success, failed) {

        var data = {'regionId': regionId, 'floorId': floorId, 'appId': coreManager.appId, 'clientId': coreManager.clientId, 'sessionKey': coreManager.sessionKey};

        var url = 'http://wx.indoorun.com/wx/getUnitsOfFloor.html';

        jsLib.ajax({
            type: "get",
            dataType: 'jsonp',
            url: url, //添加自己的接口链接
            data:data,
            timeOut: 10000,
            before: function () {
            },
            success: function (response) {

                if (response != null && response.code == "success") {

                    if (typeof success === "function") {

                        success(response.data);
                    }
                }
            },
            error: function (response) {

                if (typeof failed === "function") {

                    failed(response);
                }
            }
        });
    }

    idrNetworkManager.prototype.serverCallRegionAllInfo = function (regionId, success, failed) {

        var url = 'http://wx.indoorun.com/wx/getRegionInfo';

        var data = {
            'regionId': regionId,
            'appId': coreManager.appId,
            'clientId': coreManager.clientId,
            'sessionKey': coreManager.sessionKey
        };

        jsLib.ajax({

            type: "get",

            dataType: 'jsonp',

            url: url, //添加自己的接口链接

            data: data,

            timeOut: 10000,

            before: function () {
                // console.log("before");
            },
            success:function (response) {

                if (response != null && response.code == "success") {

                    if (typeof success === "function") {

                        success(response.data);
                    }
                }
            },

            error:function (response) {

                if (typeof failed === "function") {

                    failed(response);
                }
            }
        });
    }

    module.exports = networkInstance;
});