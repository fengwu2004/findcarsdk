/**
 * Created by Sorrow.X on 2016/9/21.
 */
/**
 *  hamm.js  用来控制地图的旋转缩放和拖动
 *
 */

define(function (require, exports, module) {

    //载入地图工具
    var Maputils = require('./maputils');
    var oMapUtils = new Maputils();
    //载入手势
    require('./hammer.min');
    //载入全局变量
    var gV = require('./globalvalue');
    //载入movedo
    var MoveDo = require('./movedo.js');
    var moveObj = new MoveDo();
    //载入unit
    var ObjectUnits = require('./units');
    var Unit = ObjectUnits.Unit;
    var UnitData = ObjectUnits.UnitsData;
    var unitObj = new Unit();
    //载入工具
    var Utils = require('./utils');
    var oUtils = new Utils();


    //定义个hamm模块中的全局变量
    markSets = [];    //所有标记的集合
    gV.markSets = markSets;    //存个副本,我要在其他模块用
    bMove = false; // 外部要在地图移动中写逻辑
    moveFn = null; // 外部要在地图移动中的逻辑函数

    bMoveAfter = false; // 外部要在地图结束写逻辑
    moveFnAfter = null; // 外部要在地图结束的逻辑函数


    //自定义的Hamm类
    function Hamm() {
    }

    Hamm.prototype = {
        constructor: Hamm,

        init: function () {    //原 calcLevel函数

            var oSvgNode = document.querySelector('#svgBox').children[0];
            var sViewBox = oSvgNode.getAttribute("viewBox");
            gV.globalViewBow = sViewBox;

            gV.box_w = window.screen.width;
            gV.box_h = window.screen.height;
            var view = sViewBox.split(" ");

            oSvgNode.removeAttribute("viewBox");
            oSvgNode.setAttribute("width", "100%");
            oSvgNode.setAttribute("height", "100%");

            gV.x = parseFloat(view[0]); //svg原始 左上角x坐标，一般为0
            gV.y = parseFloat(view[1]); //svg原始 左上角y坐标，一般为0
            gV.width = gV.vb_w = parseFloat(view[2]) - gV.x; //svg原始 宽度
            gV.height = gV.vb_h = parseFloat(view[3]) - gV.y; //svg原始 高度
            gV.widthLevel = gV.box_w / gV.width;
            gV.heightLevel = gV.box_h / gV.height;
            gV.scale = gV.ratio = Math.min(gV.widthLevel, gV.heightLevel);

            var px = gV.box_w / 2 - (gV.vb_w / 2 * gV.scale); //需要偏移的量， 屏幕坐标系即svg缩放后的，屏幕中心点坐标 - svg中心点变换后的坐标
            var py = gV.box_h / 2 - (gV.vb_h / 2 * gV.scale);

            gV.lastPX = px;
            gV.lastPY = py;
            this.showMap(gV.scale, px, py);
        },

        showMap: function (scale, px, py) {    //原 map_show 函数
            gV.lastPX = px;
            gV.lastPY = py;
            //转换根据:
            //x1 = ax + cy + e;
            //y1 = bx + dy + f;
            var a = Math.cos(gV.lastSvgAngle * Math.PI / 180) * scale;
            var b = Math.sin(gV.lastSvgAngle * Math.PI / 180) * scale;
            // debug.log('eeeee:'+gV.lastSvgAngle);
            if (gV.lastSvgAngle != 0) {
                // alert('eeeee:'+gV.lastSvgAngle);
            }
            var c = -b;
            var d = a;
            var e = gV.lastPX;
            var f = gV.lastPY; //

            var transform = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')';
            var oViewportNode = document.querySelector('#viewport');
            oViewportNode.setAttribute("transform", transform);
        },

        manageMultitouch: function (ev, hammertime) {
            var hammertime = hammertime || null;
            var px, py;
            // var oPointImg = document.querySelector('#pointImg');
            if (!Hamm.prototype.ifEnableEvent(ev)) {
                return;
            }
            switch (ev.type) {
                case 'panstart':
                    gV.bStopBackstage = false;
                    gV.dragStartPX = gV.lastPX;
                    gV.dragStartPY = gV.lastPY;
                    // moveObj.handleBefore();
                    this.handleBefore();
                    break;
                case 'pan':

                    px = gV.lastPX = ev.deltaX + gV.dragStartPX;
                    py = gV.lastPY = ev.deltaY + gV.dragStartPY;
                    // this.showMap(gV.scale, px, py);
                    this.drawLimit(px, py);
                    // moveObj.handleDo();
                    this.handleDo();
                    break;
                case 'panend':
                    // moveObj.handleAfter();
                    this.handleAfter();
                    gV.bStopBackstage = true;
                    break;
                case 'rotatestart':
                    gV.bStopBackstage = false;
                    gV.rotateStartSvgAngle = gV.lastSvgAngle;
                    gV.rotateStartRotation = ev.rotation;

                    gV.rotateStartSvgScale = gV.scale; //开始旋转时的缩放比例
                    gV.rotateStartPX = gV.lastPX; //开始旋转时的偏移量，屏幕坐标系及svg变换后的坐标
                    gV.rotateStartPY = gV.lastPY;
                    gV.rotateStartCenterX = ev.center.x;
                    gV.rotateStartCenterY = ev.center.y;

                    //开始时手指连线中点对应的svg图点坐标
                    gV.rotateStartCenterSvgX = (Math.cos(-gV.rotateStartSvgAngle * Math.PI / 180) * (gV.rotateStartCenterX - gV.rotateStartPX) - Math.sin(-gV.rotateStartSvgAngle * Math.PI / 180) * (gV.rotateStartCenterY - gV.rotateStartPY)) / gV.rotateStartSvgScale;
                    gV.rotateStartCenterSvgY = (Math.cos(-gV.rotateStartSvgAngle * Math.PI / 180) * (gV.rotateStartCenterY - gV.rotateStartPY) + Math.sin(-gV.rotateStartSvgAngle * Math.PI / 180) * (gV.rotateStartCenterX - gV.rotateStartPX)) / gV.rotateStartSvgScale;
                    // moveObj.handleBefore();
                    this.handleBefore();
                    break;
                case 'rotate':
                    //break;
                    var angle = Hamm.prototype.calcRotationChange(ev.rotation, gV.rotateStartRotation);

                    gV.lastSvgAngle = gV.rotateStartSvgAngle - angle;

                    gV.scale = gV.rotateStartSvgScale * ev.scale;

                    if (gV.scale >= gV.ratio * 5) {
                        gV.scale = gV.ratio * 5;
                    }
                    if (gV.scale <= gV.ratio) {
                        gV.scale = gV.ratio * .8;
                    }

                    // alert(gV.scale);

                    gV.lastPX = px = ev.center.x - (Math.cos(gV.lastSvgAngle * Math.PI / 180) * gV.rotateStartCenterSvgX - Math.sin(gV.lastSvgAngle * Math.PI / 180) * gV.rotateStartCenterSvgY) * gV.scale;
                    gV.lastPY = py = ev.center.y - (Math.cos(gV.lastSvgAngle * Math.PI / 180) * gV.rotateStartCenterSvgY + Math.sin(gV.lastSvgAngle * Math.PI / 180) * gV.rotateStartCenterSvgX) * gV.scale;

                    this.showMap(gV.scale, px, py);
                    // moveObj.handleDo();
                    this.handleDo();
                    break;
                case 'rotateend':
                    // moveObj.handleAfter();
                    this.handleAfter();
                    gV.bStopBackstage = true;
                    break;
            }
        },

        panend: function () {
            // moveObj.handleAfter();
            this.handleAfter();
            gV.bStopBackstage = true;
        },

        pinchend: function () {
            // moveObj.handleAfter();
            this.handleAfter();
            gV.bStopBackstage = true;
        },

        rotateend: function () {
            // moveObj.handleAfter();
            this.handleAfter();
            gV.bStopBackstage = true;
        },

        bindHammer: function () {
            var oSvgFrameNode = document.querySelector('#svgFrame');
            var hammertime = Hammer(oSvgFrameNode, {
                domEvents: true,
                transform_always_block: true,
                transform_min_scale: 1,
                drag_block_horizontal: true,
                drag_block_vertical: true,
                drag_min_distance: 0,
            });

            hammertime.get('rotate').set({
                enable: true
            });
            hammertime.get('pan').set({
                direction: Hammer.DIRECTION_ALL
            });

            hammertime.on('panstart pan panend pinchstart pinch pinchend rotatestart rotate rotateend', function (ev) {
                ev.preventDefault(); //取消事件的默认动作（重要）
                Hamm.prototype.manageMultitouch(ev, hammertime);
                // return false;
            });
        },

        calcRotationChange: function (rotation1, rotation2) {
            var angle = rotation2 - rotation1;
            if (angle > 180) {
                angle = angle - 360;
            } else if (angle < -180) {
                angle = angle + 360;
            }
            return angle;
        },

        ifEnableEvent: function (ev) {
            var time = new Date();
            var timet = time.getTime();

            if(ev.type == "panstart" || ev.type == "pinchstart" || ev.type == "rotatestart"){
                if(ev.type == "panstart"){
                    if((gV.lastEventType == "pinch" || gV.lastEventType == "rotate")
                        && time.getTime() - gV.lastEventTimet < gV.MinEventStartPeriod){
                        // addEventStr(ev.type + "," + JSON.stringify(time) + ", 事件太快，取消事件");
                        return false;
                    }
                    gV.curEventType = "pan";
                    gV.lastPanTimet = timet;
                    gV.avgPanDis = 0;
                    gV.panCount = 0;
                    gV.lastPanDeltaX = ev.deltaX;
                    gV.lastPanDeltaY = ev.deltaY;
                }else if(ev.type == "pinchstart"){
                    gV.curEventType = "pinch";
                    gV.lastPinchTimet = timet;
                    gV.avgPinchScale = 0;
                    gV.pinchCount = 0;
                    gV.lastPinchScale = ev.scale;
                }else if(ev.type == "rotatestart"){
                    gV.curEventType = "rotate";
                    gV.lastRotateTimet = timet;
                    gV.avgRotateAngle = 0;
                    gV.avgRotateScale = 0;
                    gV.rotateScaleCount = 0;
                    gV.rotateAngleCount = 0;
                    gV.lastRotateAngle = ev.rotation;
                    gV.lastRotateScale = ev.scale;
                }
                gV.lastEventTimet = timet;
            }else if(ev.type == "pan"){
                if(gV.curEventType != "pan"){
                    return false;
                }
                var dx = ev.deltaX - gV.lastPanDeltaX;
                var dy = ev.deltaY - gV.lastPanDeltaY;
                var dis = Math.sqrt(dx*dx + dy*dy);
                if(gV.avgPanDis > 0 && gV.panCount > 10){
                    if(dis > gV.avgPanDis*10){
                        addEventStr("pan," + JSON.stringify(time) + "," + ev.deltaX + "," + ev.deltaY + ", 突变，取消事件");
                        gV.curEventType = "";
                        gV.lastEventTimet = timet;
                        gV.lastPanTimet = 0;
                        gV.avgPanDis = 0;
                        gV.panCount = 0;
                        gV.lastPanDeltaX = 0;
                        gV.lastPanDeltaY = 0;
                        Hamm.prototype.panend();
                        gV.lastEventType = "pan";
                        return false;
                    }
                }
                gV.avgPanDis = Hamm.prototype.calcAvg(gV.avgPanDis, gV.panCount, dis);	// (gV.avgPanDis*gV.panCount + dis)/(gV.panCount+1);
                if(gV.panCount < 10){
                    gV.panCount ++;
                }
                gV.lastPanDeltaX = ev.deltaX;
                gV.lastPanDeltaY = ev.deltaY;
                gV.lastEventTimet = timet;
                gV.lastPanTimet = timet;
            }else if(ev.type == "pinch"){
                if(gV.curEventType != "pinch"){
                    return false;
                }
                var dscale = Math.abs(ev.scale - gV.lastPinchScale);
                // addEventStr(dscale);
                if(gV.avgPinchScale > 0 && gV.pinchCount > 5){
                    if(dscale > gV.avgPinchScale*10){
                        // addEventStr("pinch," + JSON.stringify(time) + "," + ev.scale + ", 突变，取消事件");
                        gV.curEventType = "";
                        gV.lastEventTimet = timet;
                        gV.lastPinchTimet = 0;
                        gV.avgPinchScale = 0;
                        gV.pinchCount = 0;
                        gV.lastPinchScale = 0;
                        Hamm.prototype.pinchend();
                        gV.lastEventType = "pinch";
                        return false;
                    }
                }
                gV.avgPinchScale = (gV.avgPinchScale*gV.pinchCount + dscale)/(gV.pinchCount+1);
                gV.pinchCount ++;
                gV.lastPinchScale = ev.scale;
                gV.lastEventTimet = timet;
                gV.lastPinchTimet = timet;
            }else if(ev.type == "rotate"){
                if(gV.curEventType != "rotate"){
                    return false;
                }
                var dscale = Math.abs(ev.scale - gV.lastRotateScale);
                var dangle = Math.abs(Hamm.prototype.calcRotationChange(gV.lastRotateAngle, ev.rotation));
                // addEventStr("rotateScaleDelta:" + dscale);
                // addEventStr("gV.avgRotateScale:" + gV.avgRotateScale);
                // addEventStr("dangle:" + dangle);
                // addEventStr("gV.avgRotateAngle:" + gV.avgRotateAngle);
                if(dscale > 0 && dscale > gV.avgRotateScale*10 && ev.scale == 1
                    || dangle > 30 && dangle > gV.avgRotateAngle*10 && ev.rotation == 0
                    || dangle > 90 && dangle > gV.avgRotateAngle*10){
                    // addEventStr("rotate," + JSON.stringify(time) + "," + ev.scale + ", 突变，取消事件");
                    gV.curEventType = "";
                    gV.lastEventTimet = timet;
                    gV.lastRotateTimet = 0;
                    gV.avgRotateScale = 0;
                    gV.avgRotateAngle = 0;
                    gV.rotateScaleCount = 0;
                    gV.rotateAngleCount = 0;
                    gV.lastRotateScale = 0;
                    gV.lastRotateAngle
                    Hamm.prototype.rotateend();
                    gV.lastEventType = "rotate";
                    return false;
                }

                if(dscale > 0){
                    gV.avgRotateScale = Hamm.prototype.calcAvg(gV.avgRotateScale, gV.rotateScaleCount, dscale);
                    if(gV.rotateScaleCount < 10){
                        gV.rotateScaleCount ++;
                    }
                }
                if(dangle > 0){
                    gV.avgRotateAngle = Hamm.prototype.calcAvg(gV.avgRotateAngle, gV.rotateAngleCount, dangle);
                    if(gV.rotateAngleCount < 10){
                        gV.rotateAngleCount ++;
                    }
                }
                gV.lastRotateScale = ev.scale;
                gV.lastRotateAngle = ev.rotation;
                gV.lastEventTimet = timet;
                gV.lastRotateTimet = timet;
            }else if(ev.type == "panend"){
                gV.curEventType = "";
                gV.lastEventTimet = timet;
                gV.lastPanTimet = 0;
                gV.avgPanDis = 0;
                gV.panCount = 0;
                gV.lastPanDeltaX = 0;
                gV.lastPanDeltaY = 0;
                gV.lastEventType = "pan";
            }else if(ev.type == "pinchend"){
                gV.curEventType = "";
                gV.lastEventTimet = timet;
                gV.lastPinchTimet = 0;
                gV.avgPinchScale = 0;
                gV.pinchCount = 0;
                gV.lastPinchScale = 1;
                gV.lastEventType = "pinch";
            }else if(ev.type == "rotateend"){
                gV.curEventType = "";
                gV.lastEventTimet = timet;
                gV.lastRotateTimet = 0
                gV.avgRotateScale = 0;
                gV.avgRotateAngle = 0;
                gV.rotateScaleCount = 0;
                gV.rotateAngleCount = 0;
                gV.lastRotateScale = 1;
                gV.lastRotateAngle = 0;
                gV.lastEventType = "rotate";
            }

            return true;
        },

        calcAvg: function (lastAvg, count, delta) {
            if (count == 0) {
                return delta;
            } else {
                return lastAvg * count / (count + 1) * 0.8 + delta / (count + 1) * 1.2;
            }
        },

        handleBefore: function () {
            //清空unit数据
            var oG_txt = document.querySelector('#g_txt');
            oG_txt.innerHTML = '';

            //清空线
            var oLine = document.querySelector('#line');
            if (oLine) oLine.innerHTML = '';

        },

        handleDo: function () {
            // this.drawLimit(gV.px, gV.py);

            markSets.forEach(function (item, index) {

                if (item.floorId === gV.floorId) {    //点再哪个楼层就在哪个楼层显示
                    oMapUtils.svgShowPoint(item.dom, item.aSvgPos, item.aOffsetPos);
                } else {
                    item.dom.style.display = 'none';
                }
            });

            //指南针
            if (gV.compass.isCompass) {
                this.compass();
            };

            if (bMove) {
                moveFn();    //外部的逻辑
            };

        },

        outInterfaceHandleDo: function (fn) {
            bMove = true;
            // fn && fn();
            moveFn = fn;
        },

        outInterfaceHandleAfter: function (fn) {
            bMoveAfter = true;
            // fn && fn();
            moveFnAfter = fn;
        },

        handleAfter: function () {
            //拖动或者旋转结束 显示unit
            unitObj.textTransformation(UnitData.allUnits);


            // 没有蓝牙信号时,用上一次存下来的点线，重新划线
            if (gV.bClearLine === false) {
                var aClientPos = oMapUtils.changeToAllClientPos(gV.aLineSvgPos);
                oMapUtils.draw('line', aClientPos, false);
            };

            //重新画线(点击楼层切换时，如果楼层进行了多楼层导航, 就会重新画线)
            // oMapUtils.isAgainDraw(gV.floorId);    // 12-05 被我暂时关闭
            // 因为动态划线，本身自己每秒划线一次,所以不必拖动完再次划线
            if (gV.bDynamicNag === false) {
                oMapUtils.isAgainDraw(gV.floorId);
            };

            if (bMoveAfter) {
                moveFnAfter();    //外部的逻辑
            };

        },

        addMark: function (obj) {
            var flag = false;    // 为true的话表示要添加的标记和已添加的标记都不相等, 则可以添加
            if (markSets.length == 0) {
                markSets.push(obj);
            } else {
                for (var i = 0, len = markSets.length; i < len; i++) {
                    var item = markSets[i]
                    if (item.id !== obj.id) {
                        flag = true;
                    } else {
                        flag = false;
                        markSets[i].aSvgPos = obj.aSvgPos;    //存在的话换数据
                        markSets[i].aOffsetPos = obj.aOffsetPos;
                        markSets[i].floorId = obj.floorId;
                        return;
                    }
                }
                if (flag) markSets.push(obj);
            }

            // console.log(gV.markSets);
        },

        removeMark: function (id) {
            var _this = this;
            markSets.forEach(function (item, index) {
                if (item.id === id) {
                    markSets = _this.del(markSets, index);
                    gV.markSets = markSets;
                    // console.log(gV.markSets);
                    return;
                }
            });
        },

        removeMarkByType: function (type) {
            var _this = this;
            var flag = -1;
            markSets.forEach(function (item, index) {
                if (item.type === type) {
                    var dom = document.querySelector('#' + item.id);
                    dom.style.display = 'none';
                    dom.style.position = 'absolute';
                    dom.style.zIndex = '10';
                    dom.style.left = 0 + 'px';
                    dom.style.top = 0 + 'px';
                    flag++;

                    markSets = _this.del(markSets, index - flag);
                    gV.markSets = markSets;
                    // console.log(gV.markSets);
                }
            });
        },

        del: function (arr, n) {
            if (n < 0) return arr;
            return arr.slice(0, n).concat(arr.slice(n + 1, arr.length));
        },

        compass: function() {
            var oPoint = document.querySelector('#point');

            if (gV.initAngle) {
                var angle = gV.initAngle + gV.lastSvgAngle + 45;
                jsLib('#'+gV.compass.id).setStyle3('transform', 'rotate('+ angle +'deg)');

                var value = 'translate(-50%' + ',-50%)' + ' ' + 'rotate(' + gV.deflectionAngle + 'deg)';
                oPoint && jsLib('#point').setStyle3('transform', value);
            } else {
                var url = 'http://wx.indoorun.com/wx/getRegionInfo';
                jsLib.ajax({
                    type: "get",
                    dataType: 'jsonp',
                    url: url, //添加自己的接口链接
                    data: {
                        'regionId': gV.regionId,
                        'appId': gV.configure.appId,
                        'clientId': gV.configure.clientId,
                        'sessionKey': gV.configure.sessionKey
                    },
                    timeOut: 10000,
                    before: function () {
                    },
                    success: function (str) {
                        var data = str;
                        if (data != null) {
                            if (data.code == "success") {
                                var angle = gV.initAngle + gV.lastSvgAngle + 45;
                                jsLib('#'+gV.compass.id).setStyle3('transform', 'rotate('+ angle +'deg)');

                                gV.initAngle = data.data.northDeflectionAngle;
                                gV.deflectionAngle = gV.initAngle + gV.lastSvgAngle + gV.eomagnetigcAngle;
                                var value = 'translate(-50%' + ',-50%)' + ' ' + 'rotate(' + gV.deflectionAngle + 'deg)';
                                oPoint && jsLib('#point').setStyle3('transform', value);
                            }
                        }
                    }
                });
            }


        },

        /**
         * 限制拖拽和缩小范围(通用)
         * @method drawLimit(px, py);
         * @use 把这个方法放到 pan,rotate方法下
           但是rotate方法下需要加如下代码
           if (scale <= ratio) {
        	  scale = ratio;
           }
         */
        drawLimit: function(px, py) {
            var _self = this;

            var aSvgLeftPoint = [0, 0],
                aSvgRightPoint = [gV.width, 0],
                aSvgLeftunderPoint = [0, gV.height],    //左下
                aSvgRightunderPoint = [gV.width, gV.height];    //右下    都是svg坐标

            var aClientLeftPoint = oMapUtils.changeToClientPos(aSvgLeftPoint[0], aSvgLeftPoint[1]),
                aClientRightPoint = oMapUtils.changeToClientPos(aSvgRightPoint[0], aSvgRightPoint[1]),
                aClientLeftunderPoint = oMapUtils.changeToClientPos(aSvgLeftunderPoint[0], aSvgLeftunderPoint[1]),   //左下
                aClientRightunderPoint = oMapUtils.changeToClientPos(aSvgRightunderPoint[0], aSvgRightunderPoint[1]);  //右下   都是屏幕端的坐标

            var aX = [aClientLeftPoint[0], aClientRightPoint[0], aClientLeftunderPoint[0], aClientRightunderPoint[0]],
                aY = [aClientLeftPoint[1], aClientRightPoint[1], aClientLeftunderPoint[1], aClientRightunderPoint[1]];

            var pointCenter = {x: gV.box_w/2, y: gV.box_h/2};
            var polygon = [
                {x:aClientLeftPoint[0], y:aClientLeftPoint[1]},
                {x:aClientRightPoint[0], y:aClientRightPoint[1]},
                {x:aClientRightunderPoint[0], y:aClientRightunderPoint[1]},
                {x:aClientLeftunderPoint[0], y:aClientLeftunderPoint[1]},
                {x:aClientLeftPoint[0], y:aClientLeftPoint[1]}
            ];
            this.drawLimit.bOK = pointInPolygon(pointCenter, polygon);

            if (this.drawLimit.bOK) {
                this.showMap(gV.scale, px, py);
            } else {
                this.drawLimit.bOK = false;
                //最近交点
                (function _nearestPoint () {

                    var iClientCenterX = gV.box_w/2,
                        iClientCenterY = gV.box_h/2;

                    var aLeftLine = new pointObj().pointToSegmentNearest(aClientLeftPoint[0], aClientLeftPoint[1], aClientLeftunderPoint[0], aClientLeftunderPoint[1], iClientCenterX, iClientCenterY);
                    var aButtomLine = new pointObj().pointToSegmentNearest(aClientLeftunderPoint[0], aClientLeftunderPoint[1], aClientRightunderPoint[0], aClientRightunderPoint[1], iClientCenterX, iClientCenterY);
                    var aRightLine = new pointObj().pointToSegmentNearest(aClientRightPoint[0], aClientRightPoint[1], aClientRightunderPoint[0], aClientRightunderPoint[1], iClientCenterX, iClientCenterY);
                    var aTopLine = new pointObj().pointToSegmentNearest(aClientLeftPoint[0], aClientLeftPoint[1], aClientRightPoint[0], aClientRightPoint[1], iClientCenterX, iClientCenterY);

                    var aDis = [aLeftLine[0], aButtomLine[0], aRightLine[0], aTopLine[0]];
                    var aDisAll = [aLeftLine, aButtomLine, aRightLine, aTopLine];
                    var iMinDis = aDis.sort(compareSmall)[0];    //最短距离
                    var aPos = [];//存最短的2点线段的
                    var aIntersection = []; // 交点

                    for (var i = 0; i < aDisAll.length; i++) {
                        if (aDisAll[i][0] == iMinDis) {
                            aPos = aDisAll[i][1];
                        }
                    }

                    aIntersection = new pointObj().getVerticalPointToLineSeg(iClientCenterX, iClientCenterY, aPos[0], aPos[1], aPos[2], aPos[3]);

                    px = gV.lastPX = gV.lastPX + (gV.box_w/2 - aIntersection[0]);
                    py = gV.lastPY = gV.lastPY + (gV.box_h/2 - aIntersection[1]);
                    _self.showMap(gV.scale, px, py);

                }());
            }

            function compareBig(value1, value2) {    //从大到小
                return value2 - value1;
            }

            function compareSmall(value1, value2) {    //从小到大
                return value1- value2;
            }
        }

    }


    var pointObj = function() {};
    pointObj.prototype = {
        constructor: pointObj,

        pointToSegmentNearest: function(x1, y1, x2, y2, x, y){      //点到线段的最近距离  new pointObj().pointToSegmentNearest
            var p = this.getVerticalPointToLine(x, y, x1, y1, x2, y2);
            var iDistance;
            if((x1 >= p[0] && p[0] >= x2 || x1 <= p[0] && p[0] <= x2)
                && (y1 >= p[1] && p[1] >= y2 || y1 <= p[1] && p[1] <= y2)){	//在线段上
                var len = Math.sqrt((x-p[0])*(x-p[0]) + (y-p[1])*(y-p[1]));
                iDistance = len;
                return [iDistance, [x1, y1, x2, y2]];
            }else{	//垂直点不在线段上
                var len1 = Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
                var len2 = Math.sqrt((x-x2)*(x-x2) + (y-y2)*(y-y2));
                iDistance = len1<len2?len1:len2;
                return [iDistance, [x1, y1, x2, y2]];
                // return len1<len2?len1:len2;
            }
        },

        getVerticalPointToLine: function(x, y, x1, y1, x2, y2){    //点到线段的交点    new pointObj().getVerticalPointToLine
            if(x1 == x2 && y1 == y2){
                return [x1, y1];
            }
            if(x1 == x2){
                return [x1, y];
            }
            if(y1 == y2){
                return [x, y1];
            }

            var k0 = (y1-y2)/(x1-x2);
            var c0 = k0*x1 - y1;
            var kp = -1/k0;
            var cp = kp*x - y;

            var xt = (cp-c0)/(kp-k0);
            var yt = kp*xt - cp;
            return [xt, yt];
        },

        getVerticalPointToLineSeg: function(x, y, x1, y1, x2, y2){
            var p = this.getVerticalPointToLine(x, y, x1, y1, x2, y2);
            if((x1 >= p[0] && p[0] >= x2 || x1 <= p[0] && p[0] <= x2)
                && (y1 >= p[1] && p[1] >= y2 || y1 <= p[1] && p[1] <= y2)){	//在线段上
                return p;
            }else{	//垂直点不在线段上
                var len1 = Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1));
                var len2 = Math.sqrt((x-x2)*(x-x2) + (y-y2)*(y-y2));
                return len1<len2?[x1, y1]:[x2, y2];
            }
        }

    };

    //判断点在多边形内
    function pointInPolygon(curPoint, points) {
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
    };



    module.exports = Hamm;


});