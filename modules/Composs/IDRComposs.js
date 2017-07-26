var css = document.createElement('link')

css.type = 'text/css';

css.rel = 'stylesheet';

css.href = "http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/Composs/IDRComposs.css";

var header = document.querySelector("head");

header.appendChild(css)

var Composs = function(id, defaultDegree, map) {
    
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