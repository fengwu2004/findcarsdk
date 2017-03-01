/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {

    function idrFloorList() {

        this.map = null

        this.floorList = Array()

        this.currentFloor = null

        this.changeFloorFunc = null
    }

    idrFloorList.prototype.init = function (map, floorList) {

        this.map = map

        this.floorList = floorList

        this.currentFloor = this.floorList[0]

        _createContainer(this)
    }

    function _createContainer(obj) {

        var lc_div = jsLib.createElement("div")

        lc_div.id = "lc_div"

        lc_div.class = "lc_dic"

        map.appendChild(lc_div)

        var currentNameDiv = jsLib.createElement("div")

        currentNameDiv.id = "currName"

        currentNameDiv.class = "lc_div1 lc_divcom"

        lc_div.appendChild(currentNameDiv)

        var title = jsLib.createElement("span")

        currentNameDiv.appendChild(title)

        title.innerText = obj.currentFloor.name
    }

    module.exports = idrFloorList;
})

