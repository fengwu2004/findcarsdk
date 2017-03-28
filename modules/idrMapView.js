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

    var matrix3 = require('./matrix3')

    var oMapUtils = new Maputils();

    var networkManager = require('./idrNetworkManager');

    var idrIndicator = require('./idrIndicator')

    var idrFloorListControl = require('./idrFloorListControl');

    var idrDataMgr = require('./idrDataManager');

    var networkInstance = require('./idrNetworkManager')

    var IDRPath = require('./IDRSvgPath/IDRSvgPolyLine')

    var _idrPath = IDRPath()

    var IDRIndicator = require('./IDRIndicator/IDRSvgLocation')

    var _idrIndicator = IDRIndicator()

    function idrMapView() {

        var _x = 0

        var _y = 0

        var _refreshTimer = null

        var _svgFrame = null

        var _mapViewPort = null

        var _regionId = null

        var _floorId = null

        var _regionData = null

        var _floorListControl = null

        var _posIndicator = null

        var _loadMapSuccessFun = null

        var _svgBox = null

        var _svgPath = null

        var _units = []

        var _unitDivs = []

        var _currentTm = null

        var _mapScale = 1

        var _mapRotate = 0

        var _origScale = 0.5

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
            getAllUnits()

            hammObj.handleDo();

            hammObj.bindTouch(oSvgBox);
        }

        var addUnits = function() {

            for (var i = 0; i < _units.length; ++i) {

                var unit = _units[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','text')

                var x = 0.5 * (unit['boundLeft']+ unit['boundRight'])

                var y = 0.5 * (unit['boundTop'] + unit['boundBottom'])

                var trans = 'matrix(' + _origScale + ',' + 0 + ',' + 0 + ',' + _origScale + ',' + x + ',' + y + ')'

                unitSvg.setAttribute('transform', trans)

                unitSvg.innerHTML = unit.name

                _unitDivs.push(unitSvg)

                _mapViewPort.appendChild(unitSvg)
            }
        }

        var getAllUnits = function() {

            networkInstance.serverCallUnits(_regionId, _floorId,

                function (data) {

                    _units = data;

                    addUnits()
                },

                function () {

                    alert('获取unit失败!' + str);
                }
            )
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

        var setDisplayTimer = function() {

            _refreshTimer = setInterval(updateDisplay, 100)
        }

        this.loadMap = function(regionId, floorId) {

            _regionData = idrDataMgr.regionAllInfo

            _regionId = regionId

            _floorId = floorId

            networkManager.serverCallSvgMap(_regionId, _floorId, function(data) {

                createSVGMap(data, _regionId, _floorId)

                addFloorList()

                setDisplayTimer()

                if (_loadMapSuccessFun) {

                    _loadMapSuccessFun()
                }

            }, function() {

                alert('地图数据获取失败!' + data);
            })
        }

        this.setCurrPos = function(x, y, show) {

            _x = x

            _y = y

            _idrIndicator.creatSvgLocationDom(_mapViewPort, {x:_x, y:_y})
        }

        function getTransform(transformList) {

            if (transformList.length != 6) {

                return false;
            }

            var a = transformList[0];
            var b = transformList[1];

            var c = transformList[2];
            var d = transformList[3];

            var tx = transformList[4];
            var ty = transformList[5];

            var sx = Math.sqrt(a * a + b * b);

            var a = Math.atan2(c, d);

            return {
                a: a,
                s: sx,
                tx: tx,
                ty: ty
            }
        }

        var getTransArray = function(value) {

            var temp = value.substring(7, value.length - 1)

            var valueT = temp.split(',')

            return [valueT[0], valueT[1], valueT[2], valueT[3], valueT[4], valueT[5]]
        }

        var updateDisplay = function() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            var mdecompose = getTransform(mt)

            if (_idrIndicator) {

                if (_mapScale !== mdecompose.s) {

                    _idrIndicator.updateScale(1/mdecompose.s)
                }
            }

            if (_idrPath) {

                if (_mapScale !== mdecompose.s) {

                    _idrPath.updateScale(1/mdecompose.s)
                }
            }

            console.log(_mapRotate * 180/Math.PI)

            if (_mapScale !== mdecompose.s || _mapRotate !== mdecompose.a) {

                updateUnitAngleAndScale(_origScale * 1/mdecompose.s, -1 * _mapRotate)
            }

            _mapScale = mdecompose.s

            _mapRotate = mdecompose.a
        }

        var updateUnitAngleAndScale = function(scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            _unitDivs.forEach(function(unitSvg, index) {

                var unit = _units[index]

                var x = 0.5 * (unit['boundLeft']+ unit['boundRight'])

                var y = 0.5 * (unit['boundTop'] + unit['boundBottom'])

                var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + x + ',' + y + ')'

                unitSvg.setAttribute('transform', m)
            })
        }

        this.showPath = function(paths) {

            _idrPath.updateLine(_mapViewPort, paths)
        }

        function matrixFromString(value) {

            var temp = value.substring(7, value.length - 1)

            var valueT = temp.split(',')

            var mt = matrix3.create()

            matrix3.set(mt, valueT[0], valueT[1], 0, valueT[2], valueT[3], 0, valueT[4], valueT[5], 1)

            return mt
        }

        function matrixToString(value, x, y) {

            return 'matrix(' + value[0] + ',' + value[1] + ',' + value[3] + ',' + value[4] + ',' + x + ',' + y + ')'
        }

        this.setLoadMapFinishCallback = function(callBack) {

            _loadMapSuccessFun = callBack
        }
    }

    module.exports = idrMapView;
});