
/**
 * Created by Sorrow.X on 2016/9/20.
 * units.js  unit类  地图上显示unit
 */

define(function (require, exports, module) {
    var gV = require('./globalvalue');
    var Utils = require('./utils');
    var oUtils = new Utils();
    var Maputils = require('./maputils');
    var oMapUtils = new Maputils();
    var networkInstance = require('./idrNetworkManager');


    function Unit() {
    };

    var UnitData = {
        allUnits: [],
    };

    module.exports = {
        Unit: Unit,
        UnitsData: UnitData
    };

    Unit.prototype = {

        constructors: Unit,

        //获取文字
        getTxtList: function (regionId, floorId) {

            networkInstance.serverCallUnits(regionId, floorId,

                function (data) {

                    UnitData.allUnits = [];

                    for (var i = 0; i < units.length; i++) {
                        UnitData.allUnits.push(units[i]);
                    };

                    Unit.prototype.textTransformation(units);
                },

                function () {

                    alert('获取unit失败!' + str);
                }
            )
        },

        // 文字变化
        textTransformation: function (units) {

            var aOriginalVisiblenodes = this.formatArr(units); //先把原始数组数据转换成obj（具有上下左右值）

            var aNewTempVisible = []; //新增数据(筛选不碰撞的文本)

            for (var i in aOriginalVisiblenodes) {

                if (aOriginalVisiblenodes[i] == 'undefined') {
                    return false;
                } else {
                    if (!this.checkIsCovered(aOriginalVisiblenodes[i], aNewTempVisible)) {
                        aNewTempVisible.push(aOriginalVisiblenodes[i]);
                    }
                }
                ;
            };

            this.setText(aNewTempVisible);
        },

        // 计算元素碰撞
        checkIsCovered: function (aCurrVisible, aNewVisible) {
            var bFlag = false,
                rect, rect1; //rect 是所有的文本数据，  rect1是新增的文本数据， 这2个碰撞对比

            rect = aCurrVisible[4];

            var top = rect[0];
            var bottom = rect[1];
            var left = rect[2];
            var right = rect[3];

            for (var i = 0, n = aNewVisible.length; i < n; i++) {

                rect1 = aNewVisible[i][4];
                var iNow = 0;
                var top1 = rect1[0] - iNow;
                var bottom1 = rect1[1] - iNow;
                var left1 = rect1[2] - iNow;
                var right1 = rect1[3] - iNow;

                //左边
                if (left < left1 && right > left1 && !(top > bottom1 || bottom < top1)) {
                    bFlag = true;
                    break;
                }

                //右边
                if (left < right1 && right > right1 && !(top > bottom1 || bottom < top1)) {
                    bFlag = true;
                    break;
                }

                //上边
                if (top < top1 && bottom > top1 && !(right < left1 || left > right1)) {
                    bFlag = true;
                    break;
                }

                //下边
                if (top < bottom1 && bottom > bottom1 && !(right < left1 || left > right1)) {
                    bFlag = true;
                    break;
                }

                //内部上下
                if (left > left1 && right < right1 && !(top > bottom1 || bottom < top1)) {
                    bFlag = true;
                    break;
                }

                //内部左右
                if (top > top1 && bottom < bottom1 && !(right < left1 || left > right1)) {
                    bFlag = true;
                    break;
                }

                /*if (bottom < top1 || top > bottom1 || right < left1 || left > right1) {
                 bFlag = false;
                 } else {
                 bFlag = true;
                 }*/
            }

            return bFlag;
        },

        //插入文本
        setText: function (objArr) {
            var html = '';

            for (var attr = 0; attr < objArr.length; attr++) {

                if (objArr[attr][5]) { //objArr[attr][5] 是否显示蓝色圆点
                    html += '<span style="left:' + (objArr[attr][1] - 4) + 'px;top:' + (objArr[attr][2] - 3) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
                } else {
                    html += '<span style="left:' + (objArr[attr][1] - objArr[attr][3] / 2 + 4) + 'px;top:' + (objArr[attr][2]) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
                }
            };

            var oG_txt = document.getElementById('g_txt');
            oG_txt.style.opacity = 0.7;
            oG_txt.style.filter = 'alpha(opacity:' + (70) + ')';
            oG_txt.innerHTML = html;

            var aSpan = oG_txt.getElementsByTagName('span');
            for (var i = 0; i < objArr.length; i++) {
                if (objArr[i][5]) { //objArr[i][5] 是否显示蓝色圆点
                    aSpan[i].setAttribute('class', 'cls_txt_circle');
                } else {
                    aSpan[i].removeAttribute('class');
                }
            }

            /*var worker = new Worker('http://wx.indoorun.com/indoorun/common/cheneapp/modules/textrendering.js');
			worker.postMessage(objArr);

			worker.onmessage = function(e) {
				var html = e.data;
				console.log('主线程获取的数据：' + html);

                var oG_txt = document.getElementById('g_txt');
                oG_txt.style.opacity = 0.7;
                oG_txt.style.filter = 'alpha(opacity:' + (70) + ')';
                oG_txt.innerHTML = html;

                var aSpan = oG_txt.getElementsByTagName('span');
                for (var i = 0; i < objArr.length; i++) {
                    if (objArr[i][5]) { //objArr[i][5] 是否显示蓝色圆点
                        aSpan[i].setAttribute('class', 'cls_txt_circle');
                    } else {
                        aSpan[i].removeAttribute('class');
                    }
                }

			}

			worker.onerror = function(e) {
				//记录错误消息日志：包括Worker的文件名和行数
				console.log('Error at' + e.filename + ':' + e.lineno + ':' + e.message);
			}*/
        },

        //转换文字信息
        formatArr: function (list) {

            var oArr = [];

            for (var attr in list) {

                var sName = list[attr].name,
                    x, y, rect = [],
                    isShow; //x为计算后的left值，y为计算后的top值  isShow是否显示蓝色小圆点
                var sId = list[attr].id;
                var iSvgLeft, iSvgTop, iSvgRight, iSvgBottom, pos; //svg对应的坐标

                iSvgLeft = list[attr].boundLeft;
                iSvgTop = list[attr].boundTop;
                iSvgRight = list[attr].boundRight;
                iSvgBottom = list[attr].boundBottom;

                pos = this.changePos(sName, iSvgLeft, iSvgRight, iSvgTop, iSvgBottom);

                x = pos.x;
                y = pos.y;
                rect = pos.rect;
                isShow = pos.isShow; //是否显示小圆点

                var obj = {};
                obj[sId] = [sName, x, y, this.getBytesWidth(sName, false)[0], rect, isShow];
                oArr.push(obj);

            };

            function extend(des, src, override) {
                if (src instanceof Array) {
                    for (var i = 0, len = src.length; i < len; i++) {
                        extend(des, src[i], override);
                    }

                } else {
                    for (var i in src) {
                        if (override || !(i in des)) {
                            des[i] = src[i];
                        }
                    }
                    ;

                }
                return des;

            };

            var aChangeTxt = extend({}, oArr);

            return aChangeTxt;
        },

        //文字svg位置转换屏幕坐标
        changePos: function (sName, iLeft, iRight, iTop, iBottom) {
            var bool = true; //进行判断是否含有蓝色圆点来确定坐标

            var x, y, iTxtWidth, iTxtHeight, iTxtTop, iTxtBottom, iTxtLeft, iTxtRight;

            var sx = (iLeft + iRight) / 2;
            var sy = (iTop + iBottom) / 2;

            var iWidthSvg = iRight - iLeft;
            var iHeightSvg = iBottom - iTop;

            //求出矩形的长度（屏幕中的）
            var iAreaWidth = (iWidthSvg) * gV.scale;

            x = Math.cos(gV.lastSvgAngle * Math.PI / 180) * sx * gV.scale - Math.sin(gV.lastSvgAngle * Math.PI / 180) * sy * gV.scale + gV.lastPX; //屏幕坐标中的x,y
            y = Math.cos(gV.lastSvgAngle * Math.PI / 180) * sy * gV.scale + Math.sin(gV.lastSvgAngle * Math.PI / 180) * sx * gV.scale + gV.lastPY;

            iTxtWidth = this.getBytesWidth(sName, bool)[0]; //屏幕中文本的宽高
            iTxtHeight = this.getBytesWidth(sName, bool)[1];

            iTxtTop = y - iTxtHeight / 2;
            iTxtBottom = y + iTxtHeight / 2;
            iTxtLeft = x - iTxtWidth / 2;
            iTxtRight = x + iTxtWidth / 2;

            var pos = {};
            if (iAreaWidth > iTxtWidth - 10) {
                return pos = { //屏幕文本的x，y坐标及上下左右距离屏幕的值(含小圆点)
                    x: x,
                    y: y,
                    rect: [iTxtTop, iTxtBottom, iTxtLeft, iTxtRight],
                    isShow: false
                };
            } else {
                return pos = {
                    x: x,
                    y: y,
                    rect: [iTxtTop, iTxtBottom, iTxtLeft, iTxtRight],
                    isShow: true
                };
            };
        },

        // 获取字符串字节数宽度 和 高度
        getBytesWidth: function (str, boob) {
            var iPaddingVaule = 10;
            var boob = boob; //含有蓝色圆点的
            var oSpan = document.createElement('span'),
                oTxtName = document.createTextNode(str),
                iWidth, iHeight;

            oSpan.appendChild(oTxtName);
            document.body.appendChild(oSpan);
            iWidth = oSpan.offsetWidth;
            iHeight = oSpan.offsetHeight;
            document.body.removeChild(oSpan);

            if (boob) {
                return [iWidth + iPaddingVaule, iHeight];
            } else {
                return [iWidth, iHeight];
            }
        },
    };
});

