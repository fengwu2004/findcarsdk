/**
 * 贯通节点数据
 *
 * @author Administrator
 *
 */


function PassUnit() {
    
    var _floorIndex;// 楼层下标
    var _unitTypeId; // 0:自定义类型;1:自动扶梯;2:电梯;3:卫生间;4:取款机;5:出口;6:点状图标;7:入口;8:安全出口;9:楼梯;10:洗车;11:收费处;12:区域
    var _unitId;
    var _pos;// 节点坐标
    
    var self = this
    
    this.getFloorIndex = function() {
        
        return _floorIndex;
    }
    
    this.setFloorIndex = function(floorIndex) {
        
        _floorIndex = floorIndex;
    }
    
    this.getUnitTypeId = function() {
        
        return _unitTypeId;
    }
    
    this.setUnitTypeId = function(unitTypeId) {
        
        _unitTypeId = unitTypeId;
    }
    
    this.getPos = function() {
        
        return _pos;
    }
    
    this.setPos = function(pos) {
        
        _pos = pos;
    }
    
    this.getUnitId = function() {
        
        return _unitId;
    }
    
    this.setUnitId= function(unitId) {
        
        _unitId = unitId;
    }
    
    this.compareTo = function(o) {
        
        if (self.getFloorIndex() < o.getFloorIndex()) {
            
            return -1;
        }
        else if (self.getFloorIndex() > o.getFloorIndex()) {
            return 1;
        }
        else if (self.getPos().getX() < o.getPos().getX()) {
            return -1;
        }
        else if (self.getPos().getX() > o.getPos().getX()) {
            return 1;
        }
        else if (self.getPos().getY() < o.getPos().getY()) {
            return -1;
        }
        else if (self.getPos().getY() > o.getPos().getY()) {
            return 1;
        }
        else {
            return 0;
        }
    }
    
}

export { PassUnit as default }