/**
 * 楼层路径数据
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathStructure() {

        var _lines;//线段集合
        var _positions;//节点集合
        var _matrix;//邻接矩阵

        this.getLines = function() {

            return _lines;
        }

        this.setLines = function(lines) {

            this.lines = lines;
        }

        this.getPositions = function() {

            return _positions;
        }

        this.setPositions = function(positions) {

            _positions = positions;
        }

        this.getMatrix = function() {

            return _matrix;
        }

        this.setMatrix = function(matrix) {

            _matrix = matrix;
        }

    }

    module.exports = PathStructure
})



