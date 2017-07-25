/**
 * Created by ky on 17-5-4.
 */
function idrUnit(unitInfo) {
    
    for (var key in unitInfo) {
        
        this[key] = unitInfo[key]
    }
    
    var that = this
    
    this.getPos = function() {
        
        var x = 0.5 * (that.boundLeft + that.boundRight)
        
        var y = 0.5 * (that.boundTop + that.boundBottom)
        
        return {x:x, y:y, floorId:that.floorId}
    }
    
    var _pts = null
    
    function getPts() {
        
        if (_pts) {
            
            return _pts
        }
        
        var pts = getPolygon().split(' ')
        
        _pts = []
        
        for (var i = 0; i < pts.length; ++i) {
            
            var p = pts[i].split(',').map(Number)
            
            var temp = YFM.Math.Vector.pos(p[0], p[1])
            
            _pts.push(temp)
        }
        
        return _pts
    }
    
    function getPolygon() {
        
        if (that.points) {
            
            return that.points
        }
        
        var left = that.boundLeft
        
        var top = that.boundTop
        
        var right = that.boundRight
        
        var bottom = that.boundBottom
        
        that.points = left + ',' + top + ' ' + right + ',' + top + ' ' + right + ',' + bottom + ' ' + left + ',' + bottom
        
        return that.points
    }
    
    this.color = null
    
    this.getPolygon = getPolygon
    
    this.getPts = getPts
}

export { idrUnit as default }