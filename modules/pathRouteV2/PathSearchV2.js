/**
 * 路径搜索
 *
 * @author Administrator
 *
 */


const IGNORE_DES = 10;// 忽略距离，到路线投影点距离小于这一值的起始结束点将被忽略

import {PriorityQueue} from './PriorityQueue'
import {PathResultV2} from "./PathResultV2"
import PathUtilV2 from './PathUtilV2'
import {FPosition} from "./FPosition";

class QueueNode {
	
	constructor() {
		
		this.floor = null
		
		this.pos = null
		
		this.dis = null
	}
}

class PathSearchV2 {
	
	constructor(data) {
		
		this.floorPath = []
		
		this.footPath = [[]]
		
		this.carPath = [[]]
		
		this.vis = [[]]
		
		this.dis = [[]]
		
		this.pre = [[[]]]
		
		this.queue = new PriorityQueue()
		
		this.setData(data)
	}
	
	setData(data) {
		
		this.floorPath = data.floorPath;
		
		this.footPath = data.footPath;
		
		this.carPath = data.carPath;
		
		var size1 = this.floorPath.length;
		
		this.vis.length = size1
		
		this.dis.length = size1
		
		this.pre.length = size1
		
		for(let i = 0;i < size1; i++){
			
			var size2 = this.floorPath[i].positions.length;
			
			this.vis[i].length = size2
			
			this.dis[i].length = size2
			
			this.pre[i].length = size2
		}
	}
	
	/**
	 * 每次路径搜索前都必须清除缓存数据
	 */
	clearData(){
		
		var size1 = this.floorPath.length;
		
		for(let i = 0;i < size1; i++){
			
			let size2 = this.floorPath[i].positions.length;
			
			for(let j = 0;j < size2; j++){
				
				this.vis[i][j] = false
				
				this.dis[i][j] = Number.MAX_VALUE
			}
		}
		
		this.queue.clear();
	}
	
	search(f1, p1, f2, p2, linkPoints, type){
		
		let result = new PathResultV2();
		
		let floorType = []
		
		floorType.add(f2);
		
		let path = []
		
		var pd1 = this.startSearch(f1,p1,type);
		
		let distance = 0, minDes = Number.MAX_VALUE
		
		let lastf=f2,lastp=-1,linkp=-1;
		
		let plink=null,pend=null;
		
		if (linkPoints != null && linkPoints.length > 0){
			
			for (let i = 0; i < linkPoints.length; ++i){
				
				let link = linkPoints[i]
				
				linkp = PathUtilV2.findNearestLine(link, this.floorPath[f2].positions,this.floorPath[f2].lines);
				
				let linkp1 = this.floorPath[f2].lines[linkp];
				
				let linkp2 = this.floorPath[f2].lines[linkp+1];
				
				let pd2=PathUtilV2.p2lDes(link, this.floorPath[f2].positions[linkp1], this.floorPath[f2].positions[linkp2]);
				
				let pe = pd2.getPosition();
				
				let comDes = PathUtilV2.p2pDes(pe, link) + PathUtilV2.p2pDes(p2, link);
				
				let s1 = PathUtilV2.p2pDes(pe, this.floorPath[f2].positions[linkp1]);
				
				let s2 = PathUtilV2.p2pDes(pe, this.floorPath[f2].positions[linkp2]);
				
				if(this.dis[f2][linkp1]+s1+comDes<minDes){
					
					minDes = this.dis[f2][linkp1]+s1+comDes;
					
					lastp = linkp1;
					
					plink = link;
					
					pend = pe;
				}
				
				if(this.dis[f2][linkp2]+s2+comDes<minDes){
					
					minDes = this.dis[f2][linkp2]+s2+comDes;
					
					lastp = linkp2;
					
					plink = link;
					
					pend = pe;
				}
			}
			
			distance = minDes;
			
			path.push(new FPosition(f2,p2));
			
			if(PathUtilV2.p2pDes(pend, plink)>IGNORE_DES){
				
				path.push(new FPosition(f2,plink));
			}
		}
		else{
			
			let index2 = PathUtilV2.findNearestLine(p2, this.floorPath[f2].positions, this.floorPath[f2].lines);
			
			let pc = this.floorPath[f2].lines[index2];
			
			let pd = this.floorPath[f2].lines[index2+1];
			
			let pd2=PathUtilV2.p2lDes(p2, this.floorPath[f2].positions[pc], this.floorPath[f2].positions[pd]);
			
			pend = pd2.getPosition();
			
			//判断是否需要忽略最终节点距离
			if(pd2.getDistance()>IGNORE_DES){
				
				path.add(new FPosition(f2,p2));
				
				distance=pd2.getDistance();
			}
			
			let sc = PathUtilV2.p2pDes(pend, this.floorPath[f2].positions[pc]);
			
			let sd = PathUtilV2.p2pDes(pend, this.floorPath[f2].positions[pd]);
			
			lastp = pc;
			
			distance += this.dis[f2][pc]+sc;
			
			if(this.dis[f2][pd]+sd<distance){
				
				lastp=pd;
				
				distance=this.dis[f2][pd]+sd;
			}
		}

//封装路径
		let sameFloor=false;
		
		path.push(new FPosition(f2,pend));
		
		while(lastf>=0){
			
			path.push(new FPosition(lastf, this.floorPath[lastf].positions[lastp]))
			
			let temp = this.pre[lastf][lastp]
			
			sameFloor= temp[0]==lastf;
			
			lastf=temp[0];
			
			lastp=temp[1];
			
			if(lastf<0)break;
			
			if(!sameFloor){
				
				//添加跨楼层节点类型(电梯、楼梯等)
				floorType.add(this.floorPath[lastf].adjacency[lastp][2]);
				
				floorType.add(lastf);
			}
		}
		
		path.push(new FPosition(f1,pd1.getPosition()));
		
		if(pd1.getDistance()>IGNORE_DES) {
			
			path.push(new FPosition(f1,p1));
		}
		
		path.reverse()
		
		floorType.reverse()
		
		result.path = path;
		
		result.floorType = floorType;
		
		result.distance = distance;
		
		return result;
	}
	
	startSearch(f1, p1, type){
		
		//清除前次残余数据
		this.clearData();
		//初始化起始点
		let index1=PathUtilV2.findNearestLine(p1, this.floorPath[f1].positions, this.floorPath[f1].lines);
		
		let pa = this.floorPath[f1].lines[index1];
		
		let pb = this.floorPath[f1].lines[index1+1];
		
		let pd1 = PathUtilV2.p2lDes(p1, this.floorPath[f1].positions[pa], this.floorPath[f1].positions[pb]);
		
		let ps = pd1.getPosition();
		
		let sa = PathUtilV2.p2pDes(ps, this.floorPath[f1].positions[pa]);
		
		let sb = PathUtilV2.p2pDes(ps, this.floorPath[f1].positions[pb]);
		
		let distance=0;
		
		if(pd1.getDistance()>IGNORE_DES){
			
			distance += pd1.getDistance();
		}
		
		this.addNode(f1,pa,distance+sa,-1,-1);
		
		this.addNode(f1,pb,distance+sb,-1,-1);

//遍历扩散
		while(!this.queue.isEmpty()){
			
			this.dijkstra(type);
		}
		return pd1;
	}
	
	addNode(f,p,distance,pref,prep){
		
		this.dis[f][p]=distance;
		
		this.pre[f][p][0]=pref;
		
		this.pre[f][p][1]=prep;
		
		this.queue.enqueue(new QueueNode(f, p, distance), distance);
	}
	
	dijkstra(type){
		
		let node = this.queue.dequeue();
		
		let f=node.floor;
		
		let p=node.pos;
		
		if(this.vis[f][p])return;
		
		let d = node.dis;
		
		let ad = this.floorPath[f].adjacency[p];
		
		//遍历可行路径，下标从3开始，前3位是标示跨楼层的
		for(let i=3;i<ad.length;i+=2){
			
			let nextp=ad[i];
			
			//跳过已访问完的节点
			if(!this.vis[f][nextp]){
				
				let nextd = ad[i+1]+d;
				
				if(nextd < this.dis[f][nextp]){
					
					this.addNode(f, nextp, nextd, f, p);
				}
			}
		}
		
		if(ad[0]==type){
			
			let path = type==0?this.footPath:this.carPath;
			
			ad = path[ad[1]];
			
			for(let i=0;i<ad.length;i+=3){
				
				let nextf = ad[i];
				
				let nextp = ad[i+1];
				
				//跳过已访问完的节点
				if(!this.vis[nextf][nextp]){
					
					let nextd = ad[i+2]+d;
					
					if(nextd<this.dis[nextf][nextp]){
						
						this.addNode(nextf,nextp,nextd,f,p);
					}
				}
			}
		}
		
		//遍历完的节点置为true
		this.vis[f][p]=true;
	}
}


export { PathSearchV2 as default }