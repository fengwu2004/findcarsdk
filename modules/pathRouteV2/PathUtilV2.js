import PositionDistance from "../pathRoute/PositionDistance";
import Position from "../pathRoute/Position";

var PathUtilV2 = (function() {

	function  findNearestLine(p, lines) {
		
		let index = 0;
		
		let minDes = Number.MAX_VALUE
		
		for (let i = lines.length - 1; i >= 0; i--) {
			
			let des = p2lDes(p, lines[i]).getDistance();
			
			if (des < minDes) {
				
				index = i;
				
				minDes = des;
			}
		}
		
		return index;
	}
	
	function  findNearestLine(p, lines){
		
		let index = 0;
		
		let minDes = Number.MAX_VALUE
		
		for (let i = lines.size() - 1; i >= 0; i--) {
			
			let des = p2lDes(p, lines.get(i)).getDistance();
			
			if (des < minDes) {
				
				index = i;
				
				minDes = des;
			}
		}
		return index;
	}
	
	
	function findNearestLine(p, positions, lines){
		
		let index = 0;
		
		let minDes = Number.MAX_VALUE
		
		for (let i = 0; i <lines.length; i+=2) {
			
			let des = p2lDes(p, positions[lines[i]],positions[lines[i+1]]).getDistance();
			
			if (des < minDes) {
				
				index = i;
				
				minDes = des;
			}
		}
		
		return index;
	}
	
	function findPositionIndex(pos, positions) {
		
		let left = 0;
	
		let right = positions.length - 1;
		
		let mid;
		
		while (left <= right) {
			
			mid = (left + right) >> 1;
			
			let t = pos.compareTo(positions[mid]);
			
			if (t < 0) {
				
				right = mid - 1;
			}
			else if (t == 0) {
				return mid;
			}
			else {
				left = mid + 1;
			}
		}
		
		return -1;
	}
	
	function p2pDes(a, b) {
		
		return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
	}
	

	function p2lDes(p, l) {
		
		return p2lDes(p.x, p.y, l.getEndPointOne().x, l.getEndPointOne().y,
			l.getEndPointTwo().x, l.getEndPointTwo().y);
	}
	
	function p2lDes(p, p1, p2){
		
		return dop2lDes(p.x, p.y, p1.x, p1.y,
			p2.x, p2.y);
	}
	
	function getPositionDistance(x, y, px, py) {
		
		var result = new PositionDistance();
		
		var  p = new Position();
		
		p.setX(px);
		
		p.setY(py);
		
		result.setPosition(p);
		
		result.setDistance(Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)));
		
		return result;
	}
	
	function dop2lDes(x, y, x1, y1, x2, y2) {
		
		var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
		if (cross <= 0)
			return getPositionDistance(x, y, x1, y1);
		var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
		if (cross >= d2)
			return getPositionDistance(x, y, x2, y2);
		var r = cross / d2;
		var px = x1 + (x2 - x1) * r;
		var py = y1 + (y2 - y1) * r;
		return getPositionDistance(x, y, px, py);
	}
	
	return {
		findNearestLine:findNearestLine,
		findPositionIndex:findPositionIndex,
		p2pDes:p2pDes,
		p2lDes:p2lDes,
	}
	
}())

export { PathUtilV2 as default }