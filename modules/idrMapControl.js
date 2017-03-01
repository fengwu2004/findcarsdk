/**
 * Created by yan on 09/02/2017.
 */

define(function (require, exports, module) {

    var gv = require('./idrCoreManager');

    var hammObj = require('./hamm');

    var Utils = require('./utils');

    var oUtils = new Utils();

    var ObjectUnits = require('./units');

    var Unit = ObjectUnits.Unit;

    var unitObj = new Unit();

    var Maputils = require('./maputils');

    var oMapUtils = new Maputils();

    var networkManager = require('./idrNetworkManager');

    var idrFloorListControl = require('./idrFloorListControl');

    var idrDataMgr = require('./idrDataManager');

    function idrMapControl() {

        this.af = null;

        this.svgFrame = null;

        this.svgMap = null;

        this.units = [];

        this.iniScale = 1;

        this.regionId = '';

        this.floorId = '';

        this.initAngle = 0;

        this.regionData = null;
    }

    idrMapControl.prototype.loadMap = function (regionId, floorId) {

        this.regionData = idrDataMgr.regionAllInfo;

        var that = this;

        this.regionId = regionId;

        this.floorId = floorId;

        networkManager.serverCallSvgMap(regionId, floorId,

            function (data) {

                createSVGMap(data, regionId, floorId);

                that.addFlootList();
            },
            function () {

                alert('地图数据获取失败!' + data);
            }
        )
    }

    idrMapControl.prototype.addFlootList = function () {

        this.floorListControl = new idrFloorListControl()

        this.floorListControl.init(this.svgFrame, this.regionData.floorList)
    }

    function addSvgMap(data, regionId, floorId) {

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

        if (aUnit1) {

            var aR = aUnit1.getElementsByTagName('rect');

            Array.prototype.forEach.call(aR, function (node, index, array) {

                node.id = 'rect_' + index;
            })
        }

        var domView = jsLib.getEle('#viewport');

        hammObj.scale = 0;

        hammObj.angle = 0;

        hammObj.init(domView);

        oUtils.HandleNode.setStyle(oSvgFrame, {'display': 'block'});

        oUtils.HandleNode.setStyle(oSvgBox, {'visibility': 'visible'});

        //进行文字加载
        unitObj.getTxtList(regionId, floorId);

        oMapUtils.isAgainDraw(floorId);

        hammObj.handleDo();

        hammObj.bindTouch(oSvgBox);
    }

    function createSVGMap(svg, regionId, floorId) {

        removePreviousSVG();

        addSvgMap(svg, regionId, floorId);


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
        else {

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

            document.body.appendChild(svgFrame);
        }
    }

    module.exports = idrMapControl;
})