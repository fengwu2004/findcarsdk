/**
 * Region完整路径数据
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function RegionPath() {

        this.floorPath = [];//楼层路径数据
        this.footPath = null;//人行贯通路径数据
        this.carPath = null;//车行贯通路径数据
    }

    RegionPath.prototype.getFloorPath = function() {

        return this.floorPath;
    }

    RegionPath.prototype.setFloorPath = function(floorPath) {

        this.floorPath = floorPath;
    }

    RegionPath.prototype.getFootPath = function() {

        return this.footPath;
    }

    RegionPath.prototype.setFootPath = function(footPath) {

        this.footPath = footPath;
    }

    RegionPath.prototype.getCarPath = function() {

        return this.carPath;
    }

    RegionPath.prototype.setCarPath = function(carPath) {

        this.carPath = carPath;
    }

    module.exports = RegionPath
})
