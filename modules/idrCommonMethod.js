/**
 * Created by yan on 02/03/2017.
 */
define(function(require, exports, module) {

    var commMethods = {
            // Div块的显示和隐藏
            showOrHidddenDiv: function (id, bool) {
                var objDom = jsLib('#' + id);
                if (bool) {
                    objDom.setStyle({'opacity': 0});
                    objDom.show();
                    objDom.fadeIn();
                } else {
                    objDom.fadeOut(function () {
                        objDom.hide();
                    });
                }
            },

            // Div块显示隐藏
            showOrHiddenAllDiv: function (arr, state) {

                arr.forEach(function (str) {
                    var objDom = document.querySelector('#' + str);
                    objDom.style.display = state;
                });
            },

            // Div块先显示2秒后再淡出
            divHiddenLater: function (id, timer) {
                var time = timer || 2000;
                var objDom = jsLib('#' + id);
                objDom.setStyle({'opacity': 0});
                objDom.show();
                // objDom.fadeIn();
                objDom.animate({'opacity': 100});
                setTimeout(function () {
                    objDom.fadeOut(function () {
                        // objDom.hide();
                        objDom.animate({'opacity': 0});
                    });
                }, time);
            },

            // 小div提示框
            tipDiv: function (src, str, timer) {

                jsLib('#hint_info').find('img').toDom().src = src;
                jsLib('#hint_info').find('span').html(str);
                if (typeof timer !== undefined) {
                    this.divHiddenLater.call(commMethods, 'hint_info', timer);
                } else {
                    this.divHiddenLater.call(commMethods, 'hint_info');
                }
            },

            // 向服务器发送并存储动静态导航的终点信息
            sendEndInfo: function (unit, floorId, regionId, svgX, svgY) {
                var unitId = unit.id;
                var obj = {
                    unitId: unitId,
                    floorId: floorId,
                    regionId: regionId,
                    svgX: svgX,
                    svgY: svgY
                };
                var sObj = JSON.stringify(obj);
                console.log('sObj ' + sObj);
                var url = 'http://wx.indoorun.com/chene/saveCheLocation.html';
                jsLib.ajax({
                    type: "get",
                    dataType: 'jsonp',
                    url: url, //添加自己的接口链接
                    data: {
                        'sName': sObj,
                        'clientId': clientId,
                        'appId': appId,
                        'sessionKey': data.sessionKey
                    },
                    timeOut: 10000,
                    before: function () {
                        // console.log("before");
                    },
                    success: function (str) {
                        var data = str;
                        if (data != null) {
                            if (data.code == "success") {
                                // alert("发送成功");
                                console.log('发送成功');
                            }
                        }

                    },
                    error: function (str) {
                        alert('向服务器发送并存储动静态导航的终点信息, 失败!'+str);
                    }
                });
            },

            // 向服务器获取存储的动静态导航终点信息
            getSendEndInfo: function (fn) {
                var url = 'http://wx.indoorun.com/chene/getCheLocation.html';
                jsLib.ajax({
                    type: "get",
                    dataType: 'jsonp',
                    url: url, //添加自己的接口链接
                    data: {
                        'clientId': clientId,
                        'appId': appId,
                        'sessionKey': data.sessionKey
                    },
                    timeOut: 10000,
                    before: function () {
                        // console.log("before");
                    },
                    success: function (str) {
                        var data = str;
                        if (data != null) {
                            if (data.code == "success") {
                                fn && fn(data.data);
                            } else {
                                fn && fn('失败');
                            }
                        }
                    },
                    error: function (str) {
                        alert('向服务器获取存储的动静态导航终点信息, 失败!'+str);
                    }
                });
            },

            // 车位标记点从服务器删除
            delCarMark: function () {
                var url = 'http://wx.indoorun.com/chene/removeCheLocation.html';
                jsLib.ajax({
                    type: "get",
                    dataType: 'jsonp',
                    url: url, //添加自己的接口链接
                    data: {
                        'clientId': clientId,
                        'appId': appId,
                        'sessionKey': data.sessionKey
                    },
                    timeOut: 10000,
                    before: function () {
                        // console.log("before");
                    },
                    success: function (str) {
                        var data = str;
                        if (data != null) {
                            if (data.code == "success") {
                                console.log('删除成功');
                            } else {
                                console.log('删除失败');
                            }
                        }
                    },
                    error: function (str) {
                        alert('向服务器获取存储的动静态导航终点信息, 失败!'+ str);
                    }
                });
            },

            // 根据2坐标点求2点之间的距离  getDistance();
            getDistance: function (x1, y1, x2, y2) {
                var a, b, x, d;
                a = x1 - x2;
                b = y1 - y2;
                x = a * a + b * b;
                d = Math.sqrt(x);
                return d;
            },

            /**
             *  求 动态点和地图中最近的unit, 返回最近的unit
             * @param floorId
             * @param regionId
             * @param aSvgPos    动态点的svg坐标
             * @return 返回一个带最近unit的回调函数
             */
            nearestUnit: function (floorId, regionId, aSvgPos, fn) {
                var _self = this;
                map.getCurrentMapUnits(regionId, floorId, function (arrData) {
                    var filterUnit, aJuLi, min, flag, nearUnit;

                    filterUnit = arrData.filter(function (objUnit) {
                        if (objUnit.unitTypeId === '0') {
                            return objUnit;
                        }
                    });
                    aJuLi = filterUnit.map(function (objUnit) {
                        var x1 = objUnit.aSvgPos[0],
                            y1 = objUnit.aSvgPos[1],
                            x2 = aSvgPos[0],
                            y2 = aSvgPos[1];
                        return this.getDistance(x1, y1, x2, y2);
                    }, _self);

                    min = Math.min.apply(null, aJuLi);

                    aJuLi.forEach(function (item, index) {
                        if (min === item) {
                            flag = index;
                        }
                    });

                    nearUnit = filterUnit[flag];

                    fn && fn(nearUnit);

                    // console.log(aJuLi, min, flag, nearUnit);

                }, function () {
                    alert('当前楼层所有unit数据获取失败！');
                });
            },

            // 数组两两组合
            getPos: function (list) {
                var length = list.length - 1, i, j,
                    result = [],
                    resultList = [];

                for (i = 0; i < length; i += 1) {
                    j = i + 1;
                    result.push([i, j]);
                };

                result.forEach(function (arr) {
                    var item1 = arr[0],
                        item2 = arr[1];
                    resultList.push([list[item1], list[item2]]);
                });

                return resultList;
            },

            // 根据组合的坐标求楼层路线的实际总距离
            actualDistance: function (aPosList) {
                var distanceResult = [], distance;

                aPosList.forEach(function (arrObj) {
                    var obj1 = arrObj[0],
                        obj2 = arrObj[1],
                        x1 = obj1.x,
                        y1 = obj1.y,
                        x2 = obj2.x,
                        y2 = obj2.y;

                    distanceResult.push(commMethods.getDistance(x1, y1, x2, y2));
                });

                distance = distanceResult.reduce(function (prev, curr) {
                    return prev + curr;
                });

                return distance;
            },

            // 地图拖动结束然后导航线可以划线
            goCenterAfter: function (fn) {     //commMethods.goCenterAfter();

                var bNag = findCarMD.getbNavigation() || commFacilities.getbSheShiNag() || commFacilities.getbExitNag() || vacancyGuidance.bNearParkNag || shareFn.bDraw;
                if (bNag) {
                    // debug.log('这个方法进来了吗？');
                    blueToothMD.setbDraw(true);    // 移动结束在画线
                    fn && fn();
                };
            },

            // 是否开启trace模式
            getTrace: function () {
                var domObj = jsLib('#location_btn').find('img').toDom();
                if (domObj.src == 'http://wx.indoorun.com/indoorun/app/guozheng/images/location2.png') {
                    blueToothMD.setbTrace(true);
                } else {
                    blueToothMD.setbTrace(false);
                };
            },

            // 数据加载中...
            dataLoading: function (html) {    // commMethods.dataLoading();
                jsLib('#loading').show();
                if (html) {
                    jsLib('#loadingTips').html(html);
                };
            },

            // 数据加载中消失
            dataLoadingCancel: function () {    // commMethods.dataLoadingCancel();   commMethods.dataLoading();
                jsLib('#loading').hide();
                jsLib('#loadingTips').html('数据玩命加载中...');
            },

            // 数组去重
            unique: function (arr) {    //  commMethods.unique();

                var n = {}, r = []; // n 为hash表，r 为临时数组

                for(var i = 0; i < arr.length; i++) {

                    if (!n[arr[i]])  {    // 如果hash表中没有当前项

                        n[arr[i]] = true;    // 存入hash表
                        r.push(arr[i]);    // 把当前数组的当前项push到临时数组里面
                    };
                };

                return r;
            },

            // 楼层切换时每次都需要重新载入的代码放到一起
            reuseCode: function (fn, bKongWei) {    // commMethods.reuseCode();
                // 功能设施Ui以及事件
                commFacilities.makeUi();

                // 楼层样式更改
                changeFloorMD.autoChangeStyle();
                blueToothMD.redPointFloorStyle();
                jsLib('#location_btn').find('img').toDom().src= 'http://wx.indoorun.com/indoorun/app/guozheng/images/location2.png';

                this.goCenterAfter();

                // 空车位是否染色
                if (!bKongWei) {    // 为true不想让其执行
                    if (vacancyGuidance.bParking) {
                        //
                        if (vacancyGuidance.bNearParkNag) {
                            vacancyGuidance.guide();
                        } else {
                            vacancyGuidance.emptyParkingSpacesDyeing(true);
                        };
                    } else {
                        vacancyGuidance.restoreUnitColor();
                    };
                };

                fn && fn();

                // 分享模块处理
                var urlObj = jsLib.getQueryString();
                if (typeof urlObj.svgx !== 'undefined' && typeof urlObj.svgy !== 'undefined') {
                    jsLib('#carMark').hide();
                    map.removeMark('carMark');
                };
            },

            log: function (str) {
                var str = str;
                var url = 'http://wx.indoorun.com/debugWxJsInfo?debugInfo=' + str;
                jsLib.ajax({
                    type: "get",
                    dataType: 'jsonp',
                    url: url, //添加自己的接口链接
                    data: {},
                    timeOut: 10000,
                    before: function () {
                        // console.log("before");
                    },
                    success: function (str) {
                        var data = str;
                        if (data != null) {
                            if (data.code == "success") {
                                // alert("发送成功");
                                console.log('打印日志,发送成功');
                            }
                        }

                    },
                    error: function (str) {
                        alert('打印日志, 失败!'+str);
                    }
                });
            },

            // 判断是否有网络
            hasNavigator: function () {
                if (navigator.onLine) {
                    return true;
                } else {
                    return false;
                }
            },

            // 把原始unit添加一个aSvgPos属性
            setaSvgPos: function (aUnit) {    // commMethods.setaSvgPos()
                aUnit.forEach(function(unit) {
                    var svgx = unit.boundLeft + (unit.boundRight - unit.boundLeft)/2;
                    var svgy = unit.boundTop + (unit.boundBottom - unit.boundTop)/2;
                    var aSvgPos = [svgx, svgy];
                    unit.aSvgPos = aSvgPos;
                });
                return aUnit;
            },

            //设置某个div 转圈
            turnAround: function (id) {
                var roate = 0,
                    value = null,
                    timer = null,
                    domObj = jsLib('#' + id);

                timer = setInterval(function() {
                    /*if (roate > 360) {
                     roate = 0;
                     };*/
                    roate += 30;
                    value = 'rotate(' + roate + 'deg)';
                    domObj.setStyle3('transform', value);
                }, 30);

                return timer;
            },

            // 关闭某个div 转圈
            closeTurnAround: function (timer, id) {
                clearInterval(timer);
                var domObj = jsLib('#' + id),
                    value = 'rotate(' + 0 + 'deg)';
                domObj.setStyle3('transform', value);
            },

            // 专门用来做文字提示的div
            tipsMsg: function(msg) {    // commMethods.tipsMsg(msg);
                jsLib('#tipMsg').html(msg);
                jsLib('#black_back2').show();
                jsLib('#tipDiv').show();
            },

            // 关闭文字提示的div
            closeTipsMsg: function() {    // commMethods.closeTipsMsg();
                findCarMD.setbContinue(true);
                jsLib('#black_back2').hide();
                jsLib('#tipDiv').hide();

            },

            // 是否有黑色遮罩
            bHasBlackDiv: function() {
                if (jsLib('#black_back').toDom().style.display == 'block' || jsLib('#black_back2').toDom().style.display == 'block') {
                    return true;
                } else {
                    return false;
                };
            }
        };

    module.exports = commMethods
});