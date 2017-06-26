/**
 * Created by Sorrow.X on 2016/9/20.
 * beacons.js  蓝牙功能模块
 */

define(function (require, exports, module) {
    // require('http://binnng.github.io/debug.js/build/debug.min.js');
    //载入地图功能
    var Maputils = require('./maputils');
    var oMap = new Maputils();
    //载入全局变量
    var gV = require('./globalvalue');
    //载入实用工具
    var Utils = require('./utils');
    var oUtils = new Utils();
    //载入unit
    var ObjectUnits = require('./units');
    var Unit = ObjectUnits.Unit;
    var UnitData = ObjectUnits.UnitsData;
    var unitObj = new Unit();


    var bnData = {    //蓝牙返回的接口
        bOpenBlueTooth: false,    //是否开启蓝牙
        iStartSvgPosX: 0,
        iStartSvgPosY: 0,    //动态点的svg坐标也就是起点的坐标
        iStartClientPosX: 0,
        iStartClientPosY: 0,    //动态点的客户端坐标
        regionId: '',
        floorId: '',

    };


    function BeaconSignal() {}

    BeaconSignal.prototype.init = function () {
        var argNum = 0,
            successFn,
            errorFn;
        for (var i = 0; i < 2; i++) {
            if (typeof arguments[i] === 'function') {
                ++ argNum;
                if (argNum == 1) {
                    successFn = arguments[0];
                } else if (argNum == 2) {
                    errorFn = arguments[1];
                }
            } else if (typeof arguments[i] === 'undefined') {
                continue;    //undefined直接跳过
            }
        };

        // console.log(successFn + ';' + errorFn);

        //蓝牙功能开始
        var sAppId;    // 必填，公众号的唯一标识
        var iTimestamp;    // 必填，生成签名的时间戳
        var sNonceStr;    // 必填，生成签名的随机串
        var sSignature;   // 必填，签名，见附录1

        // var bStopBackstage = true;    //拖或者旋转时，不响应后台每秒掉一次  (默认是响应的)
        var iFloorldCount = 0;    //判断floorid是否有3次和floorid不一样
        var bOnce = true;


        function getInfo() {
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
                        if (data.code == "success") {
                            sAppId = data.appId;
                            iTimestamp = data.timestamp;
                            sNonceStr = data.nonceStr;
                            sSignature = data.signature;
                            // alert('getInfo方法'+'sAppId:'+sAppId+','+'iTimestamp:'+iTimestamp+','+'sNonceStr:'+sNonceStr+','+'sSignature:'+sSignature);
                            startBeaconSearch();
                        }
                    }

                },
                error: function (str) {
                    alert('getInfo()数据获取失败!');
                }
            });
            
        };

        if (typeof gV.configure.wxAppId === 'string' && gV.configure.wxAppId !== '' &&
            typeof gV.configure.wxTimestamp === 'string' &&
            typeof gV.configure.wxNonceStr === 'string' &&
            typeof gV.configure.wxSignature === 'string') {
            sAppId = gV.configure.wxAppId;
            iTimestamp = gV.configure.wxTimestamp;
            sNonceStr = gV.configure.wxNonceStr;
            sSignature = gV.configure.wxSignature;
            startBeaconSearch();
        } else {
            // alert('getInfo');
            getInfo();
        }

        function startBeaconSearch() {
            // alert('sAppId222222:'+sAppId+','+'iTimestamp:'+iTimestamp+','+'sNonceStr:'+sNonceStr+','+'sSignature:'+sSignature);
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
        };

        function startSearch() {
            wx.startSearchBeacons({
                ticket: "",
                complete: function (argv) {
                    // alert('startSearchBeacons:'+ JSON.stringify(argv));
                    if (argv) {
                        // jsLib('#beaCount').html('startSearch: ' + argv.errMsg);
                        if (argv.errMsg == 'startSearchBeacons:ok') {
                            bnData.bOpenBlueTooth = true;    //全局 蓝牙开启了

                        } else {
                            errorFn && errorFn(argv);
                        };
                    };
                }
            });
        };

        wx.ready(function () { // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
            wx.onSearchBeacons({
                complete: function (argv) {
                    // jsLib('#beaCount').html(argv.beacons.length);
                    if (argv.beacons.length !== 0) {

                        var beacons = argv.beacons;

                        var value = "";
                        for (var i = 0; i < beacons.length; i++) {
                            value += beacons[i].major + "-" + beacons[i].minor + ":" + beacons[i].rssi + ", ";
                        };

                        var arrBeacons = argv.beacons.filter(function(obj, index) {

                            if (obj.rssi != 0) {
                                delete obj.uuid;
                                // delete obj.accuracy;
                                delete obj.heading;
                                delete obj.proximity;
                                return true;
                            };
                        });

                        var rssi = [], arrBea = [];
                        arrBeacons.forEach(function(obj) {
                        	rssi.push(parseInt(obj.rssi));
                        });
                        rssi.sort(function(a, b) {
                        	return b - a;
                        });

                        rssi = unique(rssi);

                        rssi.forEach(function(num) {
                        	for (var i = 0, len = arrBeacons.length; i < len; i += 1) {
                        		if (arrBeacons[i].rssi == num) {
                        			arrBea.push(arrBeacons[i]);
                        			break;
                        		};
                        	};
                        });

                        var newArr;
                        if (arrBea.length > 30) {
                            newArr = arrBea.slice(0, 30);
                        } else {
                            newArr = arrBea;
                        };


                        // var beaconParas = JSON.stringify(argv.beacons);
                        var beaconParas = JSON.stringify(newArr);
                        // alert(JSON.stringify(beaconParas));
                        var domain = 'http://wx.indoorun.com';
                        var url = domain + '/locate/locating';

                        // alert('服务器前');
                        jsLib.ajax({
                            type: "post",
                            dataType: 'jsonp',
                            url: url, //添加自己的接口链接
                            data: {
                                'beacons': beaconParas,
                                'openId': oMap.mapValue.ticket,
                                'gzId': 'ewr2342342',
                                'regionId': gV.regionId,
                                'floorId': gV.floorId,
                                'OSType': oMap.mapValue.OSType,
                                'appId': gV.configure.appId,
                                'clientId': gV.configure.clientId,
                                'sessionKey': gV.configure.sessionKey
                            },
                            timeOut: 100000,
                            before: function () {
                                // console.log("before");
                            },
                            success: function (str) {
                                var data = str;

                                var sx = data.x; //作为起点
                                var sy = data.y;
                                var aClientPos = oMap.changeToClientPos(sx, sy);
                                data.aClientPos = aClientPos;
                                data.aSvgPos = [sx, sy];
                                //存到全局去，我要用
                                gV.bnData.bOpenBlueTooth = true;
                                gV.bnData.data = data;
                                //他人的回掉
                                successFn && successFn(data);
                                // alert('服务器成功');
                            },
                            error: function (str) {
                                errorFn && errorFn(str);
                            }
                        });

                        function unique(arr) {    //  commMethods.unique();

                            var n = {}, r = []; // n 为hash表，r 为临时数组

                            for(var i = 0; i < arr.length; i++) {

                                if (!n[arr[i]])  {    // 如果hash表中没有当前项

                                    n[arr[i]] = true;    // 存入hash表
                                    r.push(arr[i]);    // 把当前数组的当前项push到临时数组里面
                                };
                            };

                            return r;
                        }
                    }
                }
            });

            wx.stopSearchBeacons({
                complete: function (res) {
                    startSearch();
                }
            });


        });

        wx.error(function (res) { // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            alert(JSON.stringify(res));
            // alert('进不去啊');
        });

    };




    module.exports = BeaconSignal;


   /* function againDraw(iStartX, iStartY, iEndX, iEndY) {
        //把线删掉
        document.querySelector('#line').innerHTML = '';
        if (gV.facilities.isPeopleType) {    //人型
            oMap.askPosMore(gV.regionId, bnData.floorId, gV.floorDTMore.endObj.floorId, bnData.iStartSvgPosX, bnData.iStartSvgPosY, gV.floorDTMore.endObj.svgx, gV.floorDTMore.endObj.svgy, true);
        } else {    //车型
            oMap.askPosMore(gV.regionId, bnData.floorId, gV.floorDTMore.endObj.floorId, bnData.iStartSvgPosX, bnData.iStartSvgPosY, gV.floorDTMore.endObj.svgx, gV.floorDTMore.endObj.svgy);
        }
    };*/
});




