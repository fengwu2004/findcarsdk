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
                jsApiList: ['checkJsApi', 'getNetworkType', 'getLocation', 'startSearchBeacons', 'onSearchBeacons', 'stopSearchBeacons', 'onMenuShareAppMessage'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            });
        };

        function startSearch() {
            wx.startSearchBeacons({
                ticket: "",
                complete: function (argv) {
                    // alert('startSearchBeacons:'+ JSON.stringify(argv));
                    if (argv) {
                        if (argv.errMsg == 'startSearchBeacons:ok') {
                            bnData.bOpenBlueTooth = true;    //全局 蓝牙开启了

                        } else {
                            errorFn && errorFn(argv);
                        };
                    }
                }
            });
        };

        wx.ready(function () { // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。

            wx.onSearchBeacons({
                complete: function (argv) {
                    if (argv.beacons != null) {
                        var beacons = argv.beacons;
                        var value = "";
                        for (var i = 0; i < beacons.length; i++) {
                            value += beacons[i].major + "-" + beacons[i].minor + ":" + beacons[i].rssi + ", ";
                        }
                        var beaconParas = JSON.stringify(argv.beacons);
                        var domain = 'http://wx.indoorun.com';
                        var url = domain + '/locate/locating';
                        // alert('aaaa');

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
                                // alert('bbbb');
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



                            },
                            error: function (str) {
                            }
                        });

                        /*oUtils.RequestData.ajax('/locate/locating', {
                            method: 'post',
                            data: {
                                'beacons': beaconParas,
                                'openId': oMap.mapValue.ticket,
                                'gzId': 'ewr2342342',
                                'regionId': gV.regionId,
                                'floorId': gV.floorId,
                                'OSType': oMap.mapValue.OSType
                            },
                            fnSucc: function (str) {
                                str = str.replace(/\n/g, '');
                                var data = eval('(' + str + ')');
                                var sx = data.x; //作为起点
                                var sy = data.y;
                                var aClientPos = oMap.changeToClientPos(sx, sy);
                                data.aClientPos = aClientPos;
                                //存到全局去，我要用
                                gV.bnData.bOpenBlueTooth = true;
                                gV.bnData.data = data;
                                //他人的回掉
                                successFn && successFn(data);

                                //我个人的逻辑
                                /!*gV.markSets.forEach(function(item, index) {
                                 if (item.type == 1) {    // 1 代表是动态点(每秒动起来)
                                 if (data.floorId == gV.floorId && data.regionId == gV.regionId) oMap.svgShowPoint(item.dom, [sx, sy], item.aOffsetPos);
                                 }
                                 });*!/
                                /!*if (data != null) {
                                 if (data.code == "success") {
                                 //获取当前楼层的re, flo的id
                                 bnData.regionId = data.regionId;
                                 bnData.floorId = data.floorId;
                                 // alert(gV.floorId +','+ data.floorId+','+(gV.floorId === data.floorId));

                                 bnData.bOpenBlueTooth = true;
                                 bPointShow = true;
                                 iBlueCount = 0; //置0 说明蓝牙还开启着呢

                                 if (gV.bStopBackstage) { //手指触发时先挂起

                                 // debug.log(JSON.stringify(data, null, 4));
                                 var sFloorld = data.floorId;
                                 var sx = data.x; //作为起点
                                 var sy = data.y;
                                 var aClientPos = oMap.changeToClientPos(sx, sy);
                                 var iClientX = aClientPos[0];
                                 var iClientY = aClientPos[1];
                                 bnData.iStartSvgPosX = sx;
                                 bnData.iStartSvgPosY = sy;
                                 bnData.iStartClientPosX = iClientX;
                                 bnData.iStartClientPosY = iClientY;

                                 if (oMap.isRemain(bnData)) { //动态点在当前楼层就显示否则不显示
                                 // alert('bool' + oMap.isRemain(bnData));
                                 oMap.svgShowPoint('pointImg', [sx, sy], 40, 40); //根据svg左边显示动态点
                                 } else {
                                 // document.querySelector('#pointImg').style.display = 'none';
                                 // alert('动态点消失');
                                 };


                                 if (sFloorld != floorId) {
                                 iFloorldCount ++;
                                 if (iFloorldCount >= 4) {
                                 floorId = sFloorld;
                                 document.querySelector('#svgBox').innerHTML = '';
                                 document.getElementById('g_txt').innerHTML = '';
                                 scale = 0;
                                 lastPX = 0;
                                 lastPY = 0;
                                 loadRegion();
                                 Map.ManageClick.bClickBtn = !Map.ManageClick.bClickBtn;

                                 //改按钮
                                 debug.log(aFloors);
                                 debug.log(aFloors[floorId]);
                                 var oDefaultBtn = document.querySelector('#defaultBtn');
                                 oDefaultBtn.innerHTML = aFloors[floorId];
                                 }

                                 } else {
                                 iFloorldCount = 0;
                                 }

                                 //每秒重新画一次线
                                 if (gV.oSelectUnit || gV.facilities.drawEndPoint) {
                                 var aUnitPos = oMap.unitPosChangeToCenterPos(gV.oSelectUnit);
                                 if (aUnitPos.length > 0 && gV.bGps) {

                                 againDraw(sx, sy, aUnitPos[0], aUnitPos[1]);

                                 //到达目的地是否退出导航

                                 if (oMap.getDistance(sx, sy, aUnitPos[0], aUnitPos[1]) <= 80) {
                                 document.querySelector('#upper_dd').style.display = 'block';
                                 }

                                 }
                                 }

                                 }


                                 } else {
                                 if (bOnce) {
                                 bOnce = false;
                                 var oUpperTip = document.querySelector('#upperTip');
                                 oUpperTip.style.display = 'block';
                                 oUpperTip.name = 'tip';
                                 }
                                 }
                                 }*!/

                            }
                        });*/
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
            // alert(JSON.stringify(res));
            alert('进不去啊');
        });

    };




    module.exports = BeaconSignal;

});




