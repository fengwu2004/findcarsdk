/**
 * 邻接矩阵单元
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathLengthPreIndex(length, proIndex) {

        var _length = length;//路径长度

        var _proIndex = proIndex;//前驱节点

        this.getLength = function() {

            return length;
        }

        this.setLength = function(length) {

            _length = length;
        }

        this.getProIndex = function() {

            _proIndex;
        }

        this.setProIndex = function(proIndex) {

            _proIndex = proIndex;
        }
    }

    module.exports = PathLengthPreIndex
})

