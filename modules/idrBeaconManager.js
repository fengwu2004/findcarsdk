/**
 * Created by yan on 20/02/2017.
 */
/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

define(function (require, exports, module) {

    require('JSLibrary');

    function idrBeaconMgr() {

        this.sAppId = '';

        this.iTimestamp = '';

        this.sNonceStr = '';

        this.sSignature = '';

        this.onBeaconReceiveFunc = '';
    }

    idrBeaconMgr.prototype.init = function() {

        var obj = this;

        var url = 'http://wx.indoorun.com/wxauth/getAuthParas?reqUrl=' + window.location.href;

        jsLib.ajax({

            type: "get",

            dataType: 'jsonp',

            url: url, //添加自己的接口链接

            timeOut: 10000,

            before: function () {

                // console.log("before");
            },
            success: function (str) {

                var data = str;

                if (data != null) {

                    alert('启动成功');

                    if (data.code == "success") {

                        obj.sAppId = data.appId;

                        obj.iTimestamp = data.timestamp;

                        obj.sNonceStr = data.nonceStr;

                        obj.sSignature = data.signature;

                        config(obj);
                    }
                }
            },
            error: function (str) {

                alert('getInfo()数据获取失败!');
            }
        });
    }

    function config(obj) {

        wx.config({
            debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            appId: obj.sAppId, // 必填，公众号的唯一标识
            timestamp: obj.iTimestamp, // 必填，生成签名的时间戳
            nonceStr: obj.sNonceStr, // 必填，生成签名的随机串
            signature: obj.sSignature, // 必填，签名，见附录1
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

                    alert('开启蓝牙2');

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

    module.exports = idrBeaconMgr;
});