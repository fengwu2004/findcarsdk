/**
 * Created by yan on 01/03/2017.
 */

import idrNetwork from './idrNetworkManager.js'

function idrDataManager() {
    
    this.regionAllInfo = null
}

idrDataManager.prototype.loadRegionInfo = function (regionId, success, failed) {
    
    var that = this
    
    idrNetwork.serverCallRegionAllInfo(regionId, function (response) {
        
        that.regionAllInfo = response
        
        if (typeof success === "function") {
            
            success(that.regionAllInfo)
        }
    }, failed)
}

var idrDataMgr = new idrDataManager()

export { idrDataMgr as default }