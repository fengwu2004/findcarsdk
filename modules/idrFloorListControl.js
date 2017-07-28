/**
 * Created by yan on 23/01/2017.
 */


function showOrHide(id, show) {

    var ele = document.getElementById(id)
    
    if (!ele) {
    
        return
    }
    
    if (show) {
    
        ele.classList.remove('fadeout')
        
        ele.classList.add('fadein')
    }
    else {
    
        ele.classList.remove('fadein')
    
        ele.classList.add('fadeout')
    }
}

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
    
    var _floorList = []
    
    var _currentFloor = null
    
    var _locateFloor = null
    
    var _mainDiv = null
    
    var _titleDiv = null
    
    var _currentNameDiv = null
    
    var _floorDiv = null
    
    var _onChangeFloor = null
    
    var _delegator = null
    
    function findFloorById(floorId){
        
        var result = null
        
        _floorList.forEach(function(floor, index) {
            
            if (floor.id == floorId) {
                
                result = floor
                
                return false
            }
        })
        
        return result
    }
    
    function createFloorList(currentFloor, locateFloor, floorList) {
        
        var temp = createCurrName(currentFloor)
        
        _currentNameDiv = temp[0]
        
        _titleDiv = temp[1]
        
        _floorDiv = create('div', 'floorDiv', 'lc_outo')
        
        var floorDivs = createFloorDiv(currentFloor, locateFloor, floorList)
        
        floorDivs.forEach(function (item, index) {
            
            _floorDiv.appendChild(item)
        })
        
        _mainDiv.appendChild(_currentNameDiv)
        
        _mainDiv.appendChild(_floorDiv)
    
        showOrHide('floorDiv', false)
        
        addTaps(self);
    }
    
    function refreshDisplay() {
        
        _titleDiv.innerText = _currentFloor.name
        
        var divs = Array.prototype.slice.call(_floorDiv.children)
        
        divs.forEach(function(div, index) {
            
            if (div.id === _currentFloor.id) {
                
                div.className = 'lc_div3 lc_divcom'
            }
            else  {
                
                div.className = 'lc_div2 lc_divcom'
            }
        })
    }
    
    function addTaps() {
        
        var floorDiv = document.getElementById("floorDiv")
        
        var currentNameDiv = document.getElementById("currName")
        
        currentNameDiv.click(function () {
            
            if (floorDiv.toDom().style.display === 'block') {
    
                showOrHide('floorDiv', false)
            }
            else {
    
                showOrHide('floorDiv', true)
            }
        })
        
        var divs = floorDiv.getElementsByClassName('lc_divcom')
        
        for (var i = 0; i < divs.length; ++i) {
    
            divs[i].addEventListener('click', function () {
    
                showOrHide(this.id, false)
    
                showOrHide('floorDiv', false);
    
                if (typeof _onChangeFloor == 'function') {
        
                    _onChangeFloor.call(_delegator, this.id)
                }
    
                self.setCurrentFloor(this.id)
            })
        }
    }
    
    function init(container, floorList, currentFloor) {
        
        _floorList = floorList
        
        _currentFloor = currentFloor
        
        _locateFloor = _floorList[0]
        
        _mainDiv = create('div', 'lc_div', 'lc_div')
        
        container.appendChild(_mainDiv)
        
        createFloorList(_currentFloor, _locateFloor, _floorList)
    }
    
    function setCurrentFloor(floorId) {
        
        _currentFloor = findFloorById(floorId)
        
        refreshDisplay()
    }
    
    function setChangeFloorFunc(delegate, callBack) {
        
        _onChangeFloor = callBack
        
        _delegator = delegate
    }
    
    this.setCurrentFloor = setCurrentFloor
    
    this.setChangeFloorFunc = setChangeFloorFunc
    
    this.init = init
}

export { idrFloorListUi as default }
