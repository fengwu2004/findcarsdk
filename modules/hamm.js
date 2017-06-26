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
    // require('./hammer.min');
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
    gV.markSets = markSets;    //存个副本,我要在其他模块用
    var markSets = [];    //所有标记的集合
    var bMove = false; // 外部要在地图移动中写逻辑
    var moveFn = null; // 外部要在地图移动中的逻辑函数

    var bMoveAfter = false; // 外部要在地图结束写逻辑
    var moveFnAfter = null; // 外部要在地图结束的逻辑函数

    /*var hammTimer = 0;
    setInterval(function() {
        hammTimer = hammTimer + 100;
        if (hammTimer > 500 && Hamm.prototype.bHasUnitText() === false) {    // 显示文字
            Hamm.prototype.handleAfter();
        };
    }, 100);*/


    //自定义的Hamm类
    function Hamm() {
        this.scale = gV.scale;
        this.angle = gV.lastSvgAngle;
        this.lastPX = gV.lastPX;
        this.lastPY = gV.lastPY;    // 这四个是全局的

        this.startTouches = {}; //手势开始时手指的位置
        this.startScreenX, this.startScreenY, this.startScreenX2, this.startScreenY2;   //开始时两手指
        this.finger0, this.finger1; //移动过程中两手指
        this.fingerCount = 0;   //手指数量
        this.startPX;
        this.startPY;
        this.startFingerCenterSvgPoint; //开始手势时两手指中心点的地图坐标
        this.startScale;    //开始手势时缩放比例
        this.startAngle;    //开始手势时地图旋转角度
        this.domView = null;
        this.domBind = null;
        this.oG_txt = null;
        this.oLine = null;

        this.touchStart = this.touchStart.bind(this);
        this.touchMove = this.touchMove.bind(this);
        this.touchEnd = this.touchEnd.bind(this);
        this.showMap = this.showMap.bind(this);
        this._touch = this._touch.bind(this);

        function noop() {};

        this.startCallBack = this.handleBefore || noop;
        this.moveCallBack = this.handleDo || noop;
        this.endCallBack = this.handleAfter || noop;
    };

    Hamm.prototype = {    
        
        constructor: Hamm,

        init: function(dom) {
            this.domView = dom;

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
            this.scale = gV.scale = gV.ratio = Math.min(gV.widthLevel, gV.heightLevel);

            var px = gV.box_w / 2 - (gV.vb_w / 2 * gV.scale); //需要偏移的量， 屏幕坐标系即svg缩放后的，屏幕中心点坐标 - svg中心点变换后的坐标
            var py = gV.box_h / 2 - (gV.vb_h / 2 * gV.scale);

            gV.lastPX = this.lastPX = px;
            gV.lastPY = this.lastPY = py;
            this.showMap(gV.scale, px, py);
        },

        bindTouch: function (dom) {
            this.domBind = dom;
            this.domBind.addEventListener("touchstart", this.touchStart, false);
            this.domBind.addEventListener("touchmove", this.touchMove, false);
            this.domBind.addEventListener("touchend", this.touchEnd, false);
            return this;
        },

        destroy: function() {
            this.domObj.removeEventListener("touchstart", this.touchStart, false);
            this.domObj.removeEventListener("touchmove", this.touchMove, false);
            this.domObj.removeEventListener("touchend", this.touchEnd, false);
        },

        touchStart: function(ev) {
            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;
            // console.log('touchStart: ' + ev.touches.length);
            this._touch(ev);

            if (this.fingerCount == 1) {
                // console.log('handleBefore');
                // this.handleBefore();
                // hammTimer = 0;
            };

        },

        touchMove: function(ev) {
            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;

            var pFingerCenterPoint;
            var dx, dy;

            if (ev.touches.length != this.fingerCount) {
                this._touch(ev);
                if (ev.touches.length == 0) {
                    console.log('这种情况');
                };
            };

            if(this.fingerCount == 1){
                this.finger0 = ev.touches["0"];
                dx = this.finger0.screenX - this.startScreenX;
                dy = this.finger0.screenY - this.startScreenY;
                pFingerCenterPoint = this._changeToClientPos(this.startFingerCenterSvgPoint[0], this.startFingerCenterSvgPoint[1]);
            };

            if(this.fingerCount == 2){
                this.finger0 = ev.touches["0"];
                this.finger1 = ev.touches["1"];

                var dscale = this._getDistanceOfTwoPoint(this.finger0.screenX, this.finger0.screenY, this.finger1.screenX, this.finger1.screenY) / this._getDistanceOfTwoPoint(this.startScreenX, this.startScreenY, this.startScreenX2, this.startScreenY2);
                gV.scale = this.scale = this.startScale * dscale;

                // 地图最大最小
                if (this.scale >= gV.ratio * 5) {
                    gV.scale = gV.ratio * 5;
                }
                if (this.scale <= gV.ratio) {
                    gV.scale = gV.ratio * .8;
                }

                var scaleRule = 100 * gV.scale;
                oMapUtils.calculationRule(scaleRule);

                var dangle = this._getAngleOfTwoVector(this.startScreenX2 - this.startScreenX, this.startScreenY2 - this.startScreenY, this.finger1.screenX - this.finger0.screenX, this.finger1.screenY - this.finger0.screenY);
                gV.lastSvgAngle = this.angle = this.startAngle + dangle;

                pFingerCenterPoint = this._changeToClientPos(this.startFingerCenterSvgPoint[0], this.startFingerCenterSvgPoint[1]);
                dx = (this.finger0.screenX + this.finger1.screenX)/2 - pFingerCenterPoint[0];
                dy = (this.finger0.screenY + this.finger1.screenY)/2 - pFingerCenterPoint[1];
            };

            if (this.fingerCount > 2) return;

            gV.lastPX = this.lastPX = this.startPX + dx;
            gV.lastPY = this.lastPY = this.startPY + dy;

            // console.log('handleDo');
            if (this.bHasUnitText()) {
                this.handleBefore();
            };
            this.handleDo();
            // this.drawLimit(gV.lastPX, gV.lastPY);

            requestAnimationFrame(this.showMap);
        },

        touchEnd: function(ev) {
            ev.stopPropagation ? ev.stopPropagation() : ev.cancelBubble = true;

            // console.log('touchEnd');
            //log("touchEnd," + JSON.stringify(ev));
            var count = this.fingerCount;

            this._touch(ev);

            // this.handleAfter();

            if(this.fingerCount == 0 && count > 0){
                //手指完全离开屏幕，做其他事情，显示unit、导航线等
                // console.log('handleAfter');
                this.handleAfter();
            };

            if(this.fingerCount == 1 && count > 0){
                //手指完全离开屏幕，做其他事情，显示unit、导航线等
                // console.log('handleAfter');
                this.handleAfter();
            };
            // hammTimer = 0;
        },

        showMap: function(scale, px, py){
            // log("showMap," + this.lastPX + "," + this.lastPY + ";" + this.scale + ";" + this.angle);

            if (typeof scale != 'undefined' && typeof px != 'undefined' && typeof py != 'undefined') {
                this.lastPX = gV.lastPX = px;
                this.lastPY = gV.lastPY = py;
                this.scale = gV.scale = scale;
            };

            var a = Math.cos(this.angle * Math.PI / 180) * this.scale,
                b = Math.sin(this.angle * Math.PI / 180) * this.scale,
                c = -b,
                d = a,
                e = this.lastPX,
                f = this.lastPY,
                transform;

            transform = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')';

            // jsLib(this.domView).setStyle3("transform", transform);
            this.domView.setAttribute('transform', transform)
        },

        _touch: function(ev) {
            ev.preventDefault();

            this.startTouches = ev.touches;
            this.fingerCount = this.startTouches.length;

            if (this.startTouches["0"]) {
                this.startScreenX = this.startTouches["0"].screenX;
                this.startScreenY = this.startTouches["0"].screenY;
            };
            if (this.startTouches["1"]) {
                this.startScreenX2 = this.startTouches["1"].screenX;
                this.startScreenY2 = this.startTouches["1"].screenY;
            };

            this.startPX = this.lastPX;
            this.startPY = this.lastPY;
            this.startScale = this.scale ? this.scale : 1;
            this.startAngle = this.angle ? this.angle : 0;

            if(this.fingerCount == 1){
                this.startFingerCenterSvgPoint = this._changeToSvgPos(this.startScreenX, this.startScreenY);
            };
            if(this.fingerCount == 2){
                this.startFingerCenterSvgPoint = this._changeToSvgPos((this.startScreenX + this.startScreenX2)/2, (this.startScreenY + this.startScreenY2)/2);
            };
        },

        _changeToClientPos: function (sx, sy) {    //svg坐标转换为屏幕坐标
            /*var iClientX = Math.cos(this.angle * Math.PI / 180) * sx * this.scale - Math.sin(this.angle * Math.PI / 180) * sy * this.scale + this.startPX; //屏幕坐标中的x,y
            var iClientY = Math.cos(this.angle * Math.PI / 180) * sy * this.scale + Math.sin(this.angle * Math.PI / 180) * sx * this.scale + this.startPY;*/

            var iClientX = Math.cos(this.angle * Math.PI / 180) * sx * gV.scale - Math.sin(this.angle * Math.PI / 180) * sy * gV.scale + this.startPX; //屏幕坐标中的x,y
            var iClientY = Math.cos(this.angle * Math.PI / 180) * sy * gV.scale + Math.sin(this.angle * Math.PI / 180) * sx * gV.scale + this.startPY;
            return [iClientX, iClientY];
        },

        _changeToSvgPos: function (iClientX, iClientY) {    //屏幕坐标转换为svg坐标
            var iSvgX = ((iClientX - this.startPX) * Math.cos(this.angle * Math.PI / 180) + (iClientY - this.startPY) * Math.sin(this.angle * Math.PI / 180)) / this.scale;
            var iSvgY = ((iClientY - this.startPY) * Math.cos(this.angle * Math.PI / 180) - (iClientX - this.startPX) * Math.sin(this.angle * Math.PI / 180)) / this.scale;
            return [iSvgX, iSvgY];
        },

        _getAngleOfTwoVector: function(v1x, v1y, v2x, v2y){
            var angle1 = Math.atan2(v1y, v1x)*180/Math.PI;
            var angle2 = Math.atan2(v2y, v2x)*180/Math.PI;

            return angle2 - angle1;
        },

        _getDistanceOfTwoPoint: function(x1, y1, x2, y2){
            return Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
        },

        handleBefore: function () {

            if (this.oG_txt && this.oLine) {
                this.oG_txt.innerHTML = '';
                this.oLine.innerHTML = '';

            } else {
                this.oG_txt = document.querySelector('#g_txt');
                this.oLine = document.querySelector('#line');

                this.oG_txt.innerHTML = '';
                this.oLine.innerHTML = '';
            };

        },

        bHasUnitText: function() {

            if (this.oG_txt) {

                return bool(this);
            } else {
                this.oG_txt = document.querySelector('#g_txt');
                return bool(this);
            };

            function bool(self) {
                if (self.oG_txt.innerHTML == '') {
                    return false;
                } else {
                    return true;
                };
            };
        },

        handleDo: function () {
            // this.drawLimit(gV.px, gV.py);
            this.drawLimit(gV.lastPX, gV.lastPY);

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

            // alert(px + ', ' + py);

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
                this.showMap(gV.scale, gV.lastPX, gV.lastPY);
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
                    _self.showMap(gV.scale, gV.lastPX, gV.lastPY);

                }());
            }

            function compareBig(value1, value2) {    //从大到小
                return value2 - value1;
            }

            function compareSmall(value1, value2) {    //从小到大
                return value1- value2;
            }
        }
    };


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



    module.exports = new Hamm();


});