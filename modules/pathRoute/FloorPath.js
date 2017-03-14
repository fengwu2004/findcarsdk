/**
 * 路径搜索结果
 * 
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function FloorPath() {

        this.floorIndex = null;// 路径所在楼层
        this.typeId = null;
        this.distance = null;// 路线距离
        this.position = null;// 路线点集
    }

    module.exports = FloorPath
})