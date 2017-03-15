/**
 * 路径搜索结果
 * 
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function FloorPath() {

        this.floorIndex = null;// 路径所在楼层
        this.typeId = null;//路径终点类型，0为终点，其余参考unitTypeId，分别表示楼梯、电梯等(UnitType)
        this.distance = null;// 路线距离
        this.position = null;// 路线点集 array
    }

    module.exports = FloorPath
})