/**
 * Created by Sorrow.X on 2016/9/20.
 * loadmap.js 从后端加载地图
 */

define(function (require, exports, module) {
    var gV = require('./globalvalue');
    //载入工具
    var Utils = require('./utils');
    var oUtils = new Utils();
    //载入地图工具
    var Maputils = require('./maputils');
    var oMapUtils = new Maputils();
    //载入手势
    /*var Hamm = require('./hamm');
     var hammObj = new Hamm();*/

    var hammObj = require('./hamm');
    //载入unit
    var ObjectUnits = require('./units');
    var Unit = ObjectUnits.Unit;
    var unitObj = new Unit();
    //载入clickmap.js 事件处理
    var ClickMap = require('./clickmap'),
        clickMap = new ClickMap();
    //载入蓝牙
    var BeaconSignal = require('./beacons');
    //载入公共设施功能
    // require('./facilities');
    //载入函数库
    require('./JSLibrary');

    // 地图功能YFMap类
    function YFMap() {}


    //配置地图
    YFMap.prototype.configure = function(obj, succFn, errorFn) {
        var self = this;
        if (typeof obj !== 'object' && typeof succFn !== 'function') return;

        if (typeof obj.appId === 'string' &&
            typeof obj.clientId === 'string' &&
            typeof obj.time === 'string' &&
            typeof obj.sign === 'string') {
            gV.configure.appId = obj.appId;
            gV.configure.clientId = obj.clientId;
            gV.configure.time = obj.time;
            gV.configure.sign = obj.sign;
            gV.configure.wxAppId = obj.wxAppId;
            gV.configure.wxTimestamp = obj.wxTimestamp;
            gV.configure.wxNonceStr = obj.wxNonceStr;
            gV.configure.wxSignature = obj.wxSignature;
        } else return;

        var str = 'appId=' + obj.appId + '&clientId=' + obj.clientId + '&time=' + obj.time + '&sign=' + obj.sign;
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
                gV.configure.sessionKey = data.sessionKey;
                data.code === 'failed' ? (errorFn && errorFn(data)) : succFn && succFn(data);
            },
            error: function (str) {
                console.log(str);
                errorFn && errorFn();
            }
        });

    }

    YFMap.prototype.queryAppRegionList = function queryAppRegionList(succ) {
        var url = 'http://wx.indoorun.com/wx/queryAppRegionList.html';
        jsLib.ajax({
            type: "get",
            dataType: 'jsonp',
            url: url, //添加自己的接口链接
            data: {
                'appId': gV.configure.appId,
                'sessionKey': gV.configure.sessionKey
            },
            timeOut: 10000,
            before: function () {
                // console.log("before");
            },
            success: function (data) {
                console.log('queryAppRegionList:' + data);
                succ && succ(data);
            },
            error: function (str) {
                console.log(str);
            }
        });
    }

    //初始化载入地图
    YFMap.prototype.load = function () {
        // 1.参数设置
        var id, floorObj;
        if (typeof arguments[0] !== 'undefined') {

            for (var i = 0; i < 2; i++) {
                if (typeof arguments[i] === 'object' && !floorObj) floorObj = arguments[i];
                else if (typeof arguments[i] === 'string' && !id) id = arguments[i];
            }

            this.id = id;
            this.regionId = floorObj.regionId;
            this.floorId = floorObj.floorId;
            this.switchFloor = floorObj.switchFloor;
        }

        if (this.regionId !== undefined && this.floorId !== undefined) {
            gV.regionId = this.regionId;
            gV.floorId = this.floorId;
        } else {
            //默认从maputils中获取的regionId 和 floorId值或者从url中解析过来值
            this.regionId = gV.regionId = oMapUtils._getMapId().regionId;
            this.floorId = gV.floorId = oMapUtils._getMapId().floorId;
            this.switchFloor = undefined;
            this.id = undefined;
        };

        //如果有回掉函数，则执行回掉函数
        var loadBeforeFn = null;
        var loadSucc = null;
        var countFn = 0;
        [].slice.call(arguments, 0).forEach(function(item) {
            if (typeof item === 'function') {
                ++ countFn;
                if (countFn == 1) {
                    loadSucc = item;    // 载入地图成功的回掉函数
                } else {
                    loadBeforeFn = item;    // 载入地图之前的回掉函数
                };
            }

        });


        // 2. 判断body中是否还有id为svgFrame的div块,如果有则把内容清空,否则第一次自动创建
        var oSvgFrameDom = document.querySelector('#svgFrame');
        if (this.id) {
            if (!oSvgFrameDom) {
                var oParent = document.createElement('div');
                oParent.id = this.id;
                createSvgFrame(oParent);
                document.body.appendChild(oParent);
            } else {
                createSvgFrame(oParent);
            }

        } else {
            createSvgFrame(document.body);
        }

        function createSvgFrame(parent) {

            if (oSvgFrameDom) {    //说明含有此div块, 则清空数据
                var oSvgBoxObj = document.querySelector('#svgBox');
                var oGtxtObj = document.querySelector('#g_txt');
                var oLineObj = document.querySelector('#line');
                oSvgBoxObj.innerHTML = '';
                oGtxtObj.innerHTML = '';
                oLineObj.innerHTML = '';

            } else {    //没有就创建div插入body下
                var oSvgFrame = document.createElement('div');
                oSvgFrame.id = 'svgFrame';
                oSvgFrame.className = 'svg_frame';

                var oSvgBox = document.createElement('div');
                oSvgBox.id = 'svgBox';
                oSvgBox.className = 'svg_box';

                var oGTxt = document.createElement('div');
                oGTxt.id = 'g_txt';
                oGTxt.className = 'gTxt';

                var oLine = document.createElement('div');
                oLine.id = 'line';

                oSvgFrame.appendChild(oSvgBox);
                oSvgFrame.appendChild(oGTxt);
                oSvgFrame.appendChild(oLine);
                parent.appendChild(oSvgFrame);
            }
        }

        // 3.开始载入地图
        (function (regionId, floorId, switchFloor) {

            var url = 'http://wx.indoorun.com/wx/getSvg.html';
            jsLib.ajax({
                type: "get",
                dataType: 'jsonp',
                url: url, //添加自己的接口链接
                data: {
                    'regionId': regionId,
                    'floorId': floorId,
                    'appId': gV.configure.appId,
                    'clientId': gV.configure.clientId,
                    'sessionKey': gV.configure.sessionKey
                },
                timeOut: 10000,
                before: function () {
                    typeof loadBeforeFn == 'function' && loadBeforeFn();
                },
                success: function (str) {
                    /*str = str.replace(/\n/g, '');
                     var data = eval('(' + str + ')');*/
                    var data = str;
                    if (data != null) {
                        if (data.code == "success") {
                            var svg = data.data;
                            var oSvgBox = document.querySelector('#svgBox');
                            var oSvgFrame = document.querySelector('#svgFrame');

                            oSvgBox.innerHTML = svg;
                            gV.exhStr = svg;

                            //给每个unit添加一个id
                            var aUnit = document.querySelector('#unit');
                            var aUnit1 = document.querySelector('#unit_1_');
                            if (aUnit) {
                                var aPolygon = aUnit.getElementsByTagName('polygon');
                                var aRect = aUnit.getElementsByTagName('rect');

                                for (var i = 0; i < aPolygon.length; i++) {
                                    aPolygon[i].id = 'unit_' + i;
                                }

                                for (var i = 0; i < aRect.length; i++) {
                                    aRect[i].id = 'rect_' + i;
                                }
                            }
                            //给unit加id
                            if(aUnit1) {
                                var aR = aUnit1.getElementsByTagName('rect');
                                Array.prototype.forEach.call(aR, function(node, index, array) {
                                    node.id = 'rect_' + index;
                                })
                            }

                            var domView = jsLib.getEle('#viewport');
                            var domBind = jsLib.getEle('#svgBox');
                            hammObj.scale = gV.scale = 0;
                            hammObj.angle = gV.lastSvgAngle = 0;
                            hammObj.init(domView);
                            if (!switchFloor) {    //切换楼层时就不用再次绑定

                                hammObj.bindTouch(domBind);
                                // clickMap.init();    // 注册unit点击事件处理程序
                            }

                            oUtils.HandleNode.setStyle(oSvgFrame, {'display': 'block'});
                            oUtils.HandleNode.setStyle(oSvgBox, {'visibility': 'visible'});

                            //进行文字加载
                            unitObj.getTxtList(regionId, floorId);

                            //重新画线(点击楼层切换时，如果楼层进行了多楼层导航, 就会重新画线)
                            // oMapUtils.isAgainDraw(floorId);
                            // 因为动态划线，本身自己每秒划线一次,所以不必拖动完再次划线
                            if (gV.bDynamicNag === false) {
                                oMapUtils.isAgainDraw(floorId);
                            };
                            hammObj.handleDo();

                            //地图载入完成回掉
                            if (oSvgBox.innerHTM !== '') {
                                loadSucc && loadSucc();
                            }


                            //服务器如果有数据就把终点取出来
                            // oMapUtils.getSendEndInfo();
                            // getSendEndInfo();


                        }
                    }
                },
                error: function (str) {
                    alert('地图数据获取失败!' + str);
                }
            });

        }(this.regionId, this.floorId, this.switchFloor, loadBeforeFn));

        return this;
    }

    //在地图标记点(动态点, 起点, 终点, 或者自定义的dom节点)
    YFMap.prototype.addMark = function (obj) {

        var isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }

        if (typeof obj.id !== 'string' &&
            typeof obj.type !== 'string' &&
            typeof obj.floorId !== 'string' && !isArray(obj.aSvgPos))
            return;

        if (obj.id == 'point') {    //自动生成动态点, 起点, 终点

            defaultCreateDom('point');

        } else if (obj.id == 'start') {

            defaultCreateDom('start');

        } else if (obj.id == 'end') {

            defaultCreateDom('end');

        } else {    //否则用户自定义

            add(obj, obj.id);
        }

        function defaultCreateDom(id) {

            if (!(document.querySelector('#' + id))) {
                createDom(obj, 'http://wx.indoorun.com/indoorun/common/cheneapp/images/' + id + '.png');
                add(obj, obj.id);
            } else {
                add(obj, obj.id);
            }
        }

        function createDom(obj, src) {
            //生成节点
            var oParent = document.querySelector('#svgFrame');
            var oDiv = document.createElement('div');
            oDiv.id = obj.id;
            oDiv.style.display = 'none';
            var oImg = document.createElement('img');
            oImg.src = src;
            if (obj.id === 'point') {
                oImg.style.width = '60px';
                oImg.style.height = '60px';
            } else {
                oImg.style.width = '40px';
                oImg.style.height = '40px';
            }
            oDiv.appendChild(oImg);
            oParent.appendChild(oDiv);
        }

        function add(obj, id) {
            var dom = document.querySelector('#' + id);

            var aClientPos = oMapUtils.changeToClientPos(obj.aSvgPos[0], obj.aSvgPos[1]);
            if (obj.floorId == gV.floorId) {
                dom.style.display = 'block';
            } else {
                dom.style.display = 'none';
            }
            dom.style.position = 'absolute';
            dom.style.zIndex = '10';
            dom.style.left = aClientPos[0] - obj.aOffsetPos[0] + 'px';
            dom.style.top = aClientPos[1] - obj.aOffsetPos[1] + 'px';

            obj.dom = dom;

            hammObj.addMark(obj);
        }

        return this;
    }

    //移除标记点
    YFMap.prototype.removeMark = function (id) {
        if (typeof id !== 'string') return;
        var dom = document.querySelector('#' + id);
        if (!dom) return;

        dom.style.display = 'none';
        dom.style.position = 'absolute';
        dom.style.zIndex = '10';
        dom.style.left = 0 + 'px';
        dom.style.top = 0 + 'px';

        hammObj.removeMark(id);
    }

    //移除标记点根据类型
    YFMap.prototype.removeMarkByType = function (type) {
        if (typeof type !== 'string') return;

        hammObj.removeMarkByType(type);
    }

    //楼层切换函数回掉
    YFMap.prototype.changeFloor = function () {
        var successFn, errorFn;
        if (typeof arguments[0] !== 'function') return;

        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[0] == 'function')
                successFn = arguments[0];
            if (typeof arguments[1] == 'function')
                errorFn = arguments[1];
        }

        var url = 'http://wx.indoorun.com/wx/getRegionInfo';
        jsLib.ajax({
            type: "get",
            dataType: 'jsonp',
            url: url, //添加自己的接口链接
            data: {
                'regionId': this.regionId,
                'appId': gV.configure.appId,
                'clientId': gV.configure.clientId,
                'sessionKey': gV.configure.sessionKey
            },
            timeOut: 10000,
            before: function () {
                // console.log("before");
            },
            success: function (str) {
                var data = str;
                if (data != null) {
                    if (data.code == "success") {
                        gV.floorData.aAllFloor = data.data.floorList;
                        successFn && successFn(data.data);
                        // successFn && successFn(data.data.floorList);
                        document.title = data.data.name;
                        gV.initAngle = data.data.northDeflectionAngle;
                        gV.deflectionAngle = gV.initAngle + gV.lastSvgAngle + gV.eomagnetigcAngle;
                    } else {
                        errorFn && errorFn(str);
                    }
                }
            },
            error: function (str) {
                errorFn && errorFn(str);
            }
        });

        return this;

    }

    //点击地图unit的处理
    YFMap.prototype.clickUnit = function () {
        var getInfoUnit, noGetInfoUnit;
        for (var i = 0; i < 2; i++) {
            if (typeof arguments[i] === 'function') {
                i == 0 ? getInfoUnit = arguments[0] : noGetInfoUnit = arguments[1];
            } else {
                return;
            }
        }

        clickMap.init(getInfoUnit, noGetInfoUnit);    // 注册unit点击事件处理程序
    }

    //是否禁止点击地图(true代表禁止, false代表允许点击unit)
    YFMap.prototype.forbidClickUnit = function () {

        if (typeof arguments[0] !== 'boolean') return;
        else
            var bool = arguments[0];

        bool == true ? gV.bGps = true : gV.bGps = false;
        // console.log(gV.bGps);
    }

    //地图画线(包含静态, 动态, 人型, 车型, 动静态导航)
    YFMap.prototype.navigate = function (startObj, endObj, bool, fn) {

        function isGoOn(obj) {
            if (typeof obj == 'object' && (!oMapUtils.isEmptyObject(startObj))) {
                if (typeof obj.regionId === 'string' &&
                    typeof obj.floorId === 'string' &&
                    typeof obj.svgX === 'number' &&
                    typeof obj.svgY === 'number') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        for (var i = 0; i < 2; i++) {
            if (!isGoOn(arguments[i])) return;
        }

        if (typeof arguments[2] !== 'boolean') return;

        oMapUtils.askPosMore2(startObj, endObj, bool, fn);

        return this;
    }

    YFMap.prototype.open = function (bool) {
        gV.bDynamicNag = bool;    // true为动态导航,false静态导航(默认的)
    }

    YFMap.prototype.clearLine = function (bool) {
        gV.bClearLine = bool;    // true为默认清空线,false不清空线
    }

    //取消地图划线
    YFMap.prototype.cancelNavigate = function () {
        gV.aLineSvgPos = []; //线的坐标集合置空
        gV.floorInfo = [];
        gV.aFloors = [];    //重置多楼层画线的传过来的floorId

        //清空线
        var oLine = document.querySelector('#line');
        if (oLine) oLine.innerHTML = '';
    }

    //地图放大缩小功能
    YFMap.prototype.zoom = function () {
        var _this = this;
        var big, small;
        if (typeof arguments[0] === 'string' && typeof arguments[1] === 'string') {
            big = arguments[0];
            small = arguments[1];
            onListener(big, small);    //使用用户自定义的
        } else {
            useDefault();    //否则使用默认的
        }

        function useDefault() {
            //先创建节点
            var oParent = document.querySelector('#svgFrame');
            var oDiv = document.createElement('div');
            oDiv.className = 'scale_btn';
            oDiv.innerHTML = "<div>\
				                  <img id=\"big\" src = \"http://wx.indoorun.com/indoorun/common/cheneapp/images/big.png\" >\
				              </div>\
				              <div>\
				                  <img id=\"small\" src = \"http://wx.indoorun.com/indoorun/common/cheneapp/images/small.png\" >\
				              </div>";
            document.body.appendChild(oDiv);
            onListener('big', 'small');
        }

        function onListener(big, small) {    //注册监听事件
            var oBig = document.querySelector('#' + big);
            var oSmall = document.querySelector('#' + small);
            oBig.addEventListener('click', function () {
                zoom('big');
            }, false);
            oSmall.addEventListener('click', function () {
                zoom('small');
            }, false);
        }

        function zoom(state) {
            //清空线
            var oLine = document.querySelector('#line');
            var screenX, screenY,    //屏幕中心坐标
                svgX, svgY,    //屏幕中心svg坐标
                screenX2, screenY2,    //根据scale换算新的屏幕中心坐标
                chaZhiX, chaZhiY,    //新屏幕中心坐标减去一开始的屏幕中心坐标
                px, py;    //最终的偏移值

            screenX = gV.box_w / 2;
            screenY = gV.box_h / 2;
            svgX = ((screenX - gV.lastPX) * Math.cos(gV.lastSvgAngle * Math.PI / 180) + (screenY - gV.lastPY) * Math.sin(gV.lastSvgAngle * Math.PI / 180)) / gV.scale;
            svgY = ((screenY - gV.lastPY) * Math.cos(gV.lastSvgAngle * Math.PI / 180) - (screenX - gV.lastPX) * Math.sin(gV.lastSvgAngle * Math.PI / 180)) / gV.scale;

            if (state == 'big') {    //处理放大
                if (oLine) oLine.innerHTML = '';
                jsLib.move.easeIn([1, 1.2], 100, function (speed) {
                    hammObj.scale = gV.scale = gV.scale * speed;
                    if (gV.scale >= gV.ratio * 5) {
                        hammObj.scale = gV.scale = gV.ratio * 5;
                    }
                    askValue();
                    hammObj.showMap(gV.scale, px, py);
                    hammObj.handleDo();
                    unitObj.textTransformation(ObjectUnits.UnitsData.allUnits);
                }, otherThing);

            } else if (state == 'small') {
                if (oLine) oLine.innerHTML = '';
                jsLib.move.easeIn([1, .8], 100, function (speed) {
                    hammObj.scale = gV.scale = gV.scale * speed;
                    if (gV.scale <= gV.ratio) {
                        hammObj.scale = gV.scale = gV.ratio * .8;
                    }
                    askValue();
                    hammObj.showMap(gV.scale, px, py);
                    hammObj.handleDo();
                    unitObj.textTransformation(ObjectUnits.UnitsData.allUnits);
                }, otherThing);
            }
            ;

            function askValue() {
                screenX2 = Math.cos(gV.lastSvgAngle * Math.PI / 180) * svgX * gV.scale - Math.sin(gV.lastSvgAngle * Math.PI / 180) * svgY * gV.scale + gV.lastPX; //屏幕坐标中的x,y
                screenY2 = Math.cos(gV.lastSvgAngle * Math.PI / 180) * svgY * gV.scale + Math.sin(gV.lastSvgAngle * Math.PI / 180) * svgX * gV.scale + gV.lastPY;
                chaZhiX = screenX - screenX2;
                chaZhiY = screenY - screenY2;
                px = chaZhiX + gV.lastPX;
                py = chaZhiY + gV.lastPY;
            };

            function getQueryString(name) {
                var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
                var r = window.location.search.substr(1).match(reg);
                if (r != null) return unescape(r[2]);
                return null;
            };

            function otherThing() {
                //重新画线(点击楼层切换时，如果楼层进行了多楼层导航, 就会重新画线)
                // 因为动态划线，本身自己每秒划线一次,所以不必拖动完再次划线
                if (gV.bDynamicNag === false) {
                    oMapUtils.isAgainDraw(_this.floorId);
                };
                // oMapUtils.isAgainDraw(_this.floorId);
            }
        };
    }

    //获取当前地图所有unit信息
    YFMap.prototype.getCurrentMapUnits = function(regionId, floorId, successFn, errorFn) {
        if (typeof arguments[0] !== 'string' ||
            typeof arguments[1] !== 'string' ||
            typeof arguments[2] !== 'function')
            return;

        var url = 'http://wx.indoorun.com/wx/getUnitsOfFloor.html';
        jsLib.ajax({
            type: "get",
            dataType: 'jsonp',
            url: url, //添加自己的接口链接
            data: {
                'regionId': regionId,
                'floorId': floorId,
                'appId': gV.configure.appId,
                'clientId': gV.configure.clientId,
                'sessionKey': gV.configure.sessionKey
            },
            timeOut: 10000,
            before: function () {
                // console.log("before");
            },
            success: function (str) {
                var data = str;
                if (data != null) {
                    if (data.code == "success") {
                        var data = data.data;
                        var aNewData = [];
                        data.forEach(function(item) {
                            var aSvgPos = oMapUtils.unitPosChangeToCenterPos(item);
                            item.aSvgPos = aSvgPos;
                            aNewData.push(item);
                        });
                        successFn && successFn(aNewData);
                    }
                }
            },
            error: function (str) {
                errorFn && errorFn(str);
            }
        });

    }

    //点移到屏幕中心点(地图也跟着走)
    YFMap.prototype.goCenter = function(obj) {
        //清空线
        var oLine = document.querySelector('#line');
        if (oLine) oLine.innerHTML = '';

        var isArray = function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        }
        if (typeof obj === 'object') {
            if (typeof obj.dom !== 'object' && (!isArray(obj.aSvgPos)) && (!isArray(obj.aOffsetPos)))
                return;
        }

        var aClientPos = oMapUtils.changeToClientPos(obj.aSvgPos[0], obj.aSvgPos[1]);

        if (obj.dom.style.display === 'block') {
            var cx = gV.box_w / 2 - aClientPos[0] - obj.aOffsetPos[0];
            var cy = gV.box_h / 2 - aClientPos[1] - obj.aOffsetPos[1];
            var px = cx + gV.lastPX;
            var py = cy + gV.lastPY;

            hammObj.showMap(gV.scale, px, py);
            unitObj.textTransformation(ObjectUnits.UnitsData.allUnits);
            hammObj.handleDo();

            //重新画线(点击楼层切换时，如果楼层进行了多楼层导航, 就会重新画线)
            // oMapUtils.isAgainDraw(this.floorId);
            // 因为动态划线，本身自己每秒划线一次,所以不必拖动完再次划线
            if (gV.bDynamicNag === false) {
                oMapUtils.isAgainDraw(this.floorId);
            };
        }

    }

    //把屏幕上的坐标转换成地图svg坐标
    YFMap.prototype.changeToSvgPos = function(arr) {
        // if (!YFMap._methods.isArray(arr)) return;
        if (Object.prototype.toString.call(arr) !== '[object Array]') return;
        return oMapUtils.changeToSvgPos(arr[0], arr[1]);
    }

    //指北针
    YFMap.prototype.compass = function(id) {
        if (typeof id !== 'string') return;

        gV.compass.id = id;
        gV.compass.isCompass = true;
    }

    //地图还原
    YFMap.prototype.reducedMap = function() {

        jsLib('#g_txt').html('');    //清除文字

        var view = gV.globalViewBow.split(" ");
        gV.x = parseFloat(view[0]); //svg原始 左上角x坐标，一般为0
        gV.y = parseFloat(view[1]); //svg原始 左上角y坐标，一般为0
        gV.width = gV.vb_w = parseFloat(view[2]) - gV.x; //svg原始 宽度
        gV.height = gV.vb_h = parseFloat(view[3]) - gV.y; //svg原始 高度
        gV.widthLevel = gV.box_w / gV.width;
        gV.heightLevel = gV.box_h / gV.height;
        hammObj.scale = gV.scale = gV.ratio = Math.min(gV.widthLevel, gV.heightLevel);

        var px = gV.box_w / 2 - gV.vb_w / 2 * gV.scale; //需要偏移的量， 屏幕坐标系即svg缩放后的，屏幕中心点坐标 - svg中心点变换后的坐标
        var py = gV.box_h / 2 - gV.vb_h / 2 * gV.scale;

        hammObj.lastPX = gV.lastPX = px;
        hammObj.lastPY = gV.lastPY = py;
        hammObj.angle = gV.lastSvgAngle = 0;
        hammObj.showMap(gV.scale, px, py);    //还原地图

        hammObj.handleDo();

        unitObj.getTxtList(this.regionId, this.floorId);//加载文字
    }

    //地图模式-trace模式
    YFMap.prototype.trace = function(point, aClientPos, arr, fn) {
        if (gV.bStopBackstage) {    //响应完再执行
            if (point !== 'point') return;
            var oPointDom = jsLib('#point').toDom();
            // if (oPointDom && oPointDom.style.display === 'block') {
            if (true) {
                // 1.计算虚拟边框四个点(上右下左)
                var width = gV.box_w, height = gV.box_h;
                var topRatio = arr[0]/100,
                    rightRatio = arr[1]/100,
                    bottomRatio = arr[2]/100,
                    leftRatio = arr[3]/100;    // 上右下左框的比例
                var a = width * leftRatio,
                    b = height * topRatio,
                    c = width - width * rightRatio,
                    d = height - height * bottomRatio;
                var leftTop = { x: a, y: b },
                    rightTop = { x: c, y: b },
                    rightBottom = { x: c, y: d },
                    leftBottom = { x: a, y: d };
                // 2.判断点是否在矩形内
                var pointCenter = { x: aClientPos[0], y: aClientPos[1] };
                var polygon = [leftTop, rightTop, rightBottom, leftBottom, leftTop];
                var isExist = jsLib.utils.pointInPolygon(pointCenter, polygon);
                // 3.超出虚拟屏幕就给我回到中心点去
                if (!isExist) {
                    // console.log('给我拉回来');
                    var objDom = document.querySelector('#point')
                    YFMap.prototype.goCenter({
                        dom: objDom,
                        aSvgPos: [gV.bnData.data.x, gV.bnData.data.y],
                        aOffsetPos: [0, 40]
                    });
                    fn && fn();
                } else {
                    // console.log('没事');
                }
            }
        }


    }

    //雷达波
    YFMap.prototype.wave = function(id, arr, rot) {
        if (id !== 'point' && ({}).toString.call(arr) !== '[object Array]') return;

        var dom = jsLib('#point').toDom();

        if (dom && dom.style.display === 'block') {
            document.body.appendChild(document.querySelector('#point'));    //剪切point div到body下

            var w = wave.getInstance();
            w.setDomStyle([arr[0], arr[1]]);
            if (!gV.bStopBackstage) {
                w.recoveryStyle();
            } else {
                if (w.state()) {
                    w.move();
                }
            }
            if (rot == 'rotate') {    //动态点旋转
                w.domRotate(rot);
            }
        }
    }

    //是否自动切换楼层
    YFMap.prototype.autoSwitchFloor = function(bool, fn) {
        if (typeof bool !== 'boolean') return;

        if (bool) {

            if (gV.bnData.data.floorId !== gV.floorId) {    //切换
                gV.bSFloorCount = gV.bSFloorCount + 1;
                if ( gV.bSFloorCount >= 3) {
                    gV.floorId = this.floorId = gV.bnData.data.floorId;
                    gV.regionId = this.regionId = gV.bnData.data.regionId;
                    gV.bSFloorCount = 0;

                    YFMap.prototype.load({
                        regionId: gV.bnData.data.regionId,
                        floorId: gV.bnData.data.floorId,
                        switchFloor: true
                    }, function () {
                        fn && fn();
                    });
                }
            }

        }
    }

    //把拖动，旋转，放大缩小中这个接口抛出去（移动中）
    YFMap.prototype.move = function (fn) {
        // if (typeof arguments !== 'boolean') return;
        if (typeof fn !== 'function') return;
        hammObj.outInterfaceHandleDo(fn);
    }

    //把拖动，旋转，放大缩小中这个接口抛出去（移动结束）
    YFMap.prototype.moveEnd = function (fn) {
        // if (typeof arguments !== 'boolean') return;
        if (typeof fn !== 'function') return;
        hammObj.outInterfaceHandleAfter(fn);
    }

    YFMap.prototype.getRegion = function(fn, errorFn) {
        var url = 'http://wx.indoorun.com/wx/queryAppRegionList.html';
        jsLib.ajax({
            type: "get",
            dataType: 'jsonp',
            url: url, //添加自己的接口链接
            data: {
                'appId': gV.configure.appId,
                'clientId': gV.configure.clientId,
                'sessionKey': gV.configure.sessionKey
            },
            timeOut: 10000,

            success: function (str) {
                fn && fn(str);
            },
            error: function (str) {
                errorFn && errorFn();
                alert('地图数据获取失败!' + str);
            }
        });

    }

    YFMap.prototype.askPointPos = function(startObj, endObj, bool, fn) {
        function isGoOn(obj) {
            if (typeof obj == 'object' && (!oMapUtils.isEmptyObject(startObj))) {
                if (typeof obj.regionId === 'string' &&
                    typeof obj.floorId === 'string' &&
                    typeof obj.svgX === 'number' &&
                    typeof obj.svgY === 'number') {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        for (var i = 0; i < 2; i++) {
            if (!isGoOn(arguments[i])) return;
        }

        if (typeof arguments[2] !== 'boolean') return;

        oMapUtils.askPosMore2(startObj, endObj, bool, fn);

        return this;
    };



    //一些方法挂载到_methods对象上, 对象字面量
    YFMap._methods = {
        //是否是数组  YFMap._methods.isArray(arr)
        isArray: function (arr) {
            if (Array.isArray) {
                return Array.isArray(arr);
            } else {
                return Object.prototype.toString.call(arg) === '[object Array]';
            }
        },

        //Dom跟着手机旋转  YFMap._methods.domRotate(obj)
        domRotate: function(obj) {
            if (obj) {
                window.addEventListener('deviceorientation', function (ev) {
                    var alpha = ev.alpha;
                    if (oMapUtils._checkClient() == 'iPhone') {
                        alpha -= 180;
                    }
                    gV.eomagnetigcAngle = alpha;
                    gV.deflectionAngle = gV.initAngle + gV.lastSvgAngle - gV.eomagnetigcAngle;
                    // gV.deflectionAngle = 0 + 0 + gV.eomagnetigcAngle;

                    if (gV.bPointIsRotate) {
                        var value = 'translate(-50%' + ',-50%)' + ' ' + 'rotate(' + gV.deflectionAngle + 'deg)';
                        var oPoint = document.querySelector('#point');
                        oPoint && oUtils.HandleNode.setStyle3(oPoint, 'transform', value);
                    }

                    /* value = 'translate(-50%' + ',-50%)' + ' ' + 'rotate(' + alpha + 'deg)';
                     oUtils.HandleNode.setStyle3(obj, 'transform', value);*/

                    // oUtils.HandleNode.setStyle3(obj, 'transform', 'rotate(' + alpha + 'deg)');    //暂时不用rotate属性
                    /* var cosVal = Math.cos(this.value * Math.PI / 180),
                     sinVal = Math.sin(this.value * Math.PI / 180);
                     var valTransform = 'matrix('+ cosVal.toFixed(6) +','+ sinVal.toFixed(6) +','+ (-1 * sinVal).toFixed(6) +','+ cosVal.toFixed(6) +',0,0)';
                     css3Transform(obj, valTransform);*/
                }, false);

                window.addEventListener("compassneedscalibration", function (event) {
                    alert('你的指南针需要校正！举着你的设备，面对着天空划横8字型。正反各三次。');
                    event.preventDefault();
                }, true);
            }

            function css3Transform(element, value) {
                var arrPriex = ["O", "Ms", "Moz", "Webkit", ""], length = arrPriex.length;
                for (var i=0; i < length; i+=1) {
                    element.style[arrPriex[i] + "Transform"] = value;
                }
            }
        }
    }

    YFMap._methods.domRotate(true);

    //抛出载入地图类
    module.exports = YFMap;

    //雷达波(单例模式)
    var wave = (function() {
        var instance;
        var bFlash = true;    //  true表示可以进行波动
        var bRotate = true;    // 动态点是否旋转

        function init() {
            var oWave = jsLib('#point').toDom(),
                oWaveObj = jsLib('#point'),
                oImg = jsLib('#point').find('img').toDom();

            function recovery() {
                var left = oWaveObj.css('left');
                var top = oWaveObj.css('top');

                oWave.className = '';
                oWave.className = 'repbox';
                oWave.style.left = left + 'px';
                oWave.style.top = top + 'px';
                oWave.style.opacity = 1;
                oWave.style.display = 'block';
            }

            return {
                setDomStyle: function(arr) {    //设置样式
                    var left = arr[0];
                    var top = arr[1];

                    oWave.className = '';
                    oWave.className = 'pbox';
                    oWave.style.left = left + 'px';
                    oWave.style.top = top + 'px';
                    oImg.className = '';
                    oImg.className = 'pcontent';

                },

                move: function() {    //雷达波
                    waveing();
                    function waveing() {
                        jsLib.move.linear([0, 100], 500, function(v){
                            bFlash = false;
                            var iSpeed = Math.ceil(v);
                            if (iSpeed % 2 == 0) {
                                oWave.style.width = iSpeed + 'px';
                                oWave.style.height = iSpeed + 'px';

                                var opacity = iSpeed/100;
                                var op = 1 - opacity;
                                oWave.style.opacity = op;
                            }
                        }, function() {
                            bFlash = true;
                            recovery();
                            // oWaveObj.show();
                        });
                    }
                },

                state: function() {
                    return bFlash;
                },

                domRotate: function(rotate) {    // 动态点旋转
                    if (rotate === 'rotate') {
                        gV.bPointIsRotate = true;
                    } else {
                        gV.bPointIsRotate = false;
                    }
                },

                recoveryStyle: function() {
                    recovery();
                }
            };
        };

        return {
            getInstance: function() {
                if (!instance) {
                    instance = init();
                }
                return instance;
            }
        };
    })();

});