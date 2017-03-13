/**
 * 贯通路径数据
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function ThroughPathStructure() {

        this.positions = [];//节点集合

        this.matrix = null;//邻接矩阵
    }

    ThroughPathStructure.prototype.getPositions = function() {

        return this.positions;
    }

    ThroughPathStructure.prototype.setPositions = function(positions) {

        this.positions = positions;
    }

    ThroughPathStructure.prototype.getMatrix = function() {

        return this.matrix;
    }

    ThroughPathStructure.prototype.setMatrix = function(matrix) {

        this.matrix = matrix;
    }

    module.exports = ThroughPathStructure
})

