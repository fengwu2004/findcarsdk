/**
 * Created by ky on 17-6-20.
 */

define(function (require, exports, module) {

    function idrGlMap(mapView) {

        var maxScale = 1.5

        var minScale = 1

        var _mapScale = 1

        var _mapRotate = 0

        var _mapView = mapView

        var _regionEx = null

        var _markerOrigScale = 1

        var _floorId = null

        var _floor = null

        var _unitDivs = null

        var _origScale = 0.5

        var _map = null

        var _idrIndicator = null

        var _mat = null

        var _canvas_txt = null

        var _canvas_gl = null
        
        var _floorList = []
        
        var _region = null
    
        var listener = {
            
            onLoadFinish : function(floorId, floorIndex){
                "use strict";
                
            },
        
            onLoadFailed : function(floorId, floorIndex){
            },
        
            onAllFloorLoadFinish : function(){
            
            },
        
            onStatusChange : function(status){
            
            },
        
            onAnimStart : function(anim){
            },
        
            onAnimFinish : function(anim){
            },
        
            onAnimCancel : function(anim){
            
            },
        
            onClick : function(x, y){
            
                console.log(x, y)
            },
        
            onDClick : function(x, y){
            
            },
        
            on2FClick : function(x, y){
            
            },
        
            onLongPressUp : function(x, y){
            
            }
        }
        
        var _currentFloorId = null

        this.init = function(regionEx, floorId, container) {

            _regionEx = regionEx
            
            _floor = _regionEx.getFloorbyId(floorId)

            createCanvas(container)
    
            for (var i = 0; i < _regionEx.floorList.length; ++i) {
    
                var data = {}
    
                data.id = _regionEx.floorList[i].id
                
                data.svg = _regionEx.floorSvgs[data.id]
                
                data.deflection = _regionEx.northDeflectionAngle
    
                _floorList.push(data)
            }
    
            _region = new Region("testRegion", _canvas_gl, _canvas_txt, listener);
            
            _region.addFloorsSVG(_floorList);
    
            _region.startRender();
    
            _currentFloorId = floorId
    
            _region.displayFloor(_floor.floorIndex)
        }
        
        function createEle(type, id, className) {
        
            var ele = document.createElement(type)
    
            ele.id = id
            
            ele.className = className
            
            return ele
        }
        
        function createCanvas(containor) {
    
            _map = createEle('div', 'mapRoot', 'svg_box')
    
            _canvas_gl = document.getElementById('gl-canvas')
            
            if (!_canvas_gl) {
    
                _canvas_gl = createEle('canvas', 'gl-canvas', 'canvas-frame')
    
                _canvas_gl.width = 1080

                _canvas_gl.height = 1920
            }
            
            _map.appendChild(_canvas_gl)
            
            _canvas_txt = document.getElementById('txt-canvas')
            
            if (!_canvas_txt) {
    
                _canvas_txt = createEle('canvas', 'txt-canvas', 'canvas-frame')
                
                _canvas_txt.width = 1080

                _canvas_txt.height = 1920
            }
            
            _map.appendChild(_canvas_txt)
    
            containor.appendChild(_map)
        }

        function onMapClick() {

        
        }

        function onUnitClick() {

        
        }

        function updateUnitsColor(units, color) {

        
        }

        function clearUnitColor(unit) {

        
        }

        function clearUnitsColor(units) {

        
        }

        function changeUnitColor(unit, color) {

        
        }

        function addEvents() {

            addMapEvent()
        }

        function addUnitsText(unitList) {
            
            for (var i = 0; i < unitList.length; ++i) {

                var unit = unitList[i]
                
                var unitMapObj = {type:unit.types, str:unit.name}
                
                var pos = unit.getPos()
                
                _region.insertUnit(unitMapObj, _floor.floorIndex, pos.x, pos.y)
            }
        }

        function addMarker(marker) {

            _region.addTexture(marker.className, marker.image)
    
            _region.insertTextureMarker(marker.className, _floor.floorIndex, marker.pos.x, marker.pos.y, 0, 0, 40)
        }

        function detach() {

        
        }

        function attachTo(containor) {
            
        
        }

        function refreshUnits(units) {

            addUnitsText(units)
        }

        function setPos(pos) {

            if (!pos || pos.floorId !== _floorId) {

                _idrIndicator && _idrIndicator.remove()

                return
            }

            if (_idrIndicator == null) {

                _idrIndicator = new IDRIndicator()

            }
            else  {

                _idrIndicator.updateLocation(pos)
            }
        }

        function resetMap() {

        
        }

        function scroll(screenVec) {

        
        }

        function birdLook() {

        
        }

        function updateRoutePath(path) {

        
        }

        function showRoutePath(path) {

            updateRoutePath(path)
        }

        function getMapPos(svgPos) {

        
        }

        function getSvgPos(mapPos) {

        
        }

        function rotate(rad, anchor) {


        }

        function centerPos(mapPos) {

        
        }

        function updateDisplay() {

        
        }

        function getTargetFloorPoints(path, floorId) {

            if (!path) {

                return null
            }

            for (var i = 0; i < path.paths.length; ++i) {

                var floorPath = path.paths[i]

                if (floorPath.floorId === _floorId) {

                    return floorPath.position
                }
            }

            return null
        }

        function getMapScale() {

            return _mapScale
        }

        function getMapRotate() {

            return _mapRotate
        }

        this.getMapScale = getMapScale

        this.getMapRotate = getMapRotate

        this.refreshUnits = refreshUnits

        this.detach = detach

        this.attachTo = attachTo

        this.addEvents = addEvents

        this.setPos = setPos

        this.addMarker = addMarker

        this.resetMap = resetMap

        this.birdLook = birdLook

        this.showRoutePath = showRoutePath

        this.getMapViewMatrix = getMapViewMatrix

        this.getSvgPos = getSvgPos

        this.updateUnitsColor = updateUnitsColor

        this.clearUnitsColor = clearUnitsColor

        this.getMapPos = getMapPos

        this.zoom = zoom

        this.scroll = scroll

        this.rotate = rotate

        this.centerPos = centerPos

        this.updateDisplay = updateDisplay

        this.updateRoutePath = updateRoutePath

        this.root = function () {

            return _map
        }
    }

    module.exports = idrGlMap
});