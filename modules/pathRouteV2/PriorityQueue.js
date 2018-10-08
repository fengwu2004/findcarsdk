function QueEle(ele, priority){ //封装我们的元素为一个对象
	
	this.ele = ele; //元素
	
	this.priority = priority; //优先级
}

export class PriorityQueue {
	
	constructor() {
		
		this.items = [];
	}
	
	enqueue(ele, priority) {
		
		// console.log(JSON.stringify(ele))
		
		var queObj = new QueEle(ele, priority); //创建队列元素对象
		
		if(this.isEmpty()){ //如果队列是空的，直接插入
			
			this.items.push(queObj);
		}
		else{
			
			var bAdded = false;
			
			for(var i = 0, len = this.items.length; i < len; i++){
				
				if(priority < this.items[i].priority){
					
					this.items.splice(i, 0, queObj); // 循环队列，如果优先级小于这个位置元素的优先级，插入
					
					bAdded = true;
					
					break;
				}
			}
			
			if(!bAdded){
				
				this.items.push(queObj); // 如果循环一圈都没有找到能插队的位置，直接插入队列尾部
			}
		}
	};
	
	dequeue() {
		
		return this.items.shift();
	};
	
	front() {
		
		return this.items[0];
	};
	
	isEmpty() {
		
		return this.items.length === 0;
	};
	
	size() {
		return this.items.length;
	};
	
	clear() {
		this.items= [];
	};
	
	print() {
		//这个地方稍微修改一下下
		var temp = [];
		for(var i = 0, len = this.items.length; i < len; i++){
			temp.push(this.items[i].ele);
		}
		console.log(temp.toString());
	};
}
