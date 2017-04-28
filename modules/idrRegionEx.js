/**
 * Created by ky on 17-4-21.
 */

define(function (require, exports, module) {

    function IDRRegionEx(regionAllInfo) {

        for (var key in regionAllInfo) {

            this[key] = regionAllInfo[key]
        }
        
        function getFloorbyId(floorId) {

            for (var i = 0; i < this.floorList.length; ++i) {

                var floor = this.floorList[i]

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
        
        this.getFloorbyId = getFloorbyId

        this.getUnitById = getUnitById
    }

    module.exports = IDRRegionEx
});
