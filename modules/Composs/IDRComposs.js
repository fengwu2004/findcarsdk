function Composs(id, defaultDegree, map) {
    
    var _composs = document.getElementById(id);
    
    var _mapview = map
    
    var _currentValue = 0
    
    var _lastClickTime = null
    
    _composs.addEventListener('click', onCompossClick)
    
    function onCompossClick() {
        
        var time = new Date()
        
        if (!_lastClickTime || time.getTime() - _lastClickTime > 2000) {
    
            _mapview.resetMap()
    
            _lastClickTime = time.getTime()
        }
    }
    
    function rotateToDegree(degree) {
        
        _currentValue = degree
        
        _composs.style.transform = "rotate(" + _currentValue + "deg)";
    }
    
    this.rotateToDegree = rotateToDegree
};

export { Composs as default }