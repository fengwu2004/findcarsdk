/**
 * Created by ky on 17-4-21.
 */

define(function (require, exports, module) {

    var networkManager = require('./idrNetworkManager');

    function IDRRegionEx(regionAllInfo) {

        for (var key in regionAllInfo) {

            this[key] = regionAllInfo[key]
        }

        this.floorSvgs = {}

        var that = this

        var floorList = this.floorList
        
        function getFloorbyId(floorId) {

            for (var i = 0; i < floorList.length; ++i) {

                var floor = floorList[i]

                if (floor.id === floorId) {

                    return floor
                }
            }

            return null
        }

        function getUnitById(floorId, unitId) {

            var floor = getFloorbyId(floorId)

            if (floor == null) {

                return null
            }

            for (var i = 0; i < floor.unitList.length; ++i) {

                var unit = floor.unitList[i]

                if (unit.id === unitId) {

                    return unit
                }
            }

            return null
        }

        function allLoaded() {

            for (var i = 0; i < floorList.length; ++i) {

                var floorId = floorList[i].id

                if (!(floorId in that.floorSvgs)) {

                    return false
                }
            }

            return true
        }

        function loadMaps(callBack) {

            for (var i = 0; i < floorList.length; ++i) {

                var floorId = floorList[i].id

                networkManager.serverCallSvgMap(that.id, floorId, function(data) {

                    that.floorSvgs.floorId = data

                    if (allLoaded()) {

                        console.log('所有地图数据加载成功')
                        typeof callBack == "function" && callBack()
                    }

                }, function(data) {

                    console.log('地图数据获取失败!' + data);
                })
            }
        }
        
        this.getFloorbyId = getFloorbyId

        this.getUnitById = getUnitById

        this.loadMaps = loadMaps
    }

    module.exports = IDRRegionEx
});
