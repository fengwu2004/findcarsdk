/**
 * Created by yan on 09/02/2017.
 */

define(function (require, exports, module) {

    var gv = require('./idrCoreManager');

    var hammObj = require('./hamm');

    var Utils = require('./utils');

    var ObjectUnits = require('./units');

    var Unit = ObjectUnits.Unit;

    var unitObj = new Unit();

    var Maputils = require('./maputils');

    var oMapUtils = new Maputils();

    function idrmap() {

        this.af = null;

        this.svgFrame = null;

        this.svgMap = null;

        this.units = [];

        this.iniScale = 1;

        this.regionId = '';

        this.floorId = '';

        this.initAngle = 0;
    }

    idrmap.prototype.loadMap = function (regionId, floorId) {

        var that = this;

        this.regionId = regionId;

        this.floorId = floorId;

        var str = 'appId=' + gv.appId + '&clientId=' + gv.clientId + '&time=' + gv.time + '&sign=' + gv.sign;

        var url = 'http://wx.indoorun.com/wx/getSvg.html';

        jsLib.ajax({

            type: "get",

            dataType: 'jsonp',

            url: url, //添加自己的接口链接

            data: {
                'regionId': regionId,
                'floorId': floorId,
                'appId': gv.appId,
                'clientId': gv.clientId,
                'sessionKey': gv.sessionKey
            },

            timeOut: 10000,

            before:function () {

            },

            success:function (data) {

                createSVGMap(data);
            },

            error:function (data) {

                alert('地图数据获取失败!' + data);
            }
        });
    }

    function addSvgMap(data) {

        var svg = data;

        var oSvgBox = document.querySelector('#svgBox');

        var oSvgFrame = document.querySelector('#svgFrame');

        oSvgBox.innerHTML = svg;

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

        if(aUnit1) {

            var aR = aUnit1.getElementsByTagName('rect');

            Array.prototype.forEach.call(aR, function(node, index, array) {

                node.id = 'rect_' + index;
            })
        }

        var domView = jsLib.getEle('#viewport');

        hammObj.scale = gV.scale = 0;

        hammObj.angle = gV.lastSvgAngle = 0;

        hammObj.init(domView);

        oUtils.HandleNode.setStyle(oSvgFrame, {'display': 'block'});

        oUtils.HandleNode.setStyle(oSvgBox, {'visibility': 'visible'});

        //进行文字加载
        unitObj.getTxtList(regionId, floorId);

        if (gV.bDynamicNag === false) {

            oMapUtils.isAgainDraw(floorId);
        };

        hammObj.handleDo();
    }

    function createSVGMap(str) {

        removePreviousSVG();

        var svg = str.data;

        addSvgMap(svg);
    }

    function removePreviousSVG() {

        var svgFrame = document.querySelector('#svgFrame');

        if (svgFrame) {

            var svgBox = document.querySelector('#svgBox');

            var gtext = document.querySelector('#g_txt');

            var lines = document.querySelector('#line');

            svgBox.innerHTML = '';

            gtext.innerHTML = '';

            lines.innerHTML = '';
        }
        else  {

            var oParent = document.createElement('div');

            oParent.id = this.id;

            var svgFrame = document.createElement('div');

            svgFrame.id = 'svgFrame';

            svgFrame.className = 'svg_frame';

            var svgBox = document.createElement('div');

            svgBox.id = 'svgBox';

            svgBox.className = 'svg_box';

            var gText = document.createElement('div');

            gText.id = 'g_txt';

            gText.className = 'gTxt';

            var lines = document.createElement('div');

            lines.id = 'line';

            svgFrame.appendChild(svgBox);

            svgFrame.appendChild(gText);

            svgFrame.appendChild(lines);

            oParent.appendChild(svgFrame);

            document.body.appendChild(oParent);
        }
    }

    function addUnits(obj) {

        var url = 'http://wx.indoorun.com/wx/getUnitsOfFloor.html';

        jsLib.ajax({

            type: "get",

            dataType: 'jsonp',

            url: url, //添加自己的接口链接

            data: {
                'regionId': obj.regionId,
                'floorId': obj.floorId,
                'appId': gv.appId,
                'clientId': gv.clientId,
                'sessionKey': gv.sessionKey
            },

            timeOut: 10000,

            before: function () {

            },
            success: function (str) {

                var data = str;

                if (data != null) {

                    obj.units = data.data;

                    doAddUnits(obj);
                }
            },
            error: function (str) {

                alert('获取unit失败!' + str);
            }
        });
    }

    function doAddUnits(obj) {

        var gtext = document.querySelector('#g_txt');

        var html = '';

        for (var i = 0; i < obj.units.length; ++i) {

            var name = obj.units[i].name;

            var left = 'left:' + obj.units[i].boundLeft + 'px;';

            var top = 'top:' + obj.units[i].boundTop + 'px;';

            html += '<span style="color:blue;' + left + top + '"' + '>' + name + '</span>';
        }

        gtext.innerHTML = html;
    }

    module.exports = idrmap;
})