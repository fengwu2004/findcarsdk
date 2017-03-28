/**
 * 完整路径结果
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathResult() {

        this.paths = null;//每段路径数据[FloorPath]

        this.distance = 0;//全路径的总距离
    }

    module.exports = PathResult
})

