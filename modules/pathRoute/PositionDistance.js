/**
 * 点和距离的组合
 * @author Administrator
 *
 */

function PositionDistance() {
    
    this.position = null;
    
    this.distance = 0;
}

PositionDistance.prototype.getPosition = function() {
    
    return this.position;
}

PositionDistance.prototype.setPosition = function(position) {
    
    this.position = position;
}

PositionDistance.prototype.getDistance = function() {
    
    return this.distance;
}

PositionDistance.prototype.setDistance = function(distance) {
    
    this.distance = distance;
}

export { PositionDistance as default }
