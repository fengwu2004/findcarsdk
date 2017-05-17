/**
 * Created by yan on 23/02/2017.
 */
seajs.use(['http://wx.indoorun.com/indoorun/app/yanli/indoorun/test/idrLocateServer', 'http://wx.indoorun.com/indoorun/app/yanli/indoorun/test/global'], function (idrLocateServer, gv) {

    gv.loadSessionSuccess = function () {

        var locator = new idrLocateServer();

        locator.start('14639999225470024', '14639999239840621', didLocateSuccess);

        function didLocateSuccess(str) {

            alert(str);
        }
    };

    gv.init();
});