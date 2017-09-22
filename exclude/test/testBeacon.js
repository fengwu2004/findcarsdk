/**
 * Created by yan on 20/02/2017.
 */
seajs.use(['http://wx.indoorun.com/indoorun/app/yanli/indoorun/test/IdrBeaconMgr'], function (idrBeaconMgr) {

    var beaconMgr = new idrBeaconMgr();

    beaconMgr.init();

    beaconMgr.onBeaconReceiveFunc = onUpdateBeacons;

    function onUpdateBeacons(beacons) {

        showBeacons(beacons);
    }

    function showBeacons(beacons) {

        var beaconsdiv = document.querySelector('#beacons');

        if (!beaconsdiv) {

            beaconsdiv = document.createElement('div');

            beaconsdiv.id = 'beacons';

            var page = document.getElementById('main');

            page.appendChild(beaconsdiv);
        }

        var html = '';

        var valid = 0;

        for (var i = 0; i < beacons.length; ++i) {

            html += '<p>' + beacons[i].minor + ', ' + beacons[i].major + ', ' + beacons[i].rssi + '</p>';

            if (beacons[i].rssi == 0) {

                ++valid;
            }
        }

        showValidCount(valid, beacons.length);

        beaconsdiv.innerHTML = html;
    }

    function showValidCount(valid, total) {

        var validCount = document.querySelector('#validCount');

        if (!validCount) {

            validCount = document.createElement('p');

            validCount.id = 'validCount';

            var page = document.getElementById('main');

            page.appendChild(validCount);
        }

        var str = valid + '/' + total;

        validCount.innerText = str;
    }
});