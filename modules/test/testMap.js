/**
 * Created by yan on 28/02/2017.
 */

seajs.use([
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/idrMapView',
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/IDRMapMarker/IDRMapMarker',
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/idrLocationServer'], function (idrMapView, idrMapMarker, idrLocationServer) {

    var regionId = '14639999225470024'

    var floorId = '14639999239840621'

    var map = new idrMapView()

    map.addEventListener(map.eventTypes.onInitMapSuccess, function(regionEx) {

        map.changeFloor(regionEx.floorList[0].id)

        var locator = new idrLocationServer();

        locator.start(regionId, floorId, didLocateSuccess);

        function didLocateSuccess(str) {

            alert(str);
        }
    })

    map.initMap('2b497ada3b2711e4b60500163e0e2e6b', 'main', regionId)
});