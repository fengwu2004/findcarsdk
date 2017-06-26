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

    map.addEventListener(map.eventTypes.onMapClick, function (data) {

        console.log(data)
    })

    map.addEventListener(map.eventTypes.onUnitClick, function(unit) {

        addMarker(unit)
    })

    function addMarker(unit) {

        var marker = new IdrCarMarker(unit.getPos())

        map.addMarker(marker)
    }
    
    function doNavi(unit) {

        if (startPos == null) {

            startPos = unit.getPos()

            var marker = new IdrCarMarker(startPos)

            map.addMarker(marker)

            return
        }

        if (endPos == null) {

            endPos = unit.getPos()

            var marker = new IdrCarMarker(endPos)

            map.addMarker(marker)

            map.doRoute(startPos, endPos)
        }
    }

    var startBtn = document.getElementById('startButton')

    startBtn.addEventListener('click', onStart)

    function onStart() {

        console.log('onStart')
    }

    var endBtn = document.getElementById('endButton')

    endBtn.addEventListener('click', onEnd)

    function onEnd() {

        console.log('onEnd')
    }

    var navigateBtn = document.getElementById('navigateButton')

    navigateBtn.addEventListener('click', onNavigate)

    function onNavigate() {

        console.log('onNavigate')
    }
});