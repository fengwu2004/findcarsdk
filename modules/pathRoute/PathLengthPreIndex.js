/**
 * 邻接矩阵单元
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathLengthPreIndex(length, proIndex) {

        this.length = length;//路径长度

        this.proIndex = proIndex;//前驱节点
    }

    module.exports = PathLengthPreIndex
});