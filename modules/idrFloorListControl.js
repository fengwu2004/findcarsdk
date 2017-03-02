/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {

    function idrFloorListControl() {

        this.map = null

        this.floorList = Array()

        this.currentFloor = null

        this.changeFloorFunc = null
    }

    idrFloorListControl.prototype.init = function (map, floorList) {

        this.map = map

        this.floorList = floorList

        this.currentFloor = this.floorList[0]

        _createContainer(this)
    }

    function _createContainer(obj) {

        var lc_div = document.createElement("div")

        lc_div.id = "lc_div"

        lc_div.className = "lc_div"

        obj.map.appendChild(lc_div)

        var currentNameDiv = document.createElement("div")

        currentNameDiv.id = "currName"

        currentNameDiv.className = "lc_div1 lc_divcom"

        lc_div.appendChild(currentNameDiv)

        var title = document.createElement("span")

        currentNameDiv.appendChild(title)

        title.innerText = obj.currentFloor.name

        var floorDivs = _createList(this.floorList)

        floorDivs.forEach(function(obj, index) {

            lc_div.appendChild(obj)
        })
    }

    function _createList(data) {

        var divs = []

        data.forEach(function(obj, index) {

            var div = document.createElement('div')

            div.id = obj.id

            div.className = 'lc_div2 lc_divcom'

            div.innerText = obj.name

            divs.push(div)
        });

        return divs
    };

    module.exports = idrFloorListControl;
})

