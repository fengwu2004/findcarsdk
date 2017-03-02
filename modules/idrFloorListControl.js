/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {

    var commMethods = require('./idrCommonMethod')

    function idrFloorListControl() {

        this.map = null

        this.floorList = Array()

        this.currentFloor = null

        this.locateFloor = null

        this.div = null
    }

    idrFloorListControl.prototype.init = function (map, floorList) {

        this.map = map

        this.floorList = floorList

        this.currentFloor = this.floorList[0]

        var that = this

        var lc_div = create('div', 'lc_div', 'lc_div')

        this.map.append(lc_div)

        this.div = lc_div

        createFloorList(lc_div, this.currentFloor, this.locateFloor, this.floorList)
    }

    idrFloorListControl.prototype.setCurrentFloor = function (floor) {

        this.currentFloor = floor

        this.refreshDisplay()
    }

    idrFloorListControl.prototype.refreshDisplay = function () {

        
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

    function createFloorDiv(currentFloor, locateFloor, floorList) {

        var divs = []

        floorList.forEach(function (item, index) {

            var div = create('div', item.id, 'lc_div2 lc_divcom')

            div.innerText = item.name

            var span = create('span', null, 'lc_dot')

            span.innerText = '●'

            span.style.opacity = 0

            div.appendChild(span)

            if (currentFloor && currentFloor.id === item.id) {

                div.className = 'lc_div3 lc_divcom'
            }

            if (locateFloor && locateFloor.id === item.id) {

                span.style.opacity = 0.5
            }

            divs.push(div)
        })

        return divs
    }

    function createFloorList(div, currentFloor, locateFloor, floorList) {

        var currentNameDiv = createCurrName(currentFloor)

        div.appendChild(currentNameDiv)

        var floorDiv = create('div', 'floorDiv', 'lc_outo')

        var floorDivs = createFloorDiv(currentFloor, locateFloor, floorList)

        floorDivs.forEach(function (item, index) {

            floorDiv.appendChild(item)
        })

        div.appendChild(floorDiv)

        commMethods.showOrHidddenDiv('floorDiv', false)

        addTaps();
    }

    function addTaps() {

        var floorDiv = jsLib("#floorDiv")

        var currentNameDiv = jsLib("#currName")

        currentNameDiv.tap(function () {

            if (floorDiv.toDom().style.display === 'block') {

                commMethods.showOrHidddenDiv('floorDiv', false);
            }
            else {

                commMethods.showOrHidddenDiv('floorDiv', true)
            }
        })

        floorDiv.find('div').tap(function () {

            console.log(this.id)
        })
    }

    module.exports = idrFloorListControl;
})

