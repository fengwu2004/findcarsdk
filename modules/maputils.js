/**
 * Created by Sorrow.X on 2016/9/20.
 * maputils.js   地图一些常用功能 (坐标转换，画线和一些常量)
 */



define(function (require, exports, module) {
    var gV = require('./globalvalue');
    var Utils = require('./utils');
    var oUtils = new Utils();
    // require('http://binnng.github.io/debug.js/build/debug.min.js');

    function MapFn() {
        this.mapValue = {    //存放地图的一些静态变量
            // regionId: this._getMapId().regionId,
            // floorId: this._getMapId().floorId,
            OSType: this._checkClient(),
            ticket: 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
        };

        this.preStartObj = {};    // 存上一个startObj起点
        this.aPointList = [];    // 当前楼层的坐标集合
        this.rePlanning = false;    // 路线重新规划中
        this.allClientPos = [];    // 画线时所有的屏幕坐标
        this.allSvgPos = [];    // 画线时所有的svg屏幕坐标
        this.bSameStartObj = false;
        this.allPointList = null;
    };


    module.exports = MapFn;

    MapFn.prototype = {
        constructor: MapFn,

        _getMapId: function () {    //获取(设置值)  regionId,  floorId
            var oUrl = null;

            oUrl = oUtils.UrlUtil.getQueryStringToObj();
            if (oUrl.regionId && oUrl.floorId) {
                gV.regionId = oUrl.regionId;
                gV.floorId = oUrl.floorId;
            } else {
                gV.regionId = '14428254382730015';
                gV.floorId = '14428254382890016';
            }

            return {
                regionId: gV.regionId,
                floorId: gV.floorId
            };
        },

        _checkClient: function () {    //检测客户端
            var OSType = '';

            var ua = navigator.userAgent;

            if (ua.match(/iPhone|iPod/i) != null) {
                OSType = 'iPhone';
            } else if (ua.match(/Android/i) != null) {
                OSType = 'Android';
            }

            return OSType;
        },

        changeToClientPos: function (sx, sy) {    //svg坐标转换为屏幕坐标
            var iClientX = Math.cos(gV.lastSvgAngle * Math.PI / 180) * sx * gV.scale - Math.sin(gV.lastSvgAngle * Math.PI / 180) * sy * gV.scale + gV.lastPX; //屏幕坐标中的x,y
            var iClientY = Math.cos(gV.lastSvgAngle * Math.PI / 180) * sy * gV.scale + Math.sin(gV.lastSvgAngle * Math.PI / 180) * sx * gV.scale + gV.lastPY;

            return [iClientX, iClientY];
        },

        changeToSvgPos: function (iClientX, iClientY) {    //屏幕坐标转换为svg坐标

            var iSvgX = ((iClientX - gV.lastPX) * Math.cos(gV.lastSvgAngle * Math.PI / 180) + (iClientY - gV.lastPY) * Math.sin(gV.lastSvgAngle * Math.PI / 180)) / gV.scale;
            var iSvgY = ((iClientY - gV.lastPY) * Math.cos(gV.lastSvgAngle * Math.PI / 180) - (iClientX - gV.lastPX) * Math.sin(gV.lastSvgAngle * Math.PI / 180)) / gV.scale;

            return [iSvgX, iSvgY];
        },

        svgShowPoint: function (dom, aSvgPos, aOffsetPos) {    //根据svg坐标显示点/点跟着地图走
            if (typeof dom === 'string') objNode = document.querySelector('#' + dom);
            if (typeof aSvgPos === 'undefined') return;
            var objNode = dom;
            var aClientPos = this.changeToClientPos(aSvgPos[0], aSvgPos[1]);
            var iClientX = aClientPos[0];
            var iClientY = aClientPos[1];
            var width, height;
            if (typeof aOffsetPos !== 'undefined') {
                width = aOffsetPos[0];
                height = aOffsetPos[1];
            } else {
                width = 20;
                height = 40;
            }
            // alert(JSON.stringify(arguments));
            // alert('width: ' + width + ' ; height: ' + height);

            if (objNode) {
                objNode.style.display = 'block';
                objNode.style.left = iClientX - width + 'px';
                objNode.style.top = iClientY - height + 'px';
            }

        },

        unitPosChangeToCenterPos: function (unit) {    //根据unit求出其unit的中心点svg中心点坐标
            // alert(JSON.stringify(unit, null, 4));
            if (!unit) return;
            var iSvgLeft = unit.boundLeft;
            var iSvgTop = unit.boundTop;
            var iSvgRight = unit.boundRight;
            var iSvgBottom = unit.boundBottom;

            var cx = (iSvgLeft + iSvgRight) / 2;
            var cy = (iSvgTop + iSvgBottom) / 2;

            return [cx, cy];
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

        isInside: function (svgX, svgY) {     //判断点在多边形内

            var pointInPolygon = function (curPoint, points) {
                var counter = 0;
                for (var i = 0, p1, p2; i < points.length; i++) {
                    p1 = points[i];
                    p2 = points[(i + 1) % points.length];
                    if (p1.y == p2.y) {
                        continue;
                    }
                    if (curPoint.y <= Math.min(p1.y, p2.y)) {
                        continue;
                    }
                    if (curPoint.y >= Math.max(p1.y, p2.y)) {
                        continue;
                    }
                    var x = (curPoint.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
                    if (x > curPoint.x) counter++;
                }

                if (counter % 2 == 0) {
                    return false;
                } else {
                    return true;
                }
            }

            var pointCenter = {x: svgX, y: svgY};
            var polygon = [{x: 0, y: 0}, {x: gV.vb_w, y: 0}, {x: gV.vb_w, y: gV.vb_h}, {x: 0, y: gV.vb_h}, {
                x: 0,
                y: 0
            }];
            return pointInPolygon(pointCenter, polygon);
        },

        isEmptyObject: function (obj) {
            var p;
            for (p in obj)
                return !1;
            return !0
        },

        //以下是画线

        //服务器端的svg坐标集合转化为客户端的坐标对象数组
        changeToAllClientPos: function (aObj) {
            var aNewObj = [];  //新的对象数组

            for (var attr in aObj) {
                var aClientPos = this.changeToClientPos(aObj[attr].x, aObj[attr].y);
                var x = aClientPos[0];
                var y = aClientPos[1];
                var obj = {};
                obj.x = x;
                obj.y = y;
                aNewObj.push(obj);
            }
            ;

            return aNewObj;
        },

        //svg坐标和屏幕坐标实时转换
        changePosPoint: function (obj, aSvgPos, imgWidth, imgHeight) {
            if (!obj) return;
            //屏幕坐标中的iPosX,iPosY
            var aClientPos = this.changeToClientPos(aSvgPos[0], aSvgPos[1]);
            var iPosX = aClientPos[0];
            var iPosY = aClientPos[1];

            var iRealClientX = iPosX - imgWidth / 2;
            var iRealClientY = iPosY - imgHeight / 2;

            obj.style.left = iRealClientX + 'px';
            obj.style.top = iRealClientY + 'px';
        },

        //向服务器请求坐标  Map.StaticGPS.askPos(iStartSvgPosX, iStartSvgPosY, iEndSvgPosX, iEndSvgPosY);       单楼层
        askPos: function (sx, sy, tx, ty) { //sx, sy svg起始坐标  tx, ty  svg终点坐标
            var url = 'http://wx.indoorun.com/wx/getNearestLines.html';
            jsLib.ajax({
                type: "get",
                dataType: 'jsonp',
                url: url, //添加自己的接口链接
                data: {
                    'regionId': this.mapValue.regionId,
                    'floorId': this.mapValue.floorId,
                    'sx': sx,
                    'sy': sy,
                    'tx': tx,
                    'ty': ty
                },
                timeOut: 10000,
                before: function () {
                    // console.log("before");
                },
                success: function (str) {
                    var data = str;
                    if (data != null) {
                        if (data.code == "success") {
                            var oLine = document.querySelector('#line');
                            if (oLine) oLine.innerHTML = '';
                            gV.aLineSvgPos = data.data;
                            var aClientPos = MapFn.prototype.changeToAllClientPos(gV.aLineSvgPos);
                            MapFn.prototype.draw('line', aClientPos, false);
                        }
                    }
                },
                error: function (str) {
                    alert('阿欧,坐标数据没有找到!' + str);
                }
            });

        },

        //向服务器请求坐标  Map.StaticGPS.askPosMore();       多楼层
        askPosMore: function (regionId, startFloorId, endFloorId, startSvgX, startSvgY, endSvgX, endSvgY, isPeopleType) {
            if (isPeopleType) {
                var url = "http://wx.indoorun.com/wx/getMultiFloorNearestLinesByCar.html?regionId=" + regionId + "&sFloorId=" + startFloorId + "&tFloorId=" + endFloorId + "&sx=" + startSvgX + "&sy=" + startSvgY + "&tx=" + endSvgX + "&ty=" + endSvgY;
            } else {
                var url = "http://wx.indoorun.com/wx/getMultiFloorNearestLines.html?regionId=" + regionId + "&sFloorId=" + startFloorId + "&tFloorId=" + endFloorId + "&sx=" + startSvgX + "&sy=" + startSvgY + "&tx=" + endSvgX + "&ty=" + endSvgY;
            };
            jsLib.ajax({
                // type: "get",
                dataType: 'jsonp',
                url: url, //添加自己的接口链接
                data: {'regionId': regionId, 'floorId': floorId},
                timeOut: 10000,
                before: function () {
                    console.log("before");
                },
                success: function (str) {
                    var data = str;
                    if (data != null) {
                        if (data.code == "success") {
                            //存到全局变量去
                            gV.floorMore.floorInfo = [];
                            data.data.forEach(function (item) {
                                gV.floorMore.floorInfo.push(item);
                            });

                            var oLine = document.querySelector('#line');
                            if (oLine) oLine.innerHTML = '';
                            MapFn.prototype.isDrawLine(gV.floorMore.floorInfo);
                        }
                    }
                },
                error: function (str) {
                    alert('阿欧,多坐标数据没有找到!' + str);
                }
            });
            /*oUtils.RequestData.ajax(url, {
             fnSucc: function (str) {
             str = str.replace(/\n/g, '');
             var data = eval('(' + str + ')');
             // gV.floorMore.floorInfo = data.data;

             if (data != null) {
             if (data.code == "success") {
             //存到全局变量去
             gV.floorMore.floorInfo = [];
             data.data.forEach(function (item) {
             gV.floorMore.floorInfo.push(item);
             });

             var oLine = document.querySelector('#line');
             if (oLine) oLine.innerHTML = '';
             MapFn.prototype.isDrawLine(gV.floorMore.floorInfo);
             }
             }
             },
             fnFaild: function (str) {
             alert('阿欧,多坐标数据没有找到!' + str);
             },
             });*/
        },

        //向服务器请求坐标  Map.StaticGPS.askPosMore();       多楼层(外部接口)
        askPosMore22: function (startObj, endObj, bool, distance, fn) {
            var url, strUrl;
            strUrl = startObj.regionId + "&sFloorId=" + startObj.floorId + "&tFloorId=" + endObj.floorId + "&sx=" + startObj.svgX + "&sy=" + startObj.svgY + "&tx=" + endObj.svgX + "&ty=" + endObj.svgY;
            bool == true ? url = "http://wx.indoorun.com/wx/getMultiFloorNearestLinesByCar.html?regionId=" + strUrl
                : url = "http://wx.indoorun.com/wx/getMultiFloorNearestLines.html?regionId=" + strUrl;
            gV.aFloors = [];
            gV.aFloors.push(startObj.floorId);
            gV.aFloors.push(endObj.floorId);
            // console.log('url:' + url);
            jsLib.ajax({
                type: "get",
                dataType: 'jsonp',
                url: url, //添加自己的接口链接
                timeOut: 10000,
                data: {
                    'appId': gV.configure.appId,
                    'clientId': gV.configure.clientId,
                    'sessionKey': gV.configure.sessionKey
                },
                before: function () {
                    // console.log("before");

                },
                success: function (str) {
                    var data = str;
                    if (data != null) {
                        if (data.code == "success") {
                            // alert(JSON.stringify(data.data));
                            //存到全局变量去
                            gV.floorInfo = [];
                            data.data.forEach(function (item) {
                                gV.floorInfo.push(item);
                            });

                            var oLine = document.querySelector('#line');
                            if (oLine) oLine.innerHTML = '';
                            MapFn.prototype.isDrawLine(gV.floorInfo);
                            //执行第三方的逻辑
                            fn && fn(gV.floorInfo);
                        } else {
                            console.log(data.msg);
                        }
                    }
                },
                error: function (str) {
                    alert('阿欧,多坐标数据没有找到!' + str);
                }
            });

        },

        //向服务器请求坐标  Map.StaticGPS.askPosMore();       多楼层(外部接口)
        askPosMore2: function (startObj, endObj, bool, distance, outFn) {
            var self = this,
                bSameStartObj = this._isSameStartObj(startObj);
            this.bSameStartObj = bSameStartObj = this.rePlanning ? false : bSameStartObj;

            // startObj如果是不一样的话就请求服务器
            if (!bSameStartObj) {
                this._getMultiFloorNearestLines(startObj, endObj, bool, outFn, function(data) {
                    self.allPointList = data;
                    self.aPointList = self._getPointList(data, startObj.floorId);    // 获取当前楼层的svg集合坐标
                    var aClientPos = MapFn.prototype.changeToAllClientPos(self.aPointList);    // 当前楼层的集合坐标转成client端
                    self.allSvgPos = [];    // 清空svg集合线坐标
                    self.draw('line', self.aPointList, false, true);    // 求出分割点svg坐标集合点
                    // 清空线
                    var oLine = document.querySelector('#line');
                    if (oLine) oLine.innerHTML = '';
                    // jsLib('#line').show();
                    // self.draw('line', aClientPos, false);    // 重新画线
                    self.reDraw(aClientPos);
                    self.rePlanning = false;
                });
            } else {    // 一样的楼层就用当前楼层的集合坐标
                if (this.allSvgPos.length > 0) {
                    this._getMinimum(this.allSvgPos, startObj, distance, outFn);
                };
            };
        },

        // 清楚画线
        clearLine: function() {
            this.preStartObj = {};    // 存上一个startObj起点
            this.aPointList = [];    // 当前楼层的坐标集合
            this.rePlanning = false;    // 路线重新规划中
            this.allClientPos = [];    // 画线时所有的屏幕坐标
            this.allSvgPos = [];    // 画线时所有的svg屏幕坐标
            this.bSameStartObj = false;
            this.allPointList = null;
        },

        // 是否显示线(有多楼层的要显示)
        isShowLine: function() {
            var aPList = this._getPointList(this.allPointList, gV.floorId);    // 获取当前楼层的svg集合坐标
            if (this.preStartObj.floorId != gV.floorId) {    // 定位点和当前楼层不一样
                if (typeof aPList == 'undefined') {
                    return {
                        bDraw: false,
                        aPList: null
                    };
                } else {
                    return {
                        bDraw: true,
                        aPList: aPList
                    };
                };
            } else {
                return {
                    bDraw: true,
                    aPList: null
                };
            };
        },

        // 套一层画线
        reDraw: function(aClientPos) {
            var oLine = jsLib('#line'),
                result = this.isShowLine();

            if (result.bDraw == false && result.aPList == null) {
                oLine.hide();
            } else if (result.bDraw == true && result.aPList !== null) {
                var acp = MapFn.prototype.changeToAllClientPos(result.aPList);
                oLine.show();
                oLine.html();
                this.draw('line', acp, false);
            } else if (result.bDraw == true && result.aPList == null) {
                oLine.show();
                this.draw('line', aClientPos, false);
            };
        },

        // 根据动态点修改this.aPointList坐标集合, 然后画线
        updatePointList: function(posObj) {
            var obj = {}, result, aClientPos, oLine;
            obj.x = posObj.svgX;
            obj.y = posObj.svgY;

            // 离那个点最近,就把哪个点含左边的点都删掉
            if (typeof this.aPointList === 'object') {
                this.aPointList.forEach(function(obj, index) {    // 求出每个分割点svg坐标的集合坐标和动态点的距离
                    var x = obj.x,
                        y = obj.y;
                    obj.svgDis = this.getDistance(posObj.svgX, posObj.svgY, x, y);
                }, this);
            } else {
                this.rePlanning = false;
                return;
            };

            var flag = 0,
                iMin = this.aPointList[0].svgDis;
            this.aPointList.forEach(function(obj, index) {
                if (iMin > obj.svgDis ) {
                    iMin = obj.svgDis;
                    flag = index;
                };
            });
            this.aPointList = this.aPointList.slice(flag + 1);

            // 一样的就不用添加了
            result = this.aPointList.every(function(item, index, array){
                if (item.x == posObj.svgX && item.y == posObj.svgY) {
                    return false;
                } else {
                    return true;
                };
            });
            if (result) this.aPointList.splice(0, 0, obj);

            aClientPos = MapFn.prototype.changeToAllClientPos(this.aPointList);
            aClientPos = aClientPos.filter(function(item){
                return !(item.x !== item.x || item.y !== item.y);
            });

            // 重新渲染线
            oLine = document.querySelector('#line');
            if (oLine) oLine.innerHTML = '';
            // 判断定位点和当前楼层是否一致，不一致的话看看是否是多楼层导航，否则不现实线

            this.reDraw(aClientPos);
        },

        // startObj起点的floorId是否和上一次一样，不一样的话直接重新请求服务器,且赋值
        _isSameStartObj: function(startObj) {
            var bool = this.preStartObj.floorId == startObj.floorId ? true : false;
            this.preStartObj = startObj;
            return bool;
        },

        // 从服务器请求坐标
        _getMultiFloorNearestLines: function(startObj, endObj, bool, outFn, insideFn) {
            var url, strUrl;
            strUrl = startObj.regionId + "&sFloorId=" + startObj.floorId + "&tFloorId=" + endObj.floorId + "&sx=" + startObj.svgX + "&sy=" + startObj.svgY + "&tx=" + endObj.svgX + "&ty=" + endObj.svgY;
            url = bool == true ? "http://wx.indoorun.com/wx/getMultiFloorNearestLinesByCar.html?regionId=" + strUrl
                : "http://wx.indoorun.com/wx/getMultiFloorNearestLines.html?regionId=" + strUrl;

            jsLib.ajax({
                type: "get",
                dataType: 'jsonp',
                url: url, //添加自己的接口链接
                timeOut: 10000,
                data: {
                    'appId': gV.configure.appId,
                    'clientId': gV.configure.clientId,
                    'sessionKey': gV.configure.sessionKey
                },
                before: function () {
                    // console.log("before");
                },
                success: function (str) {
                    var data = str;
                    if (data != null) {
                        if (data.code == "success") {
                            insideFn && insideFn(data.data);    // 内部我自己使用的
                            outFn && outFn(data.data);    // 外部接口方法
                        } else {
                            console.log(data.msg);
                        }
                    }
                },
                error: function (str) {
                    alert('阿欧,多坐标数据没有找到!' + str);
                }
            });
        },

        // 动态点(起点)坐标和svg集合坐标进行最短距离对比
        _getMinimum: function(allSvgPos, startObj, distance, outFn) {
            var startObjSvgX = startObj.svgX,
                startObjSvgY = startObj.svgY,
                posObj, dis;    // svg分割坐标离动态点最近的坐标, 最近坐标的距离
            // var arrStartClientPos = this.changeToClientPos(startObjSvgX, startObjSvgY);

            allSvgPos.forEach(function(obj, index) {    // 求出每个分割点svg坐标的集合坐标和动态点的距离
                var x = obj.svgX,
                    y = obj.svgY;
                obj.svgDis = this.getDistance(startObjSvgX, startObjSvgY, x, y);
            }, this);

            // 求出最小值距离的对象,并且从最小值距离到集合末尾
            var flag = 0,
                iMin = this.allSvgPos[0].svgDis;
            this.allSvgPos.forEach(function(obj, index) {
                if (iMin > obj.svgDis ) {
                    iMin = obj.svgDis;
                    flag = index;
                };
            });

            posObj = this.allSvgPos[flag];
            dis = posObj.svgDis;

            // 设置用户指定的偏离值
            distance = distance ? distance : 20;

            if (dis <= distance) {    // 小于1米
                console.log('把动态点的坐标替换并修改allSvgPos集合');
                this.allSvgPos = this.allSvgPos.slice(flag + 1);
                if (this.allSvgPos.length == 0) this.rePlanning = true;
                this.updatePointList(posObj);
                var aClientPos = this.changeToClientPos(posObj.svgX, posObj.svgY);
                posObj.aClientPos = aClientPos;
                outFn && outFn(allSvgPos, posObj);
            } else if(dis > distance) {
                console.log('大于指定的偏离距离：重新规划路线');
                var str = '大于指定的偏离距离：重新规划路线';
                outFn && outFn(allSvgPos, str);
                this.rePlanning = true;
            } else {
                console.log('这段怎么办？');
            };
        },

        // 根据动态点的floorId求出楼层的集合坐标
        _getPointList: function(data, floorId) {
            if (Object.prototype.toString.call(data) !== '[object Array]') return;

            var i = 0,
                len = data.length;
            for (; i < len; i ++) {
                var obj = data[i];
                if (obj.floorId == floorId && obj.fromFloorId == floorId && obj.toFloorId == floorId) {
                    return obj.pointList;
                };
            };
        },

        //重新画线(点击楼层切换时，如果楼层进行了多楼层导航, 就会重新画线, 判断如果出发点和终点的楼层对应切换时的地图就自动画线)
        isAgainDraw: function (floorId) {
            MapFn.prototype.isDrawLine(gV.floorInfo);
        },

        // 新的拖动完手势再次画线
        isAgainDraw2: function () {
            var aClientPos, oLine;
            this.aPointList = this._getPointList(this.allPointList, gV.floorId);    // 获取当前楼层的svg集合坐标
            aClientPos = MapFn.prototype.changeToAllClientPos(this.aPointList);

            oLine = document.querySelector('#line');
            if (oLine) oLine.innerHTML = '';
            this.draw('line', aClientPos, false);
        },

        //根据当前楼层来获取要不要划线和划哪部分线
        isDrawLine: function (aData) {
            // ccc ++;
            aData.forEach(function (item, index, arr) {
                var sFloorid = item.floorId;
                if (gV.floorId === sFloorid) {
                    var aPos = item.pointList;
                    gV.aLineSvgPos = aPos;
                    // jsLib('#beaCount').html(gV.aLineSvgPos[0].x + ',' + gV.aLineSvgPos[0].y + ',' + ccc);
                    var aClientPos = MapFn.prototype.changeToAllClientPos(gV.aLineSvgPos);
                    // MapFn.prototype.draw('line', aClientPos, false);
                    this.draw('line', aClientPos, false);
                }
            });

        },

        //判断终点起点是否在属于自己的楼层中
        isRemain: function (obj) {
            // alert(gV.floorId +','+ obj.floorId+','+(gV.floorId === obj.floorId));
            if (gV.floorId === obj.floorId) {
                return true;
            } else {
                return false;
            }
        },

        /**
         * 图片划成线方法
         * @method Map.MapFn.draw();
         * @param {string} id
         * @param {Array} objArr
         * @use var points = [{'x':300, 'y':500}, {'x':450, 'y':300}];  传点(客户端的点集合)然后调用
         Map.MapFn.draw('id', points);
         */
        draw: function (id, objArr, boob, bGetSvgPos) { //参数 id获取元素 ，对象数组
            var obj = document.getElementById(id);
            if (!obj || objArr.length === 0) return;

            var x1 = objArr[0].x;
            var y1 = objArr[0].y; //第一个坐标点的 x,y
            var x2, y2; //紧接着x1,y1后的坐标

            var lastAvgle, //每次更新后的角度
                interval; //间距
            interval = bGetSvgPos ? 5 / gV.scale : 5;

            for (var i = 1; i < objArr.length; i++) {
                x2 = objArr[i].x;
                y2 = objArr[i].y;

                var k; //斜率
                var vertLine = false; //是否垂直线，此时计算斜率为无穷大

                if (x2 != x1) {
                    k = (y2 - y1) / (x2 - x1);
                } else {
                    vertLine = true;
                }

                var dis = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); //斜边长
                var n = parseInt(dis / interval);
                if (dis / interval - n >= 0.5) { //像素超过0.5就向上取整
                    n++;
                };
                var dint = dis / n; //斜边平均化

                var dx, dy;
                if (!vertLine) {
                    dx = Math.sqrt(dint * dint / (1 + k * k)); //求平均化得x
                    if (x2 < x1) {
                        dx = -dx;
                    };
                    dy = dx * k; //求平均化得y
                } else {
                    dx = 0;
                    if (y2 > y1) {
                        dy = dint;
                    } else {
                        dy = -dint;
                    }
                }

                var c = dis;
                var angle;
                if (x2 >= x1 && y2 >= y1) //四个象限的角度
                    angle = Math.asin((y2 - y1) / c) / Math.PI * 180 + 90;
                else if (x2 <= x1 && y2 >= y1)
                    angle = Math.asin((x1 - x2) / c) / Math.PI * 180 + 180;
                else if (x2 <= x1 && y2 <= y1)
                    angle = 360 - Math.asin((x1 - x2) / c) / Math.PI * 180;
                else
                    angle = 90 - Math.asin((y1 - y2) / c) / Math.PI * 180;

                if (i > 1) { //从第3个点开始就开始转弯

                    var fangle = (lastAngle + angle) / 2; //两线转折点的旋转角度取两条线旋转角度的平均值
                    if (Math.abs(lastAngle - angle) > 180) {
                        if (fangle > 180) {
                            fangle -= 180;
                        } else {
                            fangle += 180;
                        }
                    };
                    if (bGetSvgPos){
                        var objPos = {};
                        objPos.svgX = x1;
                        objPos.svgY = y1;
                        objPos.angle = fangle;
                        this.allSvgPos.push(objPos);
                    } else {
                        this.drawAr(obj, x1, y1, fangle, boob); //转折点的第一个点旋转值为fangle
                    };

                    if (bGetSvgPos){
                        for (var j = 1; j < n; j++) {
                            var objPos = {};
                            objPos.svgX = x1 + dx * j;
                            objPos.svgY = y1 + dy * j;
                            objPos.angle = angle;
                            this.allSvgPos.push(objPos);
                        };
                    } else {
                        for (var j = 1; j < n; j++) {
                            this.drawAr(obj, x1 + dx * j, y1 + dy * j, angle, boob);
                        };
                    };
                } else {
                    if (bGetSvgPos){
                        for (var j = 0; j < n; j++) {
                            var objPos = {};
                            objPos.svgX = x1 + dx * j;
                            objPos.svgY = y1 + dy * j;
                            objPos.angle = angle;
                            this.allSvgPos.push(objPos);
                        };
                    } else {
                        for (var j = 0; j < n; j++) {
                            this.drawAr(obj, x1 + dx * j, y1 + dy * j, angle, boob);
                        }
                    };
                }

                lastAngle = angle; //更新角度
                x1 = x2; //更新x,y
                y1 = y2;
            }
        },

        //画图片
        drawAr: function (obj, x, y, angle, boob) { //父元素obj, x:left, y:top ,角度 ,画图片还是线
            var self = this;

            if (boob) {
                var oDiv = document.createElement('div');
                oDiv.style.background = '#f60';
                oDiv.style.width = '3px';
                oDiv.style.height = '8px';
                oDiv.style.position = "absolute";

                // oImg.src = "http://wx.indoorun.com/images/ar.png";
                oDiv.style.left = x - 2 + "px"; //为了让旋转中心落在直线上  -10 , -7
                oDiv.style.top = y - 1 + "px";
                oDiv.style.transform = "rotate(" + angle + "deg)";
                oDiv.style.WebkitTransform = "rotate(" + angle + "deg)";
                oDiv.style.MozTransform = "rotate(" + angle + "deg)";
                oDiv.style.msTransform = "rotate(" + angle + "deg)";
                oDiv.style.OTransform = "rotate(" + angle + "deg)";
                oDiv.style.display = "block";

                obj.appendChild(oDiv);

            } else {
                var oImg = document.createElement("img");

                oImg.style.position = "absolute";
                oImg.src = "http://wx.indoorun.com/images/ar.png";
                oImg.style.left = x - 2 + "px"; //为了让旋转中心落在直线上  -10 , -7
                oImg.style.top = y - 1 + "px";
                oImg.style.transform = "rotate(" + angle + "deg)";
                oImg.style.WebkitTransform = "rotate(" + angle + "deg)";
                oImg.style.MozTransform = "rotate(" + angle + "deg)";
                oImg.style.msTransform = "rotate(" + angle + "deg)";
                oImg.style.OTransform = "rotate(" + angle + "deg)";
                oImg.style.display = "block";

                obj.appendChild(oImg);
            }
        },
    }
});