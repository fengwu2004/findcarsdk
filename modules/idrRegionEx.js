/**
 * Created by ky on 17-4-21.
 */

define(function (require, exports, module) {

    function IDRRegionEx(regionAllInfo) {

        for (var key in regionAllInfo) {

            this[key] = regionAllInfo[key]
        }
        
        this.getFloorbyId = function(floorId) {

            for (var floor in this.floorList) {

                if (floor.floorId === floorId) {

                    return floor
                }
            }

            return null
        }
        
        this.getFloorByName = function(floorName) {

            for (var floor in this.floorList) {

                if (floor.name === floorName) {

                    return floor
                }
            }

            return null
        }
    }

    module.exports = IDRRegionEx
});
