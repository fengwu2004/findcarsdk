/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {

    var commMethods = require('./idrCommonMethod')

    function createCurrName(floor) {

        var div = create('div', 'currName', 'lc_div1 lc_divcom')

        var title = document.createElement("span")

        title.innerText = floor.name

        div.appendChild(title)

        return [div, title]
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

    function createFloorDiv(currentFloor, locateFloor, floorList) {

        var divs = []

        floorList.forEach(function (floor, index) {

            var div = create('div', floor.id, 'lc_div2 lc_divcom')

            div.innerText = floor.name

            var span = create('span', null, 'lc_dot')

            span.innerText = '●'

            span.style.opacity = 0

            div.appendChild(span)

            if (currentFloor && currentFloor.id === floor.id) {

                div.className = 'lc_div3 lc_divcom'
            }

            if (locateFloor && locateFloor.id === floor.id) {

                span.style.opacity = 0.5
            }

            divs.push(div)
        })

        return divs
    }

    function idrFloorListUi() {

        var self = this

        var floorList = []

        var currentFloor = null

        var locateFloor = null

        var mainDiv = null

        var titleDiv = null

        var currentNameDiv = null

        var floorDiv = null

        var onChangeFloor = null

        var locaIndex = 0

        var findFloorById = function(floorId){

            var result = null

            floorList.forEach(function(floor, index) {

                if (floor.id == floorId) {

                    result = floor

                    return false
                }
            })

            return result
        }

        var createFloorList = function(currentFloor, locateFloor, floorList) {

            var temp = createCurrName(currentFloor)

            currentNameDiv = temp[0]

            titleDiv = temp[1]

            floorDiv = create('div', 'floorDiv', 'lc_outo')

            var floorDivs = createFloorDiv(currentFloor, locateFloor, floorList)

            floorDivs.forEach(function (item, index) {

                floorDiv.appendChild(item)
            })

            mainDiv.appendChild(currentNameDiv)

            mainDiv.appendChild(floorDiv)

            commMethods.showOrHidddenDiv('floorDiv', false)

            addTaps(self);
        }

        var refreshDisplay = function() {

            titleDiv.innerText = currentFloor.name

            var divs = Array.prototype.slice.call(floorDiv.children)

            divs.forEach(function(div, index) {

                if (div.id === currentFloor.id) {

                    div.className = 'lc_div3 lc_divcom'
                }
                else  {

                    div.className = 'lc_div2 lc_divcom'
                }
            })
        }

        var addTaps = function() {

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

                commMethods.showOrHidddenDiv('floorDiv', false);

                if (typeof onChangeFloor == 'function') {

                    onChangeFloor(this.id)
                }

                self.setCurrentFloor(this.id)
            })
        }

        this.init = function(map, floorList_) {

            floorList = floorList_

            currentFloor = floorList[0]

            locateFloor = floorList[0]

            mainDiv = create('div', 'lc_div', 'lc_div')

            map.appendChild(mainDiv)

            createFloorList(currentFloor, locateFloor, floorList)
        }

        this.setCurrentFloor = function(floorId) {

            currentFloor = findFloorById(floorId)

            refreshDisplay()
        }

        this.setChangeFloorFunc = function(callBack) {

            onChangeFloor = callBack
        }
    }

    module.exports = idrFloorListUi;
})

