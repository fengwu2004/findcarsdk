/**
 * Created by yan on 28/02/2017.
 */

seajs.use([
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/idrMapView',
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/IDRMapMarker/IDRMapMarker'], function (idrMapView, idrMapMarker) {

    var regionId = '14639999225470024'

    var idrCarMarker = idrMapMarker['IDRCarMarker']

    var map = new idrMapView()

    map.addEventListener(map.eventTypes.onUnitClick, function(unit) {

        var marker = new idrCarMarker(unit.getPos())

        map.addMarker(marker)
    })

    map.addEventListener(map.eventTypes.onFloorChangeSuccess, function(data) {

        console.log(data)
    })

    map.addEventListener(map.eventTypes.onInitMapSuccess, function(regionEx) {

        map.changeFloor(regionEx.floorList[0].id)
    })

    map.initMap('2b497ada3b2711e4b60500163e0e2e6b', 'main', regionId)
});