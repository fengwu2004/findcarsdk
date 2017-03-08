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

    var idrIndicator = require('./idrIndicator')

    var idrFloorListControl = require('./idrFloorListControl');

    var idrDataMgr = require('./idrDataManager');

    function idrMapControl() {

        var self = this

        var _svgFrame = null

        var _mapViewPort = null

        var _regionId = null

        var _floorId = null

        var _regionData = null

        var _floorListControl = null

        var _posIndicator = null

        var _loadMapSuccessFun = null

        var _svgBox = null

        var addFloorList = function() {

            _floorListControl = new idrFloorListControl();

            _floorListControl.init(_svgFrame, _regionData['floorList'])
        }

        var addSvgMap = function(data, regionId, floorId) {

            var svg = data;

            var oSvgBox = document.querySelector('#svgBox');

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

            _mapViewPort = jsLib.getEle('#viewport');

            hammObj.scale = 0;

            hammObj.angle = 0;

            hammObj.init(_mapViewPort);

            oUtils.HandleNode.setStyle(_svgFrame, {'display': 'block'});

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

            if (_svgFrame) {

                _svgBox = document.querySelector('#svgBox');

                var gtext = document.querySelector('#g_txt');

                var lines = document.querySelector('#line');

                _svgBox.innerHTML = '';

                gtext.innerHTML = '';

                lines.innerHTML = '';
            }
            else {

                _svgFrame = document.createElement('div');

                _svgFrame.id = 'svgFrame';

                _svgFrame.className = 'svg_frame';

                _svgBox = document.createElement('div');

                _svgBox.id = 'svgBox';

                _svgBox.className = 'svg_box';

                var gText = document.createElement('div');

                gText.id = 'g_txt';

                gText.className = 'gTxt';

                lines = document.createElement('div');

                lines.id = 'line';

                _svgFrame.appendChild(_svgBox);

                _svgFrame.appendChild(gText);

                _svgFrame.appendChild(lines);

                document.body.appendChild(_svgFrame);
            }
        }

        this.loadMap = function(regionId, floorId) {

            _regionData = idrDataMgr.regionAllInfo

            _regionId = regionId

            _floorId = floorId

            networkManager.serverCallSvgMap(_regionId, _floorId, function(data) {

                createSVGMap(data, _regionId, _floorId)

                addFloorList()

                if (_loadMapSuccessFun) {

                    _loadMapSuccessFun()
                }

            }, function() {

                alert('地图数据获取失败!' + data);
            })
        }

        var createPosIndicator = function(id, src) {

            function createDom() {

                var dom = document.createElement('div')

                dom.id = id

                var oImg = document.createElement('img')

                oImg.src = src

                oImg.style.width = '60px'

                oImg.style.height = '60px'

                dom.appendChild(oImg)

                _svgFrame.appendChild(dom)

                return dom
            }

            _posIndicator = new idrIndicator()

            _posIndicator.setDom(createDom())
        }

        this.setCurrPos = function(x, y) {

            if (!_posIndicator) {

                createPosIndicator('indicator', 'http://wx.indoorun.com/indoorun/common/cheneapp/images/point.png')
            }

            var trans = _mapViewPort.getAttribute('transform')

            transFunc(trans)

            _posIndicator.setPos(x, y, trans)
        }

        function transFunc(value) {

            var temp = value.substring(7, value.length - 1)

            console.log(temp)
        }

        this.setLoadMapFinishCallback = function(callBack) {

            _loadMapSuccessFun = callBack
        }
    }

    module.exports = idrMapControl;
});