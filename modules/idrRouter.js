/**
 * Created by yan on 15/03/2017.
 */
define(function (require, exports, module) {

    var PathSearch = require('./pathRoute/PathSearch')

    var RegionPath = require('./pathRoute/idrRegionPathData')

    function idrRouter(regionId) {

        var _regionId = regionId

        var _pathSearch = new PathSearch(RegionPath)

        /**
         * @param start 起点
         * @param end 终点
         * @param car 是否车行
         * @return PathResult
         */
        this.router = function(start, end, car) {

            var result = _pathSearch.search(start.floorId, start.x, start.y, end.floorId, end.x, end.y, car, null)

            return result
        }
    }

    module.exports = idrRouter
});