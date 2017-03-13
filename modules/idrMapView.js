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

    function idrMapView() {

        var _x = 0

        var _y = 0

        var _posTimer = null

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

        this.setCurrPos = function(x, y, show) {

            _x = x

            _y = y

            if (!_posIndicator) {

                createPosIndicator('indicator', 'http://wx.indoorun.com/indoorun/common/cheneapp/images/point.png')
            }

            if (!show) {

                clearInterval(_posTimer)

                _posTimer = null

                return
            }

            if (_posTimer == null) {

                _posTimer = setInterval(updateDisplay, 1000/60)
            }
        }

        var updateDisplay = function() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = matrixFromString(trans)

            _posIndicator.setPos(_x, _y, mt)

            if (!_currentTm || !matrix3.equals(_currentTm, mt)) {

                if (_unitDivs.length > 0) {

                    _currentTm = mt

                    updateUnitAngleAndScale(mt)
                }
            }
        }

        var updateUnitAngleAndScale = function(m) {

            var tm = matrix3.clone(m)

            tm[6] = 0

            tm[7] = 0

            matrix3.invert(tm, tm)

            _unitDivs.forEach(function(unitSvg, index) {

                var unit = _units[index]

                var x = 0.5 * (unit['boundLeft']+ unit['boundRight'])

                var y = 0.5 * (unit['boundTop'] + unit['boundBottom'])

                unitSvg.setAttribute('transform', matrixToString(tm, x, y))
            })
        }

        this.showPath = function(paths) {

            if (_svgPath == null) {

                _svgPath = document.createElementNS('http://www.w3.org/2000/svg','polyline')

                _svgPath.style.fill = 'none'

                _svgPath.style.stroke = 'red'

                _svgPath.style.strokeWidth = 4

                _mapViewPort.appendChild(_svgPath)
            }

            var res = ''

            for (var i = 0; i < paths.length - 1; i++) {

                res += paths[i][0] + ', ' + paths[i][1] + ', '
            }

            res += paths[paths.length - 1][0] + ', ' + paths[paths.length - 1][1]

            _svgPath.setAttribute('points', res)
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