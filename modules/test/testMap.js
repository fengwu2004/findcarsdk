/**
 * Created by yan on 28/02/2017.
 */

modules = 'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/'

seajs.use([
    modules + 'idrMapView',
    modules + 'IDRMapMarker'], function (idrMapView, idrMapMarker) {

    var regionId = '14428254382730015'

    var map = new idrMapView()

    var startPos = null

    var endPos = null

    var IdrCarMarker = idrMapMarker['IDRCarMarker']

    map.initMap('2b497ada3b2711e4b60500163e0e2e6b', 'main', regionId)

    map.addEventListener(map.eventTypes.onFloorChangeSuccess, function(data) {

        console.log(data)
    })

    map.addEventListener(map.eventTypes.onInitMapSuccess, function(regionEx) {

        map.changeFloor(regionEx.floorList[0].id)
    })

    map.addEventListener(map.eventTypes.onUnitClick, function(unit) {

        if (startPos == null) {

            startPos = unit.getPos()

            var marker = new IdrCarMarker(startPos)

            map.addMarker(marker)
        }

        if (endPos == null) {

            endPos = unit.getPos()

            var marker = new IdrCarMarker(endPos)

            map.addMarker(marker)

            map.navi
        }
    })

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