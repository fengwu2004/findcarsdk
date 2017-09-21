
function Position() {
    
    this.x = 0;
    
    this.y = 0;
}

Position.prototype.getX = function() {
    
    return this.x;
}

Position.prototype.setX = function(x) {
    
    this.x = x;
}

Position.prototype.getY = function() {
    
    return this.y;
}

Position.prototype.setY = function(y) {
    
    this.y = y;
}

Position.prototype.hashCode = function() {
    
    return this.x + this.y;
}

Position.prototype.equals = function(obj) {
    
    if (obj == null || !(obj instanceof Position)) {
        
        return false;
    }
    
    if (this.x != pos.x || this.y != pos.y) {
        
        return false;
    }
    
    
    return true;
}

Position.prototype.compareTo = function(o) {
    
    if (this.getX() < o.getX()) {
        return -1;
    }
    else if (this.getX() > o.getX()) {
        return 1;
    }
    else if (this.getY() < o.getY()) {
        return -1;
    }
    else if (this.getY() > o.getY()) {
        return 1;
    }
    else {
        return 0;
    }
}

Position.prototype.string = function() {
    
    return this.x + "," + this.y;
}

export { Position as default }