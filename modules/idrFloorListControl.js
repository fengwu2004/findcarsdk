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

        var that = this

        var lc_div = create('div', 'lc_div', 'lc_div')

        this.map.append(lc_div)

        createFloorDiv(lc_div, this.currentFloor, this.floorList)
    }
    
    function create(ele, id, classname) {

        var div = document.createElement(ele)

        if (id !== null) {

            div.id = id
        }

        if (classname !== null) {

            div.className = classname
        }

        return div
    }

    function createCurrName(currentFloor) {

        var div = create('div', 'currName', 'lc_div1 lc_divcom')

        var title = document.createElement("span")

        title.innerText = currentFloor.name

        div.appendChild(title)

        return div
    }

    function floorDiv(currentFloor, floorList) {

        var divs = []

        floorList.forEach(function (item, index) {

            var div = create('div', item.id, 'lc_div2 lc_divcom')

            div.innerText = item.name

            var span = create('span', null, 'lc_dot')

            span.innerText = '●'

            div.appendChild(span)

            if (currentFloor.id === item.id) {

                span.style.opacity = 1

                div.className == 'lc_div3 lc_divcom'
            }

            divs.push(div)
        })

        return divs
    }

    function createFloorDiv(div, currentFloor, floorList) {

        var currentNameDiv = createCurrName(currentFloor)

        div.appendChild(currentNameDiv)

        var floorDiv = create('div', 'floorDiv', 'lc_outo')

        var floorDivs = floorDiv(currentFloor, floorList)

        floorDivs.forEach(function (item, index) {

            floorDiv.appendChild(floorDivs)
        })

        div.appendChild(floorDiv)
    }

    module.exports = idrFloorListControl;
})

