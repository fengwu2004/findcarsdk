/**
 * 路径搜索结果
 * 
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function FloorPath() {

        var _floorIndex;// 路径所在楼层
        var _typeId;// 路径终点类型，0为终点，其余参考unitTypeId，分别表示楼梯、电梯等
        var _distance;// 路线距离
        var _position;// 路线点集

        this.getFloorIndex = function() {

            return _floorIndex;
        }

        this.setFloorIndex = function(floorIndex) {

            _floorIndex = floorIndex;
        }

        this.getTypeId = function() {

            return _typeId;
        }

        this.setTypeId = function(typeId) {

            _typeId = typeId;
        }

        this.getDistance = function() {

            return _distance;
        }

        this.setDistance = function(distance) {

            _distance = distance;
        }

        this.getPosition = function(){

            _position;
        }

        this.setPosition = function(position) {

            _position = position;
        }
    }

    module.exports = FloorPath
})

