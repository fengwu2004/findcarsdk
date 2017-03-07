/**
 * Created by yan on 09/02/2017.
 */

define(function (require, exports, module) {

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

        var self = this

        var _svgFrame = null

        var _regionId = null

        var _floorId = null

        var _initAngle = 0

        var _regionData = null

        var _floorListControl = null

        var addFloorList = function() {

            _floorListControl = new idrFloorListControl();

            var oSvgFrame = document.querySelector('#svgFrame');

            _floorListControl.init(oSvgFrame, _regionData.floorList)
        }

        var addSvgMap = function(data, regionId, floorId) {

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

                for (i = 0; i < aRect.length; i++) {

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

        var createSVGMap = function(svg, regionId, floorId) {

            removePreviousSVG();

            addSvgMap(svg, regionId, floorId);
        }

        var removePreviousSVG = function () {

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

                svgFrame = document.createElement('div');

                svgFrame.id = 'svgFrame';

                svgFrame.className = 'svg_frame';

                svgBox = document.createElement('div');

                svgBox.id = 'svgBox';

                svgBox.className = 'svg_box';

                var gText = document.createElement('div');


                gText.id = 'g_txt';

                gText.className = 'gTxt';

                lines = document.createElement('div');

                lines.id = 'line';

                svgFrame.appendChild(svgBox);

                svgFrame.appendChild(gText);

                svgFrame.appendChild(lines);

                document.body.appendChild(svgFrame);
            }
        }

        this.loadMap = function(regionId, floorId) {

            _regionData = idrDataMgr.regionAllInfo

            _regionId = regionId

            _floorId = floorId

            networkManager.serverCallSvgMap(_regionId, _floorId, function(data) {

                createSVGMap(data, _regionId, _floorId)

                addFloorList()

            }, function() {

                alert('地图数据获取失败!' + data);
            })
        }
    }

    module.exports = idrMapControl;
});