/**
 * Created by ky on 17-4-21.
 */

define(function (require, exports, module) {

    function IDRRegionEx(regionAllInfo) {

        for (var key in regionAllInfo) {

            this[key] = regionAllInfo[key]
        }
        
        this.getFloorbyId = function(floorId) {

            for (var i = 0; i < this.floorList.length; ++i) {

                var floor = this.floorList[i]

                if (floor.id === floorId) {

                    return floor
                }
            }

            return null
        }
        
        this.getFloorByName = function(floorName) {

            for (var i = 0; i < this.floorList.length; ++i) {

                var floor = this.floorList[i]

                if (floor.name === floorName) {

                    return floor
                }
            }

            return null
        }
    }

    module.exports = IDRRegionEx
});
