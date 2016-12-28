/**
 *  公共设施功能模块
 *  点击设施, 在地图找出所有相关的设施
 *  然后在地图上点击设施，进行动静态导航
 */

define(function(require, exports, module) {
	var gV = require('./globalvalue');
	var oUnits = require('./units');
	var Maputils = require('./maputils');
	var oMapUtils = new Maputils();

	var Utils = require('./utils');
	var oUtils = new Utils();

	//载入unit
	var ObjectUnits = require('./units');
	var Unit = ObjectUnits.Unit;
	var UnitData = ObjectUnits.UnitsData;
	var unitObj = new Unit();
	//载入蓝牙
	var Beacons = require('./beacons');


	//(设施中的)全局的变量
	globalVal = {
        ajaxExitData: []    //从后台获取的出口数据  globalVal.ajaxExitData
	};



 	// 1.获取所有的公共设施
    var aUlDom = jsLib.utils.getByClass(jsLib.getEle('#sheshi'), 'mainmenu clearfix');
    var aLiDomObj = [];   //获取所有的公共设施
    jsLib.utils.convertToArray(aUlDom).forEach(function(item) {
    	var aChildren = item.children;
    	jsLib.utils.convertToArray(aChildren).forEach(function(itemEle) {
    	    aLiDomObj.push(itemEle);
        })
    });
    
    // 2.给公共设施添加点击事件(jsLib中的tap事件和hammer中的冲突, 故采用click事件)
    aLiDomObj.forEach(function(item, index) {
	    item.addEventListener('click', function(ev) {
	    	ev.preventDefault();
	    	handerEvent.call(this, ev);
	    });
    });

    // 3.事件驱动处理程序/监听器
    function handerEvent(ev) {
    	if (!gV.bGps) {     //只要在非导航中才可以选择公共设施
	    	var unitTypeId = this.children[0].id;
	    	if (unitTypeId == 5) {    //出口单独处理
                doExit();
	    	} else {
		    	searchUnit(unitTypeId, this);
	    	}
	    	jsLib('#sheshi').css('display', 'none');
    	}
    };

    // 4.获取当前unit并查找出设施
    function searchUnit(unitTypeId, domObj) {
    	var aFindUnit = [];
    	gV.facilities.allSearchUnit = [];

    	// 1).获取到当前所有unit, 根据unitTypeId查找存到aFindUnit中去
    	var aCurrentAllUnit = oUnits.UnitsData.allUnits;
    	aCurrentAllUnit.forEach(function(item, index) {
    		if (item.unitTypeId == unitTypeId) {
    			aFindUnit.push(item);
    		}
    	});


    	// 2).生成相对应的设施图标
    	var oParent = jsLib('#addIcon');
    	var aAddIconChild = oParent.toDom().children;
    	if (aFindUnit.length > 0) {
    		gV.facilities.allSearchUnit = aFindUnit;
    		oParent.css('display', 'block');
    		if (oParent.toDom().getAttribute('name') == unitTypeId) {
    			cancelIcon();
    			return;
    		}
    		oParent.toDom().setAttribute('name', unitTypeId);
    		var sImg = domObj.children[0].src;
    		var sHtml = "";
	       	aFindUnit.forEach(function(item, index) {
	       	    sHtml += "<div class=\"zhizhen2\" id=\"" + "add"+item.id + "\" >\
							<img src=\"" + sImg + "\">\
						</div>";
	       	});
	       	oParent.innerHtml(sHtml);

	       	//找出unit中离屏幕中心点最近的unit
	       	var aDis = [];
	       	var min = 0, flag = 0;
	       	aFindUnit.forEach(function(item, index) {
		       	var aOUnitCenterSvgXY = oMapUtils.unitPosChangeToCenterPos(item);
		       	var aOUnitCenterClientXY = oMapUtils.changeToClientPos(aOUnitCenterSvgXY[0], aOUnitCenterSvgXY[1]);
		       	var cx = gV.box_w/2, cy = gV.box_h/2;
		       	var dis = oMapUtils.getDistance(aOUnitCenterClientXY[0], aOUnitCenterClientXY[1], cx, cy);
		       	aDis.push(dis);
	       	});
	       	min = aDis[0];
	       	aDis.forEach(function(item, index) {
	       		if (min > item) {
					min = item;
					flag = index;
	       		}
	       	});
	       	var aSvgXY = oMapUtils.unitPosChangeToCenterPos(aFindUnit[flag]);
	       	var aClientXY = oMapUtils.changeToClientPos(aSvgXY[0], aSvgXY[1]);
	       	dingwei(aClientXY[0], aClientXY[1]);
            //把离屏幕中心点最近的点拉到中间
       		function dingwei (clientX, clientY) {
       			// document.querySelector('#pointImg').style.display = 'none';
       	    	var cx = gV.box_w/2 - clientX - 20;
       	    	var cy = gV.box_h/2 - clientY - 20;

       	    	var px = cx + gV.lastPX;
       	    	var py = cy + gV.lastPY;

       	    	showMap(gV.scale, px, py);
       	    	unitObj.textTransformation(UnitData.allUnits);

       	    	//终点跟着走
       	    	if (oMapUtils.isRemain(gV.floorMore.endObj)) {
       	    		if (gV.floorMore.endObj) {
       	    			// var zhongdianPos = oMapUtils.unitPosChangeToCenterPos(gV.staticGps.endUnit);
       	    			oMapUtils.svgShowPoint('zhongdian', [gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy], 40, 40);
       	    		}
       	    	} else {
       	    		document.querySelector('#zhongdian').style.display = 'none';
       	    	}

       	    	//起点跟着走
       	    	oMapUtils.svgShowPoint('qidian', [gV.floorMore.startObj.svgx, gV.floorMore.startObj.svgy], 40, 40);
       		};
       		function showMap(scale, px, py) {    //原 map_show 函数
       			gV.lastPX = px;
       			gV.lastPY = py;
       			//转换根据:
       			//x1 = ax + cy + e;
       			//y1 = bx + dy + f;
       			var a = Math.cos(gV.lastSvgAngle * Math.PI / 180) * scale;
       			var b = Math.sin(gV.lastSvgAngle * Math.PI / 180) * scale;
       			var c = -b;
       			var d = a;
       			var e = gV.lastPX;
       			var f = gV.lastPY; //

       			var transform = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')';
       			var oViewportNode = document.querySelector('#viewport');
       			oViewportNode.setAttribute("transform", transform);
       		}

       		//把找到的unit都集中显示到屏幕中心
       		/*var arrX = [], arrY = [];
       		aFindUnit.forEach(function(item, index) {
       			var aOUnitCenterSvgXY = oMapUtils.unitPosChangeToCenterPos(item);
       			arrX.push(aOUnitCenterSvgXY[0]);
       			arrY.push(aOUnitCenterSvgXY[1]);
       		});
       		function compare(val1, val2) {
       			return val1 - val2;
       		}
       		arrX.sort(compare);
       		arrY.sort(compare);
       		var rectMinPos = [arrX[0], arrY[0]];
       		var rectMaxPos = [arrX[arrX.length - 1], arrY[arrY.length - 1]];
       		var iRectWidth = arrX[arrX.length - 1] - arrX[0];
       		var iRectHeight = arrY[arrY.length - 1] - arrY[0];
       		var aRectCenterSvg = [(arrX[0] + arrX[arrX.length - 1])/2, (arrY[0] + arrY[arrY.length - 1])/2];
       		var aRectCenterClient = oMapUtils.changeToClientPos(aRectCenterSvg[0], aRectCenterSvg[1]);

       		// var minScale = Math.min(gV.box_w/iRectWidth, gV.box_h/iRectHeight);
       		var minScale = Math.min(iRectWidth/gV.box_w, iRectHeight/gV.box_h);
       		gV.scale = minScale;
       		dingwei(minScale, aRectCenterClient[0], aRectCenterClient[1]);
       		// console.log(minScale);

   		    //把离屏幕中心点最近的点拉到中间
			function dingwei (scale, clientX, clientY) {
				// document.querySelector('#pointImg').style.display = 'none';
		    	var cx = gV.box_w/2 - clientX - 20;
		    	var cy = gV.box_h/2 - clientY - 20;

		    	var px = cx + gV.lastPX;
		    	var py = cy + gV.lastPY;

		    	showMap(scale, px, py);
		    	unitObj.textTransformation(UnitData.allUnits);
		    	// Map.StaticGPS.changePosPoint(document.querySelector('#pointImg'), [bnData.iStartSvgPosX, bnData.iStartSvgPosY]);
			};
			function showMap(scale, px, py) {    //原 map_show 函数
				gV.lastPX = px;
				gV.lastPY = py;
				//转换根据:
				//x1 = ax + cy + e;
				//y1 = bx + dy + f;
				var a = Math.cos(gV.lastSvgAngle * Math.PI / 180) * scale;
				var b = Math.sin(gV.lastSvgAngle * Math.PI / 180) * scale;
				var c = -b;
				var d = a;
				var e = gV.lastPX;
				var f = gV.lastPY; //

				var transform = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')';
				var oViewportNode = document.querySelector('#viewport');
				oViewportNode.setAttribute("transform", transform);
			}*/


			//给每个生成的dom添加一个click事件
	       
			jsLib.utils.convertToArray(aAddIconChild).forEach(function(item) {
				item.addEventListener('click', function(ev) {
			    	doHandler.call(this, item);
			    });
			});


	       	//更正图标位置
	       	aFindUnit.forEach(function(item, index) {
	       		var aCenterSvg = oMapUtils.unitPosChangeToCenterPos(item);
	       		oMapUtils.svgShowPoint(aAddIconChild[index].id, aCenterSvg, 37.5, 37.5);
                
	       	});
    	} else {
    		jsLib.utils.convertToArray(aAddIconChild).forEach(function(item) {
    			item.addEventListener('click', null);
    		});
    		oParent.innerHtml('');
    	}
    };

    function cancelIcon() {
    	var oParent = jsLib('#addIcon');
    	var aAddIconChild = oParent.toDom().children;
    	jsLib.utils.convertToArray(aAddIconChild).forEach(function(item) {
    		item.addEventListener('click', null);
    	});
    	gV.facilities.allSearchUnit = [];
    	oParent.toDom().setAttribute('name', '');
    	oParent.innerHtml('');
    	gV.facilities.drawStartPoint = false;
    	gV.facilities.drawEndPoint = false;
    };

    //获取起点终点信息
	function getStartEndInfo(type, aSvgPos, unit) {
		if (type === 'start') {
			gV.floorMore.startObj.svgx = aSvgPos[0];
			gV.floorMore.startObj.svgy = aSvgPos[1];
			gV.floorMore.startObj.regionId = gV.regionId;
			gV.floorMore.startObj.floorId = gV.floorId;
			gV.floorMore.startObj.unit = unit;
		} else {
			gV.floorMore.endObj.svgx = aSvgPos[0];
			gV.floorMore.endObj.svgy = aSvgPos[1];
			gV.floorMore.endObj.regionId = gV.regionId;
			gV.floorMore.endObj.floorId = unit.floorId;
			// gV.floorMore.endObj.floorId = gV.floorId;
			gV.floorMore.endObj.unit = unit;
		}
	}

    // 5.处理点击生成的dom的事件处理程序
    function doHandler(domObj) {
    	// console.log('globalVal.ajaxExitData:' + globalVal.ajaxExitData);
    	var id = domObj.id.replace(/[^0-9]/ig, '');
    	var aCurrentAllUnit = oUnits.UnitsData.allUnits;
    	var oUnit = {};
    	if (!jsLib.utils.isEmptyObj(globalVal.ajaxExitData)) {    //出口特殊处理
    		globalVal.ajaxExitData.forEach(function(item, index) {
	    		if (item.id == id) {
					oUnit = item;
	    		}
	    	});
	    	jsLib('#chukou').fadeOut(function(){
		    	jsLib('#chukou').hide();
	    	});
	    	globalVal.ajaxExitData = [];
    	} else {
	    	aCurrentAllUnit.forEach(function(item, index) {
	    		if (item.id == id) {
					oUnit = item;
	    		}
	    	});
    	}
    	// console.log('oUnit:'+oUnit);
    	doGps(oUnit);
    };

    // 6.处理动静态画线
    function doGps(oUnit) {
    	//存一下终点
    	gV.staticGps.endUnit = null;
    	gV.staticGps.endUnit = oUnit;
    	var aSvgCenterPos = oMapUtils.unitPosChangeToCenterPos(gV.staticGps.endUnit); 
    	getStartEndInfo('end', aSvgCenterPos, oUnit);

    	gV.facilities.drawStartPoint = true;
    	gV.facilities.drawEndPoint = true;

    	if (Beacons.bOpenBlueTooth) {    //动态导航
    		gV.bGps = true;
    		// debug.log('动态导航');
			gV.oSelectUnit = oUnit;
    		var zhongdianPos = oMapUtils.unitPosChangeToCenterPos(gV.oSelectUnit);

			gV.floorDTMore.endObj.floorId = oUnit.floorId;   //存储终点的floorId
			gV.floorDTMore.endObj.regionId = gV.regionId;
			gV.floorDTMore.endObj.unit = gV.oSelectUnit;   //存储终点的unit信息
			gV.floorDTMore.endObj.svgx = zhongdianPos[0];
			gV.floorDTMore.endObj.svgy = zhongdianPos[1];

    		//请求画线
    		if (gV.facilities.isPeopleType) {    //人型(出口)
	    		oMapUtils.askPosMore(gV.regionId, Beacons.floorId, gV.floorDTMore.endObj.floorId, Beacons.iStartSvgPosX, Beacons.iStartSvgPosY, gV.floorDTMore.endObj.svgx, gV.floorDTMore.endObj.svgy, true);
    		} else {    //车型
	    		oMapUtils.askPosMore(gV.regionId, Beacons.floorId, gV.floorDTMore.endObj.floorId, Beacons.iStartSvgPosX, Beacons.iStartSvgPosY, gV.floorDTMore.endObj.svgx, gV.floorDTMore.endObj.svgy);
    		}

    		showOrHide();
    		cancelIcon();

    	} else {    //静态导航
    		if (!gV.staticGps.startUnit) {
    			alert('请点击地图选择起点');
    		} else {
               console.log('有起点，就在这里画线');
               gV.bGps = true;
               if (gV.facilities.isPeopleType) {    //人型(出口)
	               oMapUtils.askPosMore(gV.floorMore.startObj.regionId, gV.floorMore.startObj.floorId, gV.floorMore.endObj.floorId, gV.floorMore.startObj.svgx, gV.floorMore.startObj.svgy, gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy, true);
               } else {     //车型
	               oMapUtils.askPosMore(gV.floorMore.startObj.regionId, gV.floorMore.startObj.floorId, gV.floorMore.endObj.floorId, gV.floorMore.startObj.svgx, gV.floorMore.startObj.svgy, gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy);
               }    
               oMapUtils.svgShowPoint('zhongdian', [gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy], 32, 32);
               cancelIcon();

               showOrHide();
    		}
    	};
        
        function showOrHide() {
        	//底部隐藏
        	var oGo_dingwei = document.querySelector('#go_dingwei');
        	oGo_dingwei.style.display = 'none';
        	//退出导航显示
        	var exitDynamicGps = document.querySelector('#exitDynamicGps');
        	exitDynamicGps.style.display = 'block';
        }
    	
    };

    // 7.出口有点不一样, 单独处理
    function doExit() {
    	// 2) 从服务器获取出口信息
    	function getExitInfo(regionId, sFloorId, sx, sy) {    //第一个必须, 其余的可选, sx,sy是起点的svg坐标
    		var url = 'http://wx.indoorun.com/wx/getAllOuterExitOfRegion.html';
    		var data = {};
    		if (arguments[1] != undefined && arguments[2] != undefined && arguments[3] != undefined) {
				data = {'regionId':regionId, 'sFloorId':sFloorId, 'sx': sx, 'sy': sy};
    		} else {
    			data = {'regionId':regionId};
    		}
    		oUtils.RequestData.ajax(url, {
    		    data: data,
    		    fnSucc: function(str) {
    			    str = str.replace(/\n/g, '');
    			    var data = JSON.parse(str);
    			    if (data != null) {
    					if (data.code == "success") {
    						makeHtml(data.data);
    						//存放出口信息
    						globalVal.ajaxExitData = [];
    						data.data.forEach(function(item, index) {
    							globalVal.ajaxExitData.push(item);
    						});
    					}
    				}
    			},
    		    fnFaild: function(str) {
    		        alert('获取出口unit失败!'+str);
    		    },
    		});
    	}

    	// 3) 生成静态面板页面
    	function makeHtml(aData) {
    		console.log(aData);
    		var oParentObj = jsLib('#chukou_list');
    		var oChukouObj = jsLib('#chukou');
    		var sHtml = '';

			aData.forEach(function(item, index) {
				sHtml += "<div id=\"add"+ item.id +"\" class=\"chukou_cont\">\
			   	        	<div class=\"midd\">\
			   	        		<span> " + (index+1) + "</span>\
			   	        	</div>\
			   	        	<span> " + item.extInfo.outerLink + " </span>\
			   	        </div>";
			});

			oParentObj.innerHtml(sHtml);
			oChukouObj.show();
			oChukouObj.fadeIn();

			//给列表添加点击事件处理程序
			var aListDom = jsLib.getEle('#chukou_list').children;
			jsLib.utils.convertToArray(aListDom).forEach(function(item) {
				item.addEventListener('click', function(ev) {
			    	gV.facilities.isPeopleType = true;
			    	doHandler.call(this, item);
			    });
			});
    	}

    	// 1) 判断地图是否含有选中的起点
    	if (gV.floorMore.startObj.unit) {
    		var aSvgPos = oMapUtils.unitPosChangeToCenterPos(gV.floorMore.startObj.unit);
			getExitInfo(gV.regionId, gV.floorId, aSvgPos[0], aSvgPos[1]);
    	} else {
			getExitInfo(gV.regionId);
    	}

    }

    // 8.出口X的关闭
    jsLib('#chukou_close').click(function() {
    	jsLib('#chukou').fadeOut(function(){
	    	jsLib('#chukou').hide();
    	});
    });

});