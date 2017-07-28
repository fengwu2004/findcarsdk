/**
 * Created by yan on 28/02/2017.
 */

var regionId = '14428254382730015'

var idrMapView = map.default.idrMapView

var map = new idrMapView()

map.initMap('2b497ada3b2711e4b60500163e0e2e6b', 'main', regionId)

map.addEventListener(map.eventTypes.onFloorChangeSuccess, function(data) {
    
    console.log(data)
})

map.addEventListener(map.eventTypes.onInitMapSuccess, function(regionEx) {
    
    map.changeFloor(regionEx.floorList[0].id)
})
