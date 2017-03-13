/**
 * 完整路径结果
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathResult() {

        var _paths;//每段路径数据
        var _distance;//全路径的总距离

        this.getPaths = function() {

            return _paths;
        }

        this.setPaths = function(paths) {

            _paths = paths;
        }

        this.getDistance = function() {

            return _distance;
        }

        this.setDistance = function(distance) {

            _distance = distance;
        }

    }

    module.exports = PathResult
})

