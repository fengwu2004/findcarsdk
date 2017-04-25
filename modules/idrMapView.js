/**
 * Created by yan on 09/02/2017.
 */

define(function (require, exports, module) {

    require('./alloy_finger')

    var Utils = require('./utils');

    var oUtils = new Utils();

    var ObjectUnits = require('./units');

    var Unit = ObjectUnits.Unit;

    var Maputils = require('./maputils');

    var matrix2d = require('./mat2d')

    var vec2 = require('./vec2')

    var networkManager = require('./idrNetworkManager');

    var idrFloorListControl = require('./idrFloorListControl');

    var idrDataMgr = require('./idrDataManager');

    var networkInstance = require('./idrNetworkManager')

    var IDRPath = require('./IDRSvgPath/IDRSvgPolyLine')

    var _idrPath = IDRPath()

    var IDRRegionEx = require('./idrRegionEx')

    var IDRIndicator = require('./IDRIndicator/IDRSvgLocation')

    var IDRMapMarkers = require('./IDRMapMarker/IDRMapMarker')

    var IDRCarMarker = IDRMapMarkers['IDRCarMarker']

    var _idrIndicator = IDRIndicator()

    function idrMapView() {

        this.maxScale = 1.0

        this.minScale = 1.0

        var _currentPos = null

        var _regionId = null

        var _currentFloorId = null

        var _refreshTimer = null

        var _svgFrame = null

        var _mapViewPort = null

        var _regionData = null

        var _floorListControl = null

        var _loadMapSuccessFun = null

        var _svgBox = null

        var _units = []

        var _unitDivs = []

        var _mapScale = 1

        var _mapRotate = 0

        var _origScale = 0.5

        var _gestures = null

        var _markerClickCallBack = null

        var _unitClickCallBack = null

        var _mapClickedCallBack = null

        var _markers = {}

        var addFloorList = function() {

            _floorListControl = new idrFloorListControl();

            _floorListControl.setChangeFloorFunc(this, changeFloor)

            var floor = _regionData.getFloorbyId(_currentFloorId)

            _floorListControl.init(_svgFrame, _regionData['floorList'], floor)
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

            var map = document.getElementById('地图')

            map.addEventListener('click', onMapClick, true)

            addGestures(oSvgBox)

            //进行文字加载
            getAllUnits()
        }
        
        function onMapClick(ele) {

            console.log(ele.target.id)
        }

        function getTouchCenter(p) {

            var im = matrix2d.create()

            im = matrix2d.invert(im, getMapViewMatrix())

            vec2.transformMat2d(p, p, im)

            return p
        }

        function getClickedMarker(p) {

        }

        function getClickedUnit(p) {

        }

        function onSingleTap(evt) {

            var p = getTouchCenter(vec2.fromValues(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY))

            var marker = getClickedMarker(p)

            if (marker !== null) {

                if (_markerClickCallBack !== null) {

                    if (_markerClickCallBack(marker)) {

                        return
                    }
                }
            }

            var unit = getClickedUnit(p)

            if (unit !== null) {

                if (_unitClickCallBack !== null) {

                    if (_unitClickCallBack(unit)) {

                        return
                    }


                }
            }

            if (_mapClickedCallBack) {

                _mapClickedCallBack(p)
            }
        }

        function getTouchesCenter(evt) {

            var x = (evt.touches[0].pageX + evt.touches[1].pageX)/2

            var y = (evt.touches[0].pageY + evt.touches[1].pageY)/2

            var p = vec2.fromValues(x, y)

            var im = matrix2d.create()

            im = matrix2d.invert(im, getMapViewMatrix())

            vec2.transformMat2d(p, p, im)

            return p
        }

        function onPinch(evt) {

            var p = getTouchesCenter(evt)

            zoom(evt.gradualscale, p)

            console.log(evt.gradualscale)
        }

        function onRoate(evt) {

            var p = getTouchesCenter(evt)

            rotate(evt.angle * Math.PI/180, p)
        }

        function onPan(evt) {

            scroll([evt.deltaX, evt.deltaY])
        }

        function addGestures() {

            _gestures = new AlloyFinger(_mapViewPort, {

                singleTap:onSingleTap,

                rotate:onRoate,

                pinch:onPinch,

                pressMove:onPan
            })
        }
        
        function addUnitsText() {

            for (var i = 0; i < _units.length; ++i) {

                var unit = _units[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','text')

                unitSvg.innerHTML = unit.name

                _unitDivs.push(unitSvg)

                _mapViewPort.appendChild(unitSvg)

                var center = [0.5 * (unit.boundLeft + unit.boundRight), 0.5 * (unit.boundTop + unit.boundBottom)]

                unit.x = center[0]

                unit.y = center[1]

                var trans = 'matrix(' + _origScale + ',' + 0 + ',' + 0 + ',' + _origScale + ',' + unit.x + ',' + unit.y + ')'

                unitSvg.setAttribute('transform-origin', '50% 50% 0')

                unitSvg.setAttribute('transform', trans)
            }
        }

        function addUnitClickRect() {

            for (var i = 0; i < _units.length; ++i) {

                var unit = _units[i]

                var unitSvg = document.createElementNS('http://www.w3.org/2000/svg','rect')

                unitSvg.id = unit.id

                unitSvg.setAttribute('x', unit.boundLeft)

                unitSvg.setAttribute('y', unit.boundTop)

                unitSvg.setAttribute('width', unit.boundRight - unit.boundLeft)

                unitSvg.setAttribute('height', unit.boundBottom - unit.boundTop)

                unitSvg.style.opacity = 0

                _mapViewPort.appendChild(unitSvg)

                unitSvg.addEventListener('click', onClickUnit, true)
            }
        }
        
        function onClickUnit(ele) {

            console.log(ele.srcElement.id)
        }

        var addUnits = function() {

            addUnitsText()
            
            addUnitClickRect()
        }

        var getAllUnits = function() {

            networkInstance.serverCallUnits(_regionId, _currentFloorId,

                function (data) {

                    _units = data;

                    addUnits()
                },

                function (str) {

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

            if (value == null) {

                return [1, 0, 0, 1, 0, 0]
            }

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

            if (_mapScale !== mdecompose.s || _mapRotate !== mdecompose.a) {

                updateUnitAngleAndScale(_origScale * 1/mdecompose.s, -1 * _mapRotate)

                updateMarkersAngleAndScale(_origScale * 1/mdecompose.s, -1 * _mapRotate)
            }

            _mapScale = mdecompose.s

            _mapRotate = mdecompose.a
        }

        var updateMarkersAngleAndScale = function(scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            var markers = _markers[_currentFloorId]

            markers.forEach(function(unitSvg, index) {

                var marker = markers[index]

                var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + marker.position.x + ',' + marker.position.y + ')'

                marker.el.setAttribute('transform', m)
            })
        }

        var updateUnitAngleAndScale = function(scale, rotate) {

            var a = scale * Math.cos(rotate)

            var b = -scale * Math.sin(rotate)

            var c = scale * Math.sin(rotate)

            var d = scale * Math.cos(rotate)

            _unitDivs.forEach(function(unitSvg, index) {

                var unit = _units[index]

                var m = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + unit.x + ',' + unit.y + ')'

                unitSvg.setAttribute('transform', m)
            })
        }

        this.showPath = function(paths) {

            _idrPath.updateLine(_mapViewPort, paths)
        }
        
        function retriveSvgDataAndShow() {

            networkManager.serverCallSvgMap(_regionId, _currentFloorId, function(data) {

                createSVGMap(data, _regionId, _currentFloorId)

                onLoadMapSuccess()

            }, function() {

                alert('地图数据获取失败!' + data);
            })
        }

        function changeFloor(floorId) {

            if (floorId === _currentFloorId) {

                return
            }

            _currentFloorId = floorId

            retriveSvgDataAndShow()
        }

        function loadMap(regionId, floorId) {

            _regionData = new IDRRegionEx(idrDataMgr.regionAllInfo)

            _regionId = regionId

            _currentFloorId = floorId

            retriveSvgDataAndShow()
        }
        
        function onLoadMapSuccess() {

            if (_floorListControl == null) {

                addFloorList()

                test()
            }

            if (_refreshTimer == null) {

                setDisplayTimer()
            }

            if (_loadMapSuccessFun) {

                _loadMapSuccessFun(_currentFloorId, _regionId)
            }
        }

        function removeMarker(deleteMarker) {

            var temp = new Array()

            for (var i = 0; i < _markers[deleteMarker.position.floorId].length; ++i) {

                var marker = _markers[deleteMarker.position.floorId][i]

                if (marker.id !== deleteMarker.id) {

                    temp.push(marker)
                }
            }

            _markers[marker.position.floorId] = temp

            marker.removeFromSuperView()
        }

        function addMarker(marker) {

            if (!_markers.hasOwnProperty(marker.position.floorId)) {

                _markers[marker.position.floorId] = new Array()
            }

            _markers[marker.position.floorId].push(marker)

            marker.id = marker.position.floorId + '_' + _markers[marker.position.floorId].length

            marker.addToSuperView(_mapViewPort)

            var trans = 'matrix(' + _origScale + ',' + 0 + ',' + 0 + ',' + _origScale + ',' + marker.position.x + ',' + marker.position.y + ')'

            marker.el.setAttribute('transform-origin', '50% 50% 0')

            marker.el.setAttribute('transform', trans)

            marker.el.addEventListener('click', onMarkerClick, true)

            return marker
        }

        function onMarkerClick(ele) {

            console.log(ele.srcElement.id)
        }

        function addPoint(p) {

            var circle = document.createElementNS('http://www.w3.org/2000/svg','circle')

            circle.setAttribute('cx', p[0].toString())

            circle.setAttribute('cy', p[1].toString())

            circle.setAttribute('r', '10')

            circle.setAttribute('fill', 'red')

            _mapViewPort.appendChild(circle)
        }

        this.onTestClick = function() {

            // var marker = new IDRCarMarker({x:100, y:100, floorId:_currentFloorId})
            //
            // addMarker(marker)

            zoom(1.2, [100, 100])
        }
        
        var test = function() {

            var marker = new IDRCarMarker({x:100, y:100, floorId:_currentFloorId})

            addMarker(marker)

            // var button = document.createElement('button')
            //
            // button.setAttribute('id', 'testButton')
            //
            // button.setAttribute('onclick', 'onTestClick()')
            //
            // button.innerText = 'Button'
            //
            // var div = document.getElementById('main')
            //
            // div.appendChild(button)
        }

        var getMapViewMatrix = function() {

            var trans = _mapViewPort.getAttribute('transform')

            var mt = getTransArray(trans)

            return matrix2d.fromValues(mt[0], mt[1], mt[2], mt[3], mt[4], mt[5])
        }
        
        var getMapPos = function(svgPos) {

            var mt = getMapViewMatrix()

            matrix2d.invert(mt, mt)

            var posIn2d = vec2.fromValues(svgPos[0], svgPos[1])

            return vec2.transformMat2d(posIn2d, posIn2d, mt)
        }
        
        var getSvgPos = function(mapPos) {

            var mt = getMapViewMatrix()

            var posIn2d = vec2.fromValues(mapPos[0], mapPos[1])

            return vec2.transformMat2d(posIn2d, posIn2d, mt)
        }

        var updateMapViewTrans = function(mt) {

            var trans = 'matrix(' + mt[0] + ',' + mt[1] + ',' + mt[2] + ',' + mt[3] + ',' + mt[4] + ',' + mt[5] + ')'

            _mapViewPort.setAttribute('transform', trans)
        }

        var zoom = function(scale, anchor) {

            var mt = getMapViewMatrix()

            matrix2d.translate(mt, mt, vec2.fromValues(anchor[0], anchor[1]))

            matrix2d.scale(mt, mt, vec2.fromValues(scale, scale))

            matrix2d.translate(mt, mt, vec2.fromValues(-anchor[0], -anchor[1]))

            updateMapViewTrans(mt)
        }
        
        var scroll = function(vec) {

            var mt = getMapViewMatrix()

            matrix2d.translate(mt, mt, vec2.fromValues(vec[0], vec[1]))

            updateMapViewTrans(mt)
        }

        var rotate = function(rad, anchor) {

            var p = anchor

            var mt = getMapViewMatrix()

            matrix2d.translate(mt, mt, vec2.fromValues(p[0], p[1]))

            matrix2d.rotate(mt, mt, rad)

            matrix2d.translate(mt, mt, vec2.fromValues(-p[0], -p[1]))

            updateMapViewTrans(mt)
        }

        function centerPos(mapPos) {


        }
        
        function resetMap() {
            
        }
        
        function birdLook() {


        }
        
        function setCurrentPos(pos, show) {

            _currentPos = pos

            _idrIndicator.creatSvgLocationDom(_mapViewPort, {x:_currentPos.x, y:_currentPos.y})
        }

        this.centerPos = centerPos

        this.resetMap = resetMap

        this.birdLook = birdLook

        this.getMapPos = getMapPos

        this.getSvgPos = getSvgPos

        this.zoom = zoom

        this.scroll = scroll

        this.rotate = rotate

        this.setCurrPos = setCurrentPos

        this.addMarker = addMarker

        this.removeMarker = removeMarker

        this.loadMap = loadMap

        this.changeFloor = changeFloor

        this.setLoadMapFinishCallback = function(callBack) {

            _loadMapSuccessFun = callBack
        }
    }

    module.exports = idrMapView;
});