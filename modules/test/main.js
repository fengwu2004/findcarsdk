/**
 * Created by yan on 27/02/2017.
 */



seajs.use([
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/test/idrLocateServer',
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/test/global',
    'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/loadmap'], function (
        idrLocateServer,
        gv,
        idrMapView) {

    gv.loadSessionSuccess = function () {

        var locator = new idrLocateServer();

        locator.start('14428254382730015', '14557583851000004', didLocateSuccess);

        function didLocateSuccess(str) {

            alert(str);
        }
    };

    gv.init();
});