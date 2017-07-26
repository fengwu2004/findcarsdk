/**
 * Created by yan on 28/02/2017.
 */

import idrMapView from '../idrMapView.js'
import idrMapMarker from '../IDRMapMarker/IDRMapMarker.js'

var regionId = '14428254382730015'

var units = []

//F1:14428254382890016 F2:14557583851000004 regionId:14428254382730015

var map = new idrMapView()

var startPos = null

var endPos = null

var startMarker = null

var endMarker = null

var IdrCarMarker = idrMapMarker['IDRCarMarker']

map.initMap('2b497ada3b2711e4b60500163e0e2e6b', 'main', regionId)

map.addEventListener(map.eventTypes.onFloorChangeSuccess, function(data) {
    
    console.log(data)
})

map.addEventListener(map.eventTypes.onInitMapSuccess, function(regionEx) {
    
    map.changeFloor(regionEx.floorList[0].id)
})

map.addEventListener(map.eventTypes.onMapClick, function (data) {
    
    console.log(data)
})

var _unit = null

map.addEventListener(map.eventTypes.onUnitClick, function(unit) {
    
    doNavi(unit)
    
    // _unit = unit
})

function changeUnitColor(unit) {
    
    map.updateUnitsColor([unit], 0xff0000)
}

function addMarker(unit) {
    
    var marker = new IdrCarMarker(unit.getPos())
    
    map.addMarker(marker)
}

function doDyNavi(unit) {
    
    if (startPos == null) {
        
        startPos = unit.getPos()
        
        startMarker = new IdrCarMarker(startPos)
        
        map.addMarker(startMarker)
        
        return
    }
    
    if (endPos == null) {
        
        endPos = unit.getPos()
        
        endMarker = new IdrCarMarker(endPos)
        
        map.addMarker(endMarker)
        
        map.doRoute(startPos, endPos)
    }
}

function doNavi(unit) {
    
    if (startPos == null) {
        
        startPos = unit.getPos()
        
        startMarker = new IdrCarMarker(startPos)
        
        map.addMarker(startMarker)
        
        return
    }
    
    if (endPos == null) {
        
        endPos = unit.getPos()
        
        endMarker = new IdrCarMarker(endPos)
        
        map.addMarker(endMarker)
        
        map.doRoute(startPos, endPos)
    }
}

var startBtn = document.getElementById('startButton')

startBtn.addEventListener('click', onStart)

function onStart() {
    
    map.updateUnitsColor([_unit], 0x00A000)
}

var endBtn = document.getElementById('endButton')

endBtn.addEventListener('click', onEnd)

function onEnd() {
    
    endPos = unit.getPos()
    
    endMarker = new IdrCarMarker(endPos)
    
    map.addMarker(endMarker)
    
    map.doRoute(map.userPos(), endPos)
}

var navigateBtn = document.getElementById('navigateButton')

navigateBtn.addEventListener('click', onNavigate)

function onNavigate() {
    
    map.stopRoute()
    
    map.removeMarker(startMarker)
    
    map.removeMarker(endMarker)
    
    startPos = null
    
    endPos = null
}