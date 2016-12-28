/**
 *
 *  clickmap.js 处理 点击unit上的事件,其他点击事件放到clickevent.js中去
 *  这里只处理点击地图的逻辑 (时间委托)
 */



define(function(require, exports, module) {
	var gV = require('./globalvalue');
	//载入units.js模块
	var unitsObject = require('./units');
	var unitsData = unitsObject.UnitsData.allUnits;    //所有unit数据
	//载入工具模块
	var utilsObject = require('./utils');
	var oUtils = new utilsObject();
	//载入地图功能
	var maputilsObject = require('./maputils');
	var oMapUtil = new maputilsObject();
	//载入蓝牙
	var Beacons = require('./beacons');
	//载入jq
	require('./fastclick');
	// require('./jquery');

	window.addEventListener("load", function() { //解决300ms延迟问题
		FastClick.attach(document.body);
	}, false);

	//点击地图必然产生选中的unit
	var clickMapData = {
		 oSelectUnit: null
	};


	function ClickMap() {}

	ClickMap.prototype.init = function(getInfoUnit, noGetInfoUnit) {
		var _this = this;
		oUtils.EventUtil.addHandler(document.getElementById('svgFrame'), 'click', function(event) {
			var oEvent = event || window.event;
			var oTarget = oUtils.EventUtil.getTarget(oEvent); //获取事件目标
			var sId = oTarget.id;
			if (sId.substring(0, 5) === 'unit_' || sId.substring(0, 5) === 'rect_' || sId === 'index-main' || sId.substring(0, 2) === 'm_') {
				 //非导航中才可以点击
				if (!gV.bGps) clickMapOrText(); //处理点击地图上的unit

			} else {
				switch (oTarget.id) { // 处理其他点击事件
					case '':
						noGetInfoUnit && noGetInfoUnit();    //没点中unit的回掉函数
					    break;
				}
			}
		})

		function clickMapOrText(ev) {
			var oEvent = ev || event;
			var iClientX = oEvent.clientX;
			var iClientY = oEvent.clientY;

			gV.oSelectUnit = {}; //每次点击先清空上一次的选中的unit数据
			var aSvgPos = oMapUtil.changeToSvgPos(iClientX, iClientY);
			var iSvgX = aSvgPos[0],
			    iSvgY = aSvgPos[1];
	        var unitsData = unitsObject.UnitsData.allUnits;
			for (var attr in unitsData) {
				var iLeft = unitsData[attr].boundLeft;
				var iRight = unitsData[attr].boundRight;
				var iTop = unitsData[attr].boundTop;
				var iBottom = unitsData[attr].boundBottom;

				if (iLeft <= iSvgX && iSvgX <= iRight && iTop <= iSvgY && iSvgY <= iBottom) {
					var aSvgPos = oMapUtil.unitPosChangeToCenterPos(unitsData[attr]);
					var aClientPos = oMapUtil.changeToClientPos(aSvgPos[0], aSvgPos[1]);
					unitsData[attr].aSvgPos = aSvgPos;
					unitsData[attr].aClientPos = aClientPos;
					gV.oSelectUnit = unitsData[attr];
					getInfoUnit && getInfoUnit(unitsData[attr]);    //unit数据成功的回掉函数
					// console.log(gV.oSelectUnit);
				}
			}
		} 
	}


	module.exports = ClickMap;

	

	//向服务器发送并存储动静态导航的终点信息
	function sendEndInfo(unit, floorId, regionId, svgX, svgY) {
		var unitId = unit.id;
		var obj = {
			unitId: unitId,
			floorId: floorId,
			regionId: regionId,
			svgX: svgX,
			svgY: svgY 
		};
		var sObj = JSON.stringify(obj);
		console.log('sObj ' + sObj);
		var url = 'http://wx.indoorun.com/chene/saveCheLocation.html';
		jsLib.ajax({
			type: "get",
			dataType: 'jsonp',
			url: url, //添加自己的接口链接
			data: {'sName':sObj},
			timeOut: 10000,
			before: function () {
				// console.log("before");
			},
			success: function (str) {
				var data = str;
				if (data != null) {
		            if (data.code == "success") {
		            	// alert("发送成功");
		            	console.log('发送成功');
		            }
		        }

			},
			error: function (str) {
				alert('向服务器发送并存储动静态导航的终点信息, 失败!'+str);
			}
		});
		/*oUtils.RequestData.ajax(url, {
		    data: {'sName':sObj},
		    fnSucc: function(str) {
		        str = str.replace(/\n/g, '');
		        var data = eval('(' + str + ')');
		        if (data != null) {
		            if (data.code == "success") {
		            	// alert("发送成功");
		            	console.log('发送成功');
		            }
		        }
		    },
		    fnFaild: function(str) {
		        alert('向服务器发送并存储动静态导航的终点信息, 失败!'+str);
		    },
		});*/
	}

	//向服务器获取存储的动静态导航终点信息
	function getSendEndInfo() {
		var url = 'http://wx.indoorun.com/chene/getCheLocation.html';
		jsLib.ajax({
			type: "get",
			dataType: 'jsonp',
			url: url, //添加自己的接口链接
			timeOut: 10000,
			before: function () {
				console.log("before");
			},
			success: function (str) {
				var data = str;
				if (data != null) {
		            if (data.code == "success") {
		            	// alert("发送成功");
		            	oMapUtil.svgShowPoint('zhongdian', [parseFloat(data.data.svgX), parseFloat(data.data.svgY)], 32, 32);
		            }
		        }

			},
			error: function (str) {
				alert('向服务器获取存储的动静态导航终点信息, 失败!'+str);
			}
		});
		/*oUtils.RequestData.ajax(url, {
		    fnSucc: function(str) {
		        str = str.replace(/\n/g, '');
		        var data = eval('(' + str + ')');
		        if (data != null) {
		            if (data.code == "success") {
		            	// alert("发送成功");
		            	oMapUtil.svgShowPoint('zhongdian', [parseFloat(data.data.svgX), parseFloat(data.data.svgY)], 32, 32);
		            }
		        }
		    },
		    fnFaild: function(str) {
		        alert('向服务器获取存储的动静态导航终点信息, 失败!'+str);
		    },
		});*/
	}
	// getSendEndInfo();

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
});