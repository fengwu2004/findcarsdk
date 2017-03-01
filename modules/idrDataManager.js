/**
 * Created by yan on 01/03/2017.
 */

define(function(require, exports, module) {

    var idrNetwork = require('./idrNetworkManager')

    function idrDataManager() {

        this.regionAllInfo = null
    }

    idrDataManager.prototype.loadRegionInfo = function (regionId, success, failed) {

        var that = this

        idrNetwork.serverCallRegionAllInfo(regionId, function (response) {

            this.regionAllInfo = response

            if (typeof success === "function") {

                success()
            }
        }, failed)
    }

    var idrDataMgr = new idrDataManager()

    module.exports = idrDataMgr
})