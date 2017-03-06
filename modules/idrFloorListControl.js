/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {

    var commMethods = require('./idrCommonMethod')

    function idrFloorListControl() {

        this.onChangeFloor = null
    }

    idrFloorListControl.prototype.init = function (map, floorList) {

        this.map = map

        this.floorList = floorList

        this.locateFloor = null

        this.currentFloor = this.floorList[0]

        var lc_div = create('div', 'lc_div', 'lc_div')

        this.map.append(lc_div)

        this.div = lc_div

        createFloorList(this, this.currentFloor, this.locateFloor, this.floorList)
    }

    idrFloorListControl.prototype.setCurrentFloor = function (floor) {

        this.currentFloor = floor

        this.refreshDisplay()
    }

    idrFloorListControl.prototype.refreshDisplay = function () {

        this.title.innerText = this.currentFloor.name
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

        return [div, title]
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

    function createFloorList(self, currentFloor, locateFloor, floorList) {

        var temp = createCurrName(currentFloor)

        self.currentNameDiv = temp[0]

        self.title = temp[1]

        self.floorDiv = create('div', 'floorDiv', 'lc_outo')

        var floorDivs = createFloorDiv(currentFloor, locateFloor, floorList)

        floorDivs.forEach(function (item, index) {

            self.floorDiv .appendChild(item)
        })

        self.div.appendChild(self.currentNameDiv)

        self.div.appendChild(self.floorDiv)

        commMethods.showOrHidddenDiv('floorDiv', false)

        addTaps(self);
    }

    function addTaps(self) {

        self.currentNameDiv.tap(function () {

            if (self.floorDiv.toDom().style.display === 'block') {

                commMethods.showOrHidddenDiv('floorDiv', false);
            }
            else {

                commMethods.showOrHidddenDiv('floorDiv', true)
            }
        })

        self.floorDiv.find('div').tap(function () {

            commMethods.showOrHidddenDiv('floorDiv', false);

            if (typeof self.onChangeFloor == 'function') {

                self.onChangeFloor(this.id)
            }
        })
    }

    module.exports = idrFloorListControl;
})

