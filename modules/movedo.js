/**
 *  movedo.js  处理地图拖动, 旋转过程中的逻辑
 *
 */


define(function(require, exports, module) {
	var gV = require('./globalvalue');
	var ObjectUnits = require('./units');
	var Unit = ObjectUnits.Unit;
	var UnitData = ObjectUnits.UnitsData;
	var unitObj = new Unit();
	//载入地图功能
	var Maputils = require('./maputils');
	var oMap = new Maputils();
	//载入蓝牙模块
	var bnData = require('./beacons');


	function MoveDo() {}

	module.exports = MoveDo;


	MoveDo.prototype = {
		constructor: MoveDo,

		handleBefore: function() {
			//清空unit数据
			var oG_txt = document.querySelector('#g_txt');
			oG_txt.innerHTML = '';

			/*//清空线
			var oLine = document.querySelector('#line');
			if(oLine) oLine.innerHTML = '';*/

			/*//把静态导航的底部div隐藏
			var oGo_dingwei = document.querySelector('#go_dingwei');
			oGo_dingwei.style.display = 'none';*/

		},

		handleDo: function() {
			/*//如果存在定位点就让他跟着地图走
			if (bnData.bOpenBlueTooth) {
				if (oMap.isRemain(bnData)) {    //如果在的话就让动态点跟着走撒
					oMap.svgShowPoint('pointImg', [bnData.iStartSvgPosX, bnData.iStartSvgPosY], 40, 40);
				}

				//动态导航操作（是否显示终点,如果显示就跟着走）
				if (!(oMap.isRemain(gV.floorDTMore.endObj))) {    //判断动态点是否显示
					document.querySelector('#zhongdian').style.display = 'none';
				} else {
					oMap.svgShowPoint('zhongdian', [gV.floorDTMore.endObj.svgx, gV.floorDTMore.endObj.svgy], 40, 40);
				};

			} else {

				//静态导航中起点终点跟着走
				if (gV.floorMore.startObj && gV.floorMore.endObj && gV.bGps) {
					// var qidianPos = oMap.unitPosChangeToCenterPos(gV.staticGps.startUnit);
					oMap.svgShowPoint('qidian', [gV.floorMore.startObj.svgx, gV.floorMore.startObj.svgy], 40, 40);
					oMap.svgShowPoint('zhongdian', [gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy], 40, 40);
				}
				var selectDian = document.querySelector('#selectDian');
				selectDian.style.display = 'none';

				//起点跟着走
				if (isRemain(gV.floorMore.startObj)) {
					if (gV.floorMore.startObj) {
						// var qidianPos = oMap.unitPosChangeToCenterPos(gV.staticGps.startUnit);
						oMap.svgShowPoint('qidian', [gV.floorMore.startObj.svgx, gV.floorMore.startObj.svgy], 40, 40);
					}
				} else {
				    document.querySelector('#qidian').style.display = 'none';
				}
				

				//终点跟着走
				if (isRemain(gV.floorMore.endObj)) {
					if (gV.floorMore.endObj) {
						// var zhongdianPos = oMap.unitPosChangeToCenterPos(gV.staticGps.endUnit);
						oMap.svgShowPoint('zhongdian', [gV.floorMore.endObj.svgx, gV.floorMore.endObj.svgy], 40, 40);
					}
				} else {
					document.querySelector('#zhongdian').style.display = 'none';
				}
			}

			//公共设施的图标在地图上走
			if (gV.facilities.allSearchUnit.length > 0) {
				var aAddIcon = document.querySelector('#addIcon').children;
				gV.facilities.allSearchUnit.forEach(function(item, index) {
					var aCenterSvg = oMap.unitPosChangeToCenterPos(item);
					oMap.svgShowPoint(aAddIcon[index].id, aCenterSvg, 37.5, 37.5);
				});
			}*/
			
		},

		handleAfter: function() {
			//拖动或者旋转结束 显示unit
			unitObj.textTransformation(UnitData.allUnits);

			/*//重新画线
			if (gV.bGps) {
				var aClientPos =  oMap.changeToAllClientPos(gV.aLineSvgPos);
				oMap.draw('line', aClientPos, false);
			}*/
			
		},
	}

	//判断终点起点是否在属于自己的楼层中
	function isRemain(obj) {
         if (gV.floorId === obj.floorId) {
         	return true;
         } else {
			return false;
         }
	}




});