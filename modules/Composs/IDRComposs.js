function Composs(id, defaultDegree, map) {
    
    var _composs = document.getElementById(id);
    
    var _mapview = map
    
    var _currentValue = 0;
    
    _composs.addEventListener('click', onCompossClick)
    
    function onCompossClick() {
        
        _mapview.resetMap()
    }
    
    function rotateToDegree(degree) {
        
        _currentValue = degree
        
        _composs.style.transform = "rotate(" + _currentValue + "deg)";
    }
    
    this.rotateToDegree = rotateToDegree
};

export { Composs as default }