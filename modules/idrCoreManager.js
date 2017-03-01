/**
 * Created by yan on 08/02/2017.
 */

define(function(require, exports, module) {

    require('JSLibrary');
    
    function idrCoreManager() {

        this.loadSessionSuccess = ''

        this.loadSessionFailed = ''
    }

    idrCoreManager.prototype.init = function() {

        var that = this;

        (function() {

            var url = 'http://wx.indoorun.com/wx/getSign.html';

            jsLib.ajax({

                type: "get",

                dataType: 'jsonp',

                url: url, //添加自己的接口链接

                data: {

                    'appId': '2b497ada3b2711e4b60500163e0e2e6b'
                },

                timeOut: 10000,

                success: function (data) {

                    succ && succ(data);
                },
                error: function (str) {

                    console.log(str);
                }
            });
        })();


        function succ(data) {

            success(data, that.loadSessionSuccess, that.loadSessionFailed)
        }

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

            jsLib.ajax({

                type: "get",

                dataType: 'jsonp',

                url: url, //添加自己的接口链接

                data: {},

                timeOut: 10000,

                before: function () {

                    // console.log("before");
                },
                success: function (data) {

                    that.sessionKey = data.sessionKey;

                    data.code === 'failed' ? (errorFn && errorFn(data)) : succFn && succFn(data);
                },
                error: function (str) {

                    console.log(str);

                    errorFn && errorFn();
                }
            });
        }
    }

    var idrCoreMgr = new idrCoreManager();

    module.exports = idrCoreMgr;
});