/**
 * Created by yan on 20/02/2017.
 */
/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

define(function (require, exports, module) {

    require('JSLibrary');

    function idrBeaconMgr(onReceiceFunc) {

        var sAppId = '';

        var iTimestamp = '';

        var sNonceStr = '';

        var sSignature = '';

        var onBeaconReceiveFunc = onReceiceFunc

        var self = this

        this.init = function() {

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

                            sAppId = data.appId;

                            iTimestamp = data.timestamp;

                            sNonceStr = data.nonceStr;

                            sSignature = data.signature;

                            config();
                        }
                    }
                },
                error: function (str) {

                    alert('getInfo()数据获取失败!');
                }
            });
        }

        function config() {

            wx.config({
                debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                appId: sAppId, // 必填，公众号的唯一标识
                timestamp: iTimestamp, // 必填，生成签名的时间戳
                nonceStr: sNonceStr, // 必填，生成签名的随机串
                signature: sSignature, // 必填，签名，见附录1
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

                        // alert(onBeaconReceiveFunc)

                        if (onBeaconReceiveFunc) {

                            onBeaconReceiveFunc(beacons);
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
    }

    module.exports = idrBeaconMgr;
});