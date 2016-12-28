/**
 * 地图导航
 * by雅丰
 */

var box_w, box_h; //显示设备宽高
var vb_w, vb_h; //原始svg图片 viewBox 的宽高
var x, y, width, height; //当前图片起点xy坐标及宽高
var widthLevle, heightLevel; //显示设备宽高与当前图片大小的比例，widthLevel = box_w / width；
var ratio;
var scale;

var lastPX, lastPY; //即时偏移（屏幕坐标）
var dragStartPX, dragStartPY;

var transformStartScale;
var transformStartCentX, transformStartCentY;
var transformStartPX, transformStartPY;

var lastSvgAngle = 0; //实时svg图片偏转的角度
var initAngle = 90;  //初始90度  

var rotateStartSvgAngle; //旋转动作开始时svg当时偏转的角度
var rotateStartSvgScale; //旋转动作开始时svg缩放的比例
var rotateStartRotation; //旋转动作开始时手指连线的角度
var rotateStartCenterX; //旋转动作开始时手指连线中心点的x坐标（屏幕）
var rotateStartCenterY; //旋转动作开始时手指连线中心点的y坐标（屏幕）
var rotateStartPX; //旋转动作开始时的偏移
var rotateStartPY;

var rotateStartCenterSvgX; //旋转动作开始时手指连线中心点对应的svg坐标
var rotateStartCenterSvgY;


/**我新增的变量**/
var oTxt = {}; //所有文本的数据
var aLastTxtData = []; //上一次文本在屏幕中显示的数据
var iPaddingVaule = 10; //padding-left:10px
var oUnit = {}; //存一个点击选中的unit对象
var aUnitSvgPos = []; //存unit对象的x，y值
var aDivPos = []; //存显示Div对象的x，y值
var OSType;    //是android还是iphone
var floorList = [];    //楼层信息
var aFloors = {};

var Map = (function() {

	//文字信息
	var TxtName = {

		//获取文字
		getTxtList: function() {

			var url = 'http://wx.indoorun.com/wx/getUnitsOfFloor.html?regionId=' + regionId + '&floorId=' + floorId;

			Map.MapTools.ajax(url, function(str) {
				var data = eval('('+str+')');
				if (data != null) {
					if (data.code == "success") {
						var svgTxt = data.data;
						
						oTxt = svgTxt; //把文本数据存到全局变量中去(每拖动旋转一次数据生成一次)
						// TxtName.setText(objTxt);
						Map.TxtName.textTransformation();

					}
				}

			}, function() {
				alert('地图文字信息获取失败!');
			});



			/*$.get('/wx/getUnitsOfFloor.html', {'regionId':regionId, 'floorId':floorId}, function(data) {

				if (data != null) {
					if (data.code == "success") {
						var svgTxt = data.data;

						oTxt = svgTxt; //把文本数据存到全局变量中去(每拖动旋转一次数据生成一次)
						var objTxt = TxtName.formatArr(svgTxt);
						// TxtName.setText(objTxt);
						Map.TxtName.textTransformation();

						// Map.ManageClick.svgTextClick();

					} else {
						var err = data.msg;
						$("#g_txt").html(err);
						$("#svgFrame").css('display', 'block');
						$("#svgBox").css("visibility", "visible");
					}
				} else {
					alert("获取数据错误。");
				}
			});*/
		},

		//转换文字信息
		formatArr: function(list) {

			var oArr = [];

			for (var attr in list) {

				var sName = list[attr].name,
					x, y, rect = [],
					isShow; //x为计算后的left值，y为计算后的top值  isShow是否显示蓝色小圆点
				var sId = list[attr].id;
				var iSvgLeft, iSvgTop, iSvgRight, iSvgBottom, pos; //svg对应的坐标

				iSvgLeft = list[attr].boundLeft;
				iSvgTop = list[attr].boundTop;
				iSvgRight = list[attr].boundRight;
				iSvgBottom = list[attr].boundBottom;

				pos = TxtName.changePos(sName, iSvgLeft, iSvgRight, iSvgTop, iSvgBottom);

				x = pos.x;
				y = pos.y;
				rect = pos.rect;
				isShow = pos.isShow; //是否显示小圆点

				var obj = {};
				obj[sId] = [sName, x, y, TxtName.getBytesWidth(sName, false)[0], rect, isShow];
				oArr.push(obj);

			};

			function extend(des, src, override){
			   if(src instanceof Array){
			       for(var i = 0, len = src.length; i < len; i++) {
			       	    extend(des, src[i], override);
			       }
			           
			   } else {
			   	for( var i in src){
			   	    if(override || !(i in des)){
			   	        des[i] = src[i];
			   	    }
			   	}; 
			   	
			   }
			   return des;
			   
			};

			var aChangeTxt= extend({}, oArr);

			return aChangeTxt;
		},

		//文字svg位置转换屏幕坐标
		changePos: function(sName, iLeft, iRight, iTop, iBottom) {
			var bool = true; //进行判断是否含有蓝色圆点来确定坐标

			var x, y, iTxtWidth, iTxtHeight, iTxtTop, iTxtBottom, iTxtLeft, iTxtRight;

			var sx = (iLeft + iRight) / 2;
			var sy = (iTop + iBottom) / 2;

			var iWidthSvg = iRight - iLeft;
			var iHeightSvg = iBottom - iTop;

			//求出矩形的长度（屏幕中的）
			var iAreaWidth = (iWidthSvg) * scale;

			x = Math.cos(lastSvgAngle * Math.PI / 180) * sx * scale - Math.sin(lastSvgAngle * Math.PI / 180) * sy * scale + lastPX; //屏幕坐标中的x,y
			y = Math.cos(lastSvgAngle * Math.PI / 180) * sy * scale + Math.sin(lastSvgAngle * Math.PI / 180) * sx * scale + lastPY;

			iTxtWidth = TxtName.getBytesWidth(sName, bool)[0]; //屏幕中文本的宽高
			iTxtHeight = TxtName.getBytesWidth(sName, bool)[1];

			iTxtTop = y - iTxtHeight / 2;
			iTxtBottom = y + iTxtHeight / 2;
			iTxtLeft = x - iTxtWidth / 2;
			iTxtRight = x + iTxtWidth / 2;

			var pos = {};
			if (iAreaWidth > iTxtWidth - 10) {
				return pos = { //屏幕文本的x，y坐标及上下左右距离屏幕的值(含小圆点)
					x: x,
					y: y,
					rect: [iTxtTop, iTxtBottom, iTxtLeft, iTxtRight],
					isShow: false
				};
			} else {
				return pos = {
					x: x,
					y: y,
					rect: [iTxtTop, iTxtBottom, iTxtLeft, iTxtRight],
					isShow: true
				};
			};
		},

		//插入文本
		setText: function(objArr) {
			var html = '';

			for (var attr = 0; attr < objArr.length; attr++) {

				if (objArr[attr][5]) { //objArr[attr][5] 是否显示蓝色圆点
					html += '<span style="left:' + (objArr[attr][1] - 4) + 'px;top:' + (objArr[attr][2] - 3) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
				} else {
					html += '<span style="left:' + (objArr[attr][1] - objArr[attr][3] / 2 + 4) + 'px;top:' + (objArr[attr][2]) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
				}
			};

			document.getElementById('g_txt').style.opacity = 0.7;
			document.getElementById('g_txt').style.filter = 'alpha(opacity:' + (70) + ')';
			document.getElementById('g_txt').innerHTML = html;

			var aSpan = document.getElementById('g_txt').getElementsByTagName('span');
			for (var i = 0; i < objArr.length; i++) {
				if (objArr[i][5]) { //objArr[i][5] 是否显示蓝色圆点
					aSpan[i].setAttribute('class', 'cls_txt_circle');
				} else {
					aSpan[i].removeAttribute('class');
				}
			}
		},

		//创建svg标签   Map.TxtName.creatTag();
		creatTag: function(tag, attrObj) {
			var svgNS = 'http://www.w3.org/2000/svg';
			var oTag = document.createElementNS(svgNS, tag);

			for (var attr in attrObj) {

				oTag.setAttribute(attr, attrObj[attr]);
			}

			return oTag;
		},

		//拖动，缩放，旋转中清除文本
		clearTxt: function() {
			$("#g_txt").html('');
		},

		// 获取字符串字节数宽度 和 高度
		getBytesWidth: function(str, boob) {
			var boob = boob; //含有蓝色圆点的
			var oSpan = document.createElement('span'),
				oTxtName = document.createTextNode(str),
				iWidth, iHeight;

			oSpan.appendChild(oTxtName);
			document.body.appendChild(oSpan);
			iWidth = oSpan.offsetWidth;
			iHeight = oSpan.offsetHeight;
			document.body.removeChild(oSpan);

			if (boob) {
				return [iWidth + iPaddingVaule, iHeight];
			} else {
				return [iWidth, iHeight];
			}
		},

		// 获取字符串面积大小 
		getBytesArea: function(str, boob) {
			var oSpan = document.createElement('span'),
				oTxtName = document.createTextNode(str),
				iWidth, iHeight;

			oSpan.appendChild(oTxtName);
			document.body.appendChild(oSpan);
			iWidth = oSpan.offsetWidth;
			iHeight = oSpan.offsetHeight;
			document.body.removeChild(oSpan);

			var iTextArea = 0;

			if (boob) {
				return iTextArea = (iWidth + iPaddingVaule) * iHeight;
			} else {
				return iTextArea = iWidth * iHeight;
			}
		},

		// 文字变化
		textTransformation: function() { //Map.TxtName.textTransformation();

			var aOriginalVisiblenodes = TxtName.formatArr(oTxt); //先把原始数组数据转换成obj（具有上下左右值）
			// var aOriginalVisiblenodes = aChangeTxt;

			var aNewTempVisible = []; //新增数据(筛选不碰撞的文本)

			for (var i in aOriginalVisiblenodes) {


				if (aOriginalVisiblenodes[i] == 'undefined') {
					return false;
				} else {
					if (!TxtName.checkIsCovered(aOriginalVisiblenodes[i], aNewTempVisible)) {
						aNewTempVisible.push(aOriginalVisiblenodes[i]);
					}
				};
			};

			Map.TxtName.setText(aNewTempVisible);
		},

		// 计算元素碰撞
		checkIsCovered: function(aCurrVisible, aNewVisible) {
			var bFlag = false,
				rect, rect1; //rect 是所有的文本数据，  rect1是新增的文本数据， 这2个碰撞对比

			rect = aCurrVisible[4];

			var top = rect[0];
			var bottom = rect[1];
			var left = rect[2];
			var right = rect[3];

			for (var i = 0, n = aNewVisible.length; i < n; i++) {

				rect1 = aNewVisible[i][4];
				var iNow = 0;
				var top1 = rect1[0] - iNow;
				var bottom1 = rect1[1] - iNow;
				var left1 = rect1[2] - iNow;
				var right1 = rect1[3] - iNow;

				//左边
				if (left < left1 && right > left1 && !(top > bottom1 || bottom < top1)) {
					bFlag = true;
					break;
				}

				//右边
				if (left < right1 && right > right1 && !(top > bottom1 || bottom < top1)) {
					bFlag = true;
					break;
				}

				//上边
				if (top < top1 && bottom > top1 && !(right < left1 || left > right1)) {
					bFlag = true;
					break;
				}

				//下边
				if (top < bottom1 && bottom > bottom1 && !(right < left1 || left > right1)) {
					bFlag = true;
					break;
				}

				//内部上下
				if (left > left1 && right < right1 && !(top > bottom1 || bottom < top1)) {
					bFlag = true;
					break;
				}

				//内部左右
				if (top > top1 && bottom < bottom1 && !(right < left1 || left > right1)) {
					bFlag = true;
					break;
				}

				/*if (bottom < top1 || top > bottom1 || right < left1 || left > right1) {
					bFlag = false;
				} else {
					bFlag = true;
				}*/
			}

			return bFlag;
		},

		//把获取到的数据转换成原始数据   TxtName.changeOriginalData();
		changeOriginalData: function(data) {
			var aOriginalData = [];
			for (var attr in oTxt) {

				for (var attr2 in data) {

					if (attr == attr2) {
						aOriginalData.push(oTxt[attr]);
					}
				}
			};

			return aOriginalData;
		}
	};

	//实用方法
	var MapTools = {

        //ajax(get)封装   Map.MapTools.ajax()
		ajax: function(url, fnSucc, fnFaild) {
	        //1.创建Ajax对象
	        var oXhr;
	        if (window.XMLHttpRequest) {
	            oXhr = new XMLHttpRequest();
	        } else {//兼容ie5/6
	            oXhr = new ActiveXObject("Microsoft.XMLHTTP");
	        };

	        //2.与后台建立连接
	        oXhr.open('GET', url, true);//参数:1.get/post; 2.文件路径; 3.是否异步，同步

	        //3. 发送请求
	        oXhr.send();

	        //4.接收返回
	        oXhr.onreadystatechange = function () {
                if (oXhr.readyState == 4) {
                    if (oXhr.status == 200) {
                        fnSucc(oXhr.responseText);
                    } else {

                        if (fnFaild) fnFaild();
                    };
                };
	        };
		},

		//ajax、表单之类的
		json2url: function(json) {
			var aUrl = [];
			for (var attr in json) {
				var str = json[attr] + '';
				str = str.replace(/\n/g, '<br/>');
				str = encodeURIComponent(str);
				aUrl.push(attr + '=' + str);
			}
			return aUrl.join('&');
		},
        //ajax封装(含post和get)
		ajax2: function(url, opt) {  //MapTools.ajax2();
			opt = opt || {};
			opt.data = opt.data || {};
			opt.data.t = opt.data.t || new Date().getTime();
			opt.method = opt.method || 'get';

			var oAjax = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

			if (opt.method == 'post') {
				oAjax.open('POST', url, true);
				oAjax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				try {
					oAjax.send(opt.data ? MapTools.json2url(opt.data) : null);
				} catch (e) {}
			} else {
				url += '?' + MapTools.json2url(opt.data);
				oAjax.open('GET', url, true);
				try {
					oAjax.send();
				} catch (e) {}
			}

			oAjax.onreadystatechange = function() {
				if (oAjax.readyState == 4) {
					if (oAjax.status == 200) {
						opt.fnSucc && opt.fnSucc(oAjax.responseText);
					} else {
						opt.fnFaild && opt.fnFaild(oAjax.status);
					}
				}
			};
		},


		getStyle: function(obj, attr) {
			if (obj.currentStyle) {
				return obj.currentStyle[attr];
			} else {
				return getComputedStyle(obj, false)[attr];
			}
		},
		//运动  MapTools.startMove()
		startMove: function(obj, json, fn) {
			clearInterval(obj.timer);
			obj.timer = setInterval(function() {
				var attr = '';
				var iStop = true; //假设所有值都到达了，定时器里一轮的运动结束了
				for (attr in json) {
					//1.计算当前值
					var iCurr = 0;
					if (attr == 'opacity') {
						iCurr = parseInt(parseFloat(Map.MapTools.getStyle(obj, attr)) * 100);
					} else {
						iCurr = parseInt(Map.MapTools.getStyle(obj, attr));
					}
					//2.计算速度
					var speed = (json[attr] - iCurr) / 8;
					speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);
					//3.检测停止
					if (iCurr != json[attr]) {
						iStop = false;
					};
					if (attr == 'opacity') {
						obj.style.opacity = (iCurr + speed) / 100;
						obj.style.filter = 'alpha(opacity:' + (iCurr + speed) + ')';
					} else {
						obj.style[attr] = iCurr + speed + 'px';
					};
				};
				if (iStop) { //所有属性都到达了目标，那就关闭定时器
					clearInterval(obj.timer);
					fn && fn();
				};
			}, 30);
		},

		// 根据2坐标点求2点之间的距离  MapTools.getDistance();
		getDistance: function (x1, y1, x2, y2) {
			var a, b, x, d;
		    a = x1 - x2;
		    b = y1 - y2;
		    x = a*a + b*b;
		    d = Math.sqrt(x);
		    return d;
		},
	};

	var HandleNode = {

		//通过class名获取dom节点对象
		getByClass: function(oParent, sClass) {    
			var aEles = oParent.getElementsByTagName('*');
			var re = new RegExp('\\b' + sClass + '\\b', 'i');
			var aResult = [];

			for (var i = 0; i < aEles.length; i++) {
				if (re.test(aEles[i].className)) aResult.push(aEles[i]);
			}

			return aResult;
		},
	    
	    //获取节点元素的非行间样式(如果有行间样式就获取行间样式)
		getStyle: function(obj, sName) {
			if (obj.currentStyle) {
				return obj.currentStyle[sName];
			} else {
				return getComputedStyle(obj, false)[sName];
			}
		},

		/**
	     *    给节点元素添加样式  Map.HandleNode.setStyle()
	     *    use: setStyle([oDiv,oDiv2], {width: '100px', height: '100px', background: '#ccc', opacity: 30});
	     *    use: setStyle(oDiv, {width: 100, height: 100, background: '#ccc', opacity: 30});
		 */
		setStyle: function(obj, json) {
			if (obj.length) {    //对象数组

				for (var i = 0; i < obj.length; i++) {
					arguments.callee(obj[i], json);
				}

			} else {
				if (arguments.length == 2){

					for (var attr in json) {
						arguments.callee(obj, attr, json[attr]);
					}

				} else {
					switch (arguments[1].toLowerCase()) {
						case 'opacity':
							obj.style.filter = 'alpha(opacity:' + arguments[2] + ')';
							obj.style.opacity = arguments[2] / 100;
							break;
						default:
							if (typeof arguments[2] == 'number') {
								obj.style[arguments[1]] = arguments[2] + 'px';
							} else {
								obj.style[arguments[1]] = arguments[2];
							}
							break;
					}
				}
			}
		},

		//给元素节点设置Css3样式   HandleNode.setStyle3();
		setStyle3: function(obj, name, value) {
	  		obj.style['Webkit' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
	  		obj.style['Moz' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
	  		obj.style['ms' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
	  		obj.style['O' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
	  		obj.style[name] = value;
		}
	};

	//静态导航
	var StaticGPS = {
		iStartSvgPosX: 0,
		iStartSvgPosY: 0,   //svg起点坐标   Map.StaticGPS.iStartSvgPosX
		iEndSvgPosX: 0,
		iEndSvgPosY: 0,    //svg终点坐标    Map.StaticGPS.iEndSvgPosX
		bHasOne: false,   //是否已经标记一个点了  Map.StaticGPS.bHasOne
		bIsClickStart: false,    //是否可以点击第一个点  Map.StaticGPS.bIsClickStart
		bHasTwo: false,   //是否已经标记一个点了  Map.StaticGPS.bHasTwo
		bStart: false,    //起点是否选中  Map.StaticGPS.bStart
		bEnd: false,    //终点是否选中  Map.StaticGPS.bEnd
		bClickMap: false,    //如果2个地图图片都有就为 true    Map.StaticGPS.bClickMap
		bIsBluetooth: false,    //是否开启了蓝牙定位  Map.StaticGPS.bIsBluetooth
		aObjClientPos: {},   //存储地图的轨迹坐标 Map.StaticGPS.aObjClientPos

		//选点(起点和终点)
		setPoint: function (aClientPos) {
			oUnit = {}; //每次点击先清空上一次的选中的unit数据
			var iClientX = aClientPos[0],
			    iClientY = aClientPos[1];
			var iSvgX, iSvgY; //把屏幕坐标转换成svg坐标 
			iSvgX = ((iClientX - lastPX) * Math.cos(lastSvgAngle * Math.PI / 180) + (iClientY - lastPY) * Math.sin(lastSvgAngle * Math.PI / 180)) / scale;
			iSvgY = ((iClientY - lastPY) * Math.cos(lastSvgAngle * Math.PI / 180) - (iClientX - lastPX) * Math.sin(lastSvgAngle * Math.PI / 180)) / scale;

			for (var attr in oTxt) {
				var iLeft = oTxt[attr].boundLeft;
				var iRight = oTxt[attr].boundRight;
				var iTop = oTxt[attr].boundTop;
				var iBottom = oTxt[attr].boundBottom;

				if (iLeft <= iSvgX && iSvgX <= iRight && iTop <= iSvgY && iSvgY <= iBottom) {
					oUnit = oTxt[attr];
					StaticGPS.showInfo(oTxt[attr], [iClientX, iClientY], [iSvgX, iSvgY]);
				}
			};

			/*//如果没有选中unit,那就隐藏那个显示信息div
			if (!oUnit.name) {
				var oMapImage = document.querySelector('.qi_img');
				var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
				oMapImage.style.display = 'none';
				oHuizhan_box.style.display = 'none';
			}*/
		},

		//显示信息(从这里出发，到这去)
		showInfo: function(obj, aClientPos, aSvgPos) {
			aUnitSvgPos = aSvgPos;    //把地图固定的位置存一下
			var iClientX = aClientPos[0],
			    iClientY = aClientPos[1];
			var oMapImage = document.querySelector('#imgOne');  //地图图标1
			var oMapImage2 = document.querySelector('#imgTwo');  //地图图标2
			var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
			

			/*var iMapImageWidth = oMapImage.offsetWidth;
			var iMapImageHeight = oMapImage.offsetHeight;
			var iRealClientX = iClientX - iMapImageWidth/2;
			var iRealClientY = iClientY - iMapImageHeight;*/

			var iRealClientX = iClientX - 11;
			var iRealClientY = iClientY - 35;
            //oMapImage对象处理
            if (!Map.StaticGPS.bEnd) {
            	if (StaticGPS.bHasOne) {
            		oMapImage2.style.display = 'block';
            		oMapImage2.style.left = iRealClientX + 'px';
            		oMapImage2.style.top = iRealClientY + 'px';
            	} else {
            		oMapImage.style.display = 'block';
            		oMapImage.style.left = iRealClientX + 'px';
            		oMapImage.style.top = iRealClientY + 'px';
            	};
            } else {
            	oMapImage2.style.display = 'block';
        		oMapImage2.style.left = iRealClientX + 'px';
        		oMapImage2.style.top = iRealClientY + 'px';
            }

			//oHuizhan_box对象处理
			oHuizhan_box.style.display = 'block';
			var oUnitName = oHuizhan_box.children[0].children[0].children[0];
			var oUnitZWH = oHuizhan_box.children[0].children[0].children[1];
			oUnitName.innerHTML = obj.name;
			oUnitZWH.innerHTML = "展位号：" + obj.boothNumber;

			// alert(oMapImage);
		}, 

		//svg坐标和屏幕坐标实时转换   Map.MapFn.changePosPoint(oUnit,aUnitSvgPos);
		changePosPoint: function(obj, aSvgPos) {
			//屏幕坐标中的iPosX,iPosY
			var iPosX = Math.cos(lastSvgAngle * Math.PI / 180) * aSvgPos[0] * scale - Math.sin(lastSvgAngle * Math.PI / 180) * aSvgPos[1] * scale + lastPX;
			var iPosY = Math.cos(lastSvgAngle * Math.PI / 180) * aSvgPos[1] * scale + Math.sin(lastSvgAngle * Math.PI / 180) * aSvgPos[0] * scale + lastPY;

			var iMapImageWidth = obj.offsetWidth;
			var iMapImageHeight = obj.offsetHeight;

			var iRealClientX = iPosX - 20;
			var iRealClientY = iPosY - 20;

			obj.style.left = iRealClientX + 'px';
			obj.style.top = iRealClientY + 'px';
		},

		/**
         * 图片划成线方法
         * @method Map.MapFn.draw();
         * @param {string} id
         * @param {Array} objArr
         * @use var points = [{'x':300, 'y':500}, {'x':450, 'y':300}];  传点(客户端的点集合)然后调用
	            Map.MapFn.draw('id', points);
         */
		draw: function(id, objArr) { //参数 id获取元素 ，对象数组
			var obj = document.getElementById(id);

			var x1 = objArr[0].x;
			var y1 = objArr[0].y; //第一个坐标点的 x,y
			var x2, y2; //紧接着x1,y1后的坐标

			var lastAvgle, //每次更新后的角度
				interval = 5; //间距

			for (var i = 1; i < objArr.length; i++) {
				x2 = objArr[i].x;
				y2 = objArr[i].y;

				var k; //斜率
				var vertLine = false; //是否垂直线，此时计算斜率为无穷大
				
				if(x2 != x1){
					k = (y2 - y1) / (x2 - x1);
				}else{
					vertLine = true;
				}
				
				var dis = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)); //斜边长
				var n = parseInt(dis / interval);
				if (dis / interval - n >= 0.5) { //像素超过0.5就向上取整
					n++;
				};
				var dint = dis / n; //斜边平均化

				var dx, dy;
				if(!vertLine){
					dx = Math.sqrt(dint * dint / (1 + k * k)); //求平均化得x
					if (x2 < x1) {
						dx = -dx;
					}
					dy = dx * k; //求平均化得y
				}else{
					dx = 0;
					if(y2 > y1){
						dy = dint;
					}else{
						dy = -dint;
					}
				}

				var c = dis;
				var angle;
				if (x2 >= x1 && y2 >= y1) //四个象限的角度
					angle = Math.asin((y2 - y1) / c) / Math.PI * 180 + 90;
				else if (x2 <= x1 && y2 >= y1)
					angle = Math.asin((x1 - x2) / c) / Math.PI * 180 + 180;
				else if (x2 <= x1 && y2 <= y1)
					angle = 360 - Math.asin((x1 - x2) / c) / Math.PI * 180;
				else
					angle = 90 - Math.asin((y1 - y2) / c) / Math.PI * 180;

				if (i > 1) { //从第3个点开始就开始转弯

					var fangle = (lastAngle + angle) / 2; //两线转折点的旋转角度取两条线旋转角度的平均值
					if(Math.abs(lastAngle-angle) > 180){
						if(fangle > 180){
							fangle -= 180;
						}else{
							fangle += 180;
						}
					}
					StaticGPS.drawAr(obj, x1, y1, fangle); //转折点的第一个点旋转值为fangle

					for (var j = 1; j < n; j++) {
						StaticGPS.drawAr(obj, x1 + dx * j, y1 + dy * j, angle);
					}
				} else {
					for (var j = 0; j < n; j++) {
						StaticGPS.drawAr(obj, x1 + dx * j, y1 + dy * j, angle);
					}
				}

				lastAngle = angle; //更新角度 
				x1 = x2; //更新x,y
				y1 = y2;
			}
		},

		//画图片
		drawAr: function(obj, x, y, angle) { //父元素obj, x:left, y:top ,角度

			var oImg = document.createElement("img");

			oImg.style.position = "absolute";
			oImg.src = "http://wx.indoorun.com/images/ar.png";
			oImg.style.left = x - 2 + "px"; //为了让旋转中心落在直线上  -10 , -7
			oImg.style.top = y - 1 + "px";
			oImg.style.transform = "rotate(" + angle + "deg)";
			oImg.style.WebkitTransform = "rotate(" + angle + "deg)";
			oImg.style.MozTransform = "rotate(" + angle + "deg)";
			oImg.style.msTransform = "rotate(" + angle + "deg)";
			oImg.style.OTransform = "rotate(" + angle + "deg)";
			oImg.style.display = "block";

			obj.appendChild(oImg);
		},

		//向服务器请求坐标  Map.StaticGPS.askPos(iStartSvgPosX, iStartSvgPosY, iEndSvgPosX, iEndSvgPosY);
		askPos: function (sx, sy, tx, ty) { //sx, sy svg起始坐标  tx, ty  svg终点坐标 
			/*var url = 'http://wx.indoorun.com/wx/getNearestLines.html?regionId=' + regionId + '&floorId=' + floorId + '&sx='+sx+'&sy='+sy+'&tx='+tx+'&ty='+ty;
			Map.MapTools.ajax(url, function(str) {
				var data = eval('('+str+')');
				if (data != null) {
					if (data.code == "success") {
						var aSvgPos = data.data;
						StaticGPS.aObjClientPos = aSvgPos;
						var aClientPos = StaticGPS.changeToClientPos(aSvgPos);
						StaticGPS.draw('line', aClientPos);
					}
				}
			}, function() {
				alert('数据获取失败!');
			});*/
			/*$.get(url, {}, function(data) {

				if (data != null) {
					if (data.code == "success") {
						var aSvgPos = data.data;
						StaticGPS.aObjClientPos = aSvgPos;
						var aClientPos = StaticGPS.changeToClientPos(aSvgPos);
						StaticGPS.draw('line', aClientPos);

					} else {
						var msg = data.msg;
						alert(msg);
					}
				} else {
					alert("获取数据错误。");
				}
			});*/
			var url = 'http://wx.indoorun.com/wx/getNearestLines.html';
			Map.MapTools.ajax2(url, {
				data: {'regionId': regionId, 'floorId': floorId, 'sx': sx, 'sy': sy, 'tx': tx, 'ty': ty},
				fnSucc: function(str) {
					str = str.replace(/\n/g, '');
					var data = eval('(' + str + ')');
					if (data != null) {
						if (data.code == "success") {
							var aSvgPos = data.data;
							StaticGPS.aObjClientPos = aSvgPos;
							var aClientPos = StaticGPS.changeToClientPos(aSvgPos);
							StaticGPS.draw('line', aClientPos);
						}
					}
				},
				fnFaild: function(str) {
					alert('阿欧,坐标数据没有找到!'+str);
				},
			});
		},

		//服务器端的svg坐标集合转化为客户端的坐标对象数组
		changeToClientPos: function (aObj) {
			var aNewObj = [];  //新的对象数组

			for (var attr in aObj) {
				var x = Math.cos(lastSvgAngle * Math.PI / 180) * (aObj[attr].x) * scale - Math.sin(lastSvgAngle * Math.PI / 180) * (aObj[attr].y) * scale + lastPX; //屏幕坐标中的x,y
				var y = Math.cos(lastSvgAngle * Math.PI / 180) * (aObj[attr].y) * scale + Math.sin(lastSvgAngle * Math.PI / 180) * (aObj[attr].x) * scale + lastPY;
				var obj = {};
				obj.x = x;
				obj.y = y;
				aNewObj.push(obj);
			};

			return aNewObj;
		},

		//移动时把画的线，起始和终点坐标都影藏
		hideTrajectory: function () {    //StaticGPS.hideTrajectory();
			//把起始图片div影藏
			document.querySelector('#imgOne').style.display = 'none';

			//把终点图片div影藏
			document.querySelector('#imgTwo').style.display = 'none';

			//把线删掉
			document.querySelector('#line').innerHTML = '';

			var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
			oHuizhan_box.style.display = 'none';
		},

		//移动结束把线，和起点和终点显示
		showTrajectory: function () {    //StaticGPS.showTrajectory();
		
			//把起始图片div显示
			var oStart = document.querySelector('#imgOne');
			if (Map.StaticGPS.iStartSvgPosX != 0 || Map.StaticGPS.iStartSvgPosY != 0 && Map.StaticGPS.bHasOne) oStart.style.display = 'block';
			if(!Map.StaticGPS.bIsBluetooth) {
				Map.StaticGPS.changePosPoint(oStart, [Map.StaticGPS.iStartSvgPosX, Map.StaticGPS.iStartSvgPosY]);
			} else {
				oStart.style.display = 'none';
			}

			//把终点图片div显示
			var oEnd = document.querySelector('#imgTwo');
			if (Map.StaticGPS.iEndSvgPosX != 0 || Map.StaticGPS.iEndSvgPosY != 0 && Map.StaticGPS.bEnd) oEnd.style.display = 'block';
			Map.StaticGPS.changePosPoint(oEnd, [Map.StaticGPS.iEndSvgPosX, Map.StaticGPS.iEndSvgPosY]);

			//重新划线
			var aClientPos = StaticGPS.changeToClientPos(StaticGPS.aObjClientPos);
			if (aClientPos.length != 0) Map.StaticGPS.draw('line', aClientPos);
			
			
		},
	};

	//事件处理（跨浏览器）
	var EventUtil = {
		//事件绑定  EventUtil.addHandler()
		addHandler: function(element, type, handler) { //要绑定的元素, 事件类型, 发生事件的函数
			if (element.addEventListener) {
				element.addEventListener(type, handler, false); // false为事件冒泡 (w3c标准下)
			} else if (element.attachEvent) {
				element.attachEvent('on' + type, handler); //  只有事件冒泡 (ie下)
			} else {
				element['on' + type] = handler;
			}
		},

		//事件移除 
		removeHandler: function(element, type, handler) {
			if (element.removeEventListener) {
				element.removeEventListener(type, handler, false);
			} else if (element.detachEvent) {
				element.detachEvent('on' + type, handler);
			} else {
				element['on' + type] = null;
			}
		},

		//获取事件对象 
		getEvent: function(event) {
			return event ? event : window.event;
		},

		//获取事件目标 
		getTarget: function(event) {
			var oEvent = EventUtil.getEvent(event);
			return oEvent.target || oEvent.srcElement; //标准或ie下
		},

		//取消默认事件 
		preventDefault: function(event) {
			var oEvent = EventUtil.getEvent(event);
			oEvent.preventDefault ? oEvent.preventDefault() : oEvent.returnValue = false;
		},

		//阻止事件冒泡和事件捕获 
		stopPropagation: function(event) {
			var oEvent = EventUtil.getEvent(event);
			oEvent.stopPropagation ? oEvent.stopPropagation() : oEvent.cancelBubble = true;
		}
	};

	//管理页面的点击事件
	var ManageClick = {

		bClickBtn: false,   //点击楼层  ManageClick.bClickBtn
		bSwitchFloor: false,   //是否切换了楼层  ManageClick.bSwitchFloor

		clickMapOrText: function(ev) {    //点击地图
			var oEvent = ev || event;
			var iPosX = oEvent.clientX;
			var iPosY = oEvent.clientY;

			// debug.log(iPosX+','+iPosY);
			StaticGPS.setPoint([iPosX, iPosY]);
		},

		startPoint: function(aSvgPos) {    //点击从这里出发

			if (Map.StaticGPS.bIsClickStart) {
				// debug.log('动态导航已开启，请直接选择终点!');
				document.querySelector('#upperbbTip').style.display = 'block';
			} else {
				Map.StaticGPS.bStart = !Map.StaticGPS.bStart;

				var oImage = document.querySelector('#imgOne').children[0];  //地图图标1
				var oImage2 = document.querySelector('#imgTwo').children[0];  //地图图标2

				if (!Map.StaticGPS.bEnd) {
					if (Map.StaticGPS.bStart) {    //选中起点
						oImage.src = 'test/image/qi.png';

						var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
						oHuizhan_box.style.display = 'none';

						Map.StaticGPS.iStartSvgPosX = aSvgPos[0];
						Map.StaticGPS.iStartSvgPosY = aSvgPos[1];
						// alert('('+Map.StaticGPS.iStartSvgPosX+','+Map.StaticGPS.iStartSvgPosY+')');

						var oEndBox = document.querySelector('.end_box');
						oEndBox.innerHTML = '请标记终点';
						oEndBox.style.display = 'block';
						setTimeout(function () {
							oEndBox.style.display = 'none';
						}, 2000);

						Map.StaticGPS.bHasOne = true;  //成功标记一个点

					} else {

						document.querySelector('#imgTwo').style.display = 'none';
						oImage2.src = 'test/image/q9_01.png';
						var x = Math.cos(lastSvgAngle * Math.PI / 180) * aSvgPos[0] * scale - Math.sin(lastSvgAngle * Math.PI / 180) * aSvgPos[1] * scale + lastPX; //屏幕坐标中的x,y
						var y = Math.cos(lastSvgAngle * Math.PI / 180) * aSvgPos[1] * scale + Math.sin(lastSvgAngle * Math.PI / 180) * aSvgPos[0] * scale + lastPY;
						document.querySelector('#imgOne').style.left = x-11 + 'px';
						document.querySelector('#imgOne').style.top = y-35 + 'px';
						

						var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
						oHuizhan_box.style.display = 'none';

						Map.StaticGPS.iStartSvgPosX = aSvgPos[0];
						Map.StaticGPS.iStartSvgPosY = aSvgPos[1];
						// alert('('+Map.StaticGPS.iStartSvgPosX+','+Map.StaticGPS.iStartSvgPosY+')');

						var oEndBox = document.querySelector('.end_box');
						oEndBox.innerHTML = '请标记终点2';
						oEndBox.style.display = 'block';
						setTimeout(function () {
							oEndBox.style.display = 'none';
						}, 2000);

						Map.StaticGPS.bStart = !Map.StaticGPS.bStart;
					};
				} else {
					oImage2.src = 'test/image/qi.png';

					var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
					oHuizhan_box.style.display = 'none';

					Map.StaticGPS.iStartSvgPosX = aSvgPos[0];
					Map.StaticGPS.iStartSvgPosY = aSvgPos[1];

					//开始划线
					var oMask_bg = document.querySelector('#mask_bg');
					var oZheZhao = document.querySelector('#bg');
					oZheZhao.style.display = 'block';
					oMask_bg.style.display = 'block';

					setTimeout(function () {
						oMask_bg.style.display = 'none';
						oZheZhao.style.display = 'none';
						Map.StaticGPS.askPos(Map.StaticGPS.iStartSvgPosX, Map.StaticGPS.iStartSvgPosY, Map.StaticGPS.iEndSvgPosX, Map.StaticGPS.iEndSvgPosY);
					}, 1000);

					//出现导航中
					var oJpsBox = document.querySelector('.jps_box');
					var oCancle = oJpsBox.children[0];
					oJpsBox.style.display = 'block';

					Map.StaticGPS.bClickMap = true;
				};
			};
			
		},

		endPoint: function(aSvgPos) {    //点击到这去
			var oImage = document.querySelector('#imgOne').children[0];  //地图图标1
			var oImage2 = document.querySelector('#imgTwo').children[0];  //地图图标2
			if (Map.StaticGPS.bHasOne) {  //已经有了起点了
				// alert('划线');
				oImage2.src = 'test/image/end.png';

				var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
				oHuizhan_box.style.display = 'none';

				Map.StaticGPS.iEndSvgPosX = aSvgPos[0];
				Map.StaticGPS.iEndSvgPosY = aSvgPos[1];

				//开始划线
				var oMask_bg = document.querySelector('#mask_bg');
				var oZheZhao = document.querySelector('#bg');
				oZheZhao.style.display = 'block';
				oMask_bg.style.display = 'block';

				setTimeout(function () {
					oMask_bg.style.display = 'none';
					oZheZhao.style.display = 'none';
					Map.StaticGPS.askPos(Map.StaticGPS.iStartSvgPosX, Map.StaticGPS.iStartSvgPosY, Map.StaticGPS.iEndSvgPosX, Map.StaticGPS.iEndSvgPosY);
				}, 1000);

				//出现导航中
				var oJpsBox = document.querySelector('.jps_box');
				var oCancle = oJpsBox.children[0];
				oJpsBox.style.display = 'block';

				Map.StaticGPS.bClickMap = true;

			} else {    //没有起点的情况下
				if (!Map.StaticGPS.bEnd) {
					// alert('划线2');
					oImage.src = 'test/image/end.png';

					Map.StaticGPS.iEndSvgPosX = aSvgPos[0];
					Map.StaticGPS.iEndSvgPosY = aSvgPos[1];

					var oEndBox = document.querySelector('.end_box');
					oEndBox.innerHTML = '请标记起点';
					oEndBox.style.display = 'block';
					setTimeout(function () {
						oEndBox.style.display = 'none';
					}, 2000);

					//底部地图(从这里出发，到这去)
					var oHuizhan_box = document.querySelector('.huizhan_box'); 
				    oHuizhan_box.style.display = 'none';

					Map.StaticGPS.bEnd = true;
				}
			}
		},

		cancleBtn: function() {    //点击取消按钮

			var oZheZhao = document.querySelector('#bg');
			oZheZhao.style.display = 'block';

			var oUpper = document.querySelector('.upper');    //取消导航div
			oUpper.style.display = 'block';
		},

		goOnGps: function() {    //点击取消(继续导航)

			var oZheZhao = document.querySelector('#bg');
			oZheZhao.style.display = 'none';

			var oUpper = document.querySelector('.upper');    
			oUpper.style.display = 'none';
		},

		cancleGps: function() {    //点击确定(放弃导航)  ManageClick.cancleGps()

			var oZheZhao = document.querySelector('#bg');
			oZheZhao.style.display = 'none';
			
			//导航div影藏
			var oUpper = document.querySelector('.upper');    
			oUpper.style.display = 'none';

			//出现导航中影藏
			var oJpsBox = document.querySelector('.jps_box');
			var oCancle = oJpsBox.children[0];
			oJpsBox.style.display = 'none';

			//把起终和划线影藏
			document.querySelector('#imgOne').children[0].src = 'test/image/q9_01.png'; 
			document.querySelector('#imgTwo').children[0].src = 'test/image/q9_01.png'; 
			document.querySelector('#imgOne').style.display = 'none';
			document.querySelector('#imgTwo').style.display = 'none';
			document.querySelector('#line').innerHTML = '';

			//动态点影藏
			// document.querySelector('#pointImg').style.display = 'none';

			//把数据归0
			Map.StaticGPS.iStartSvgPosX = 0;
			Map.StaticGPS.iStartSvgPosY = 0;
			Map.StaticGPS.iEndSvgPosX = 0;
			Map.StaticGPS.iEndSvgPosY = 0;
			Map.StaticGPS.bHasOne = false;
			Map.StaticGPS.bStart = false;
			Map.StaticGPS.bEnd = false;
			Map.StaticGPS.bClickMap = false;
			Map.StaticGPS.aObjClientPos = {};

			bIsShow = false;
			Map.StaticGPS.bIsBluetooth = false;
		},

		cancleMap: function() {  //影藏地图图标
			//如果没有选中unit,那就隐藏那个显示信息div
			if (Map.StaticGPS.bStart == false && Map.StaticGPS.bEnd == false && Map.StaticGPS.bHasOne == false) {
				if (oUnit.name) {
					var oMapImage = document.querySelector('.qi_img');
					var oHuizhan_box = document.querySelector('.huizhan_box'); //底部地图(从这里出发，到这去)
					oMapImage.style.display = 'none';
					oHuizhan_box.style.display = 'none';
				}
			}
		},

		giveUpGSP: function() {    //到达目的地附近取消导航
			ManageClick.cancleGps();
			document.querySelector('#upper_dd').style.display = 'none';
		},

		bluetoothBtn: function() {    //点击蓝牙     Map.ManageClick.bluetoothBtn();
			locationGPS(false);
			/*ManageClick.cancleGps();
			bIsGPS = true;
			Map.StaticGPS.bIsClickStart = true;
			getInfo();
			Map.StaticGPS.bIsBluetooth = true;*/
		},

		zhizhen: function() {
			// debug.log('指针');
			change(scale, 2);
		},

		defaultBtn: function() {

			if (!Map.StaticGPS.bClickMap) {
				ManageClick.bClickBtn = !ManageClick.bClickBtn;
				var oDefault = document.querySelector('#default');
				var oDefaultBtn = document.querySelector('#defaultBtn');
				var oPtionBtn = document.querySelector('#optionBtn');
				var aBtn = oPtionBtn.childNodes;
				var aBtns = [];

				if (ManageClick.bClickBtn) {
					Map.HandleNode.setStyle(oDefault, {'background-image': "url(\'images/lou-01.png\')", 'color': '#999999'});    //蓝色带箭头
					oPtionBtn.style.display = 'block';
				} else {
					Map.HandleNode.setStyle(oDefault, {'background-image': "url(\'images/lou-1.png\')", 'color': '#f60'});    //灰色
					oPtionBtn.style.display = 'none';
				};

				for (var i = 0, len = aBtn.length; i < len; i++) {
					if (aBtn[i].nodeType == 1) {
						aBtns.push(aBtn[i]);
					}
				}

				for (var j = 0, len = aBtns.length; j < len; j++) {
					var aChilds = Map.HandleNode.getByClass(aBtns[j], 'info');
					if (oDefaultBtn.innerHTML == aChilds[2].innerHTML) {
						Map.HandleNode.setStyle(aBtns[j], {'background-image': "url(\'images/lou-02.png\')"});    //蓝色不带箭头
					} else {
						Map.HandleNode.setStyle(aBtns[j], {'background-image': "url(\'images/lou-2.png\')"});    //黑色
					};
				}

			}
		},

		//切换楼层 
		switchFloor: function(sId) {    //ManageClick.switchFloor
			var oDefault = document.querySelector('#default');
			var oDefaultBtn = document.querySelector('#defaultBtn');
			var oPtionBtn = document.querySelector('#optionBtn');
			var aBtn = oPtionBtn.childNodes;
			var aBtns = [];
			var aChilds = null;    //关键数据
			var obj = document.querySelector('#'+sId);

			for (var i = 0, len = aBtn.length; i < len; i++) {
				if (aBtn[i].nodeType == 1) {
					aBtns.push(aBtn[i]);
				}
			}

			//处理特效逻辑
			ManageClick.bClickBtn = !ManageClick.bClickBtn;
			var name = '';
			if (/btn_/.test(sId)) {
				var aSpan = obj.getElementsByTagName('span');
				aChilds = aSpan;
				name = aSpan[0].innerHTML;

			} else if (/btn2_/.test(sId)) {
				name = obj.innerHTML;
				var oParent = obj.parentNode;
				aChilds = oParent.getElementsByTagName('span');
			}
			oPtionBtn.style.display = 'none';
			oDefaultBtn.innerHTML = name;
            
            //换地图
			floorId = aChilds[1].innerHTML;
			regionId = aChilds[2].innerHTML;
			// console.log("id:"+aChilds[1].innerHTML);
			// console.log("regionId:"+aChilds[2].innerHTML);
			document.querySelector('#svgBox').innerHTML = '';
			document.getElementById('g_txt').innerHTML = '';
			// document.querySelector('#optionBtn').innerHTML = '';
			loadRegion();
			ManageClick.bClickBtn = !ManageClick.bClickBtn;
			// console.log('最后:'+ManageClick.bClickBtn);

		},

		upperTipKown: function() {
			document.querySelector('#upperTip').style.display = 'none';
		},

		upperbbTipKown: function() {
			document.querySelector('#upperbbTip').style.display = 'none';
		},

		//事件委托   Map.ManageClick.delegate()
		delegate: function() {
			Map.EventUtil.addHandler(document.getElementById('svgFrame'), 'click', function(event) {
				var oEvent = event || window.event;
				var oTarget = Map.EventUtil.getTarget(oEvent); //获取事件目标
				// alert(oTarget.id);
				var sId = oTarget.id;
				if (sId.substring(0, 5) === 'unit_' || sId.substring(0, 5) === 'rect_' || sId === 'index-main' || sId.substring(0, 2) === 'm_') {

					if (!Map.StaticGPS.bClickMap) ManageClick.clickMapOrText(); //处理点击地图

				} else if (sId.substring(0, 4) === 'btn_' || sId.substring(0, 5) === 'btn2_') {
					ManageClick.switchFloor(sId);    //切换楼层
				} else if (sId == 'default' || sId == 'defaultBtn') {
					ManageClick.defaultBtn();    //点击切换楼层按钮
				} else {
					switch (oTarget.id) { //以下处理页面其他点击事件
						case 'startPoint':
							ManageClick.startPoint(aUnitSvgPos);
							break;
						case 'endPoint':
							ManageClick.endPoint(aUnitSvgPos);
							break;
						case 'cancleBtn':
						    ManageClick.cancleBtn();    //点击X按钮
							break;
						case 'noCancleGps':
						    ManageClick.goOnGps();    //点击取消(继续导航)
							break;
						case 'CancleGps':
						    ManageClick.cancleGps();    //点击确定(放弃导航)
							break;
						case 'giveUpGSP':
						    ManageClick.giveUpGSP();    //到达目的地(取消导航)
							break;
						case 'bluetooth':
						    ManageClick.bluetoothBtn();    //点击蓝牙
						    break;
						case 'upperTipKown':     //蓝牙提示
						    ManageClick.upperTipKown();
						    break;
						case 'upperbbTipKown':
						    ManageClick.upperbbTipKown();
						    break;
						case '':
						    ManageClick.cancleMap();    //影藏地图图标
						    break;
					}
				}
			});
		}
	};

	var Manager = {
		TxtName: TxtName,
		MapTools: MapTools,
		EventUtil: EventUtil,
		ManageClick: ManageClick,
		StaticGPS: StaticGPS,
		HandleNode: HandleNode,
	};
	return Manager;
})();

window.addEventListener("load", function() { //解决300ms延迟问题
	FastClick.attach(document.body);
}, false);

function compass() {  //指南针自动改变方向
	var oImg = document.querySelector("#zhizhen");
	var angle = initAngle + lastSvgAngle + 45;
	if (oImg) Map.HandleNode.setStyle3(oImg, 'transform', 'rotate('+angle+'deg)');
};

function change(iCurr, iTarget) {
	var timer = setInterval(function() {
		
		if (iCurr < iTarget) {
			iCurr += 0.1;	
			if (iCurr >= iTarget) {
				clearInterval(timer);	
				scale = iCurr;
			}
		} else {
			iCurr -= 0.1;	
			if (iCurr <= iTarget) {
				clearInterval(timer);
				scale = iCurr;
			} 
		};

		map_show(iCurr, lastPX, lastPY);
	}, 30);
};

// 自动生成楼层
function makeFloor(aFloorList) {
	var sHtml = '';
	var oPtionBtn = document.querySelector('#optionBtn');
	var oDefaultBtn = document.querySelector('#defaultBtn');
	    

	//自动生成楼层选项
	for (var i = 0, len = aFloorList.length; i < len; i ++) {
		aFloors[aFloorList[i].id] = aFloorList[i].name;
		if (floorId == aFloorList[i].id) {
			oDefaultBtn.innerHTML = aFloorList[i].title;
		}

		sHtml += "<div id=\"btn_"+ i +"\" class=\"louc-btn-b\"><span id=\'btn2_"+ i +"\'>"+ aFloorList[i].title +"</span><span class=\'info\' style=\"display: none\">"+ aFloorList[i].id +"</span><span class=\'info\' style=\"display: none\">"+ aFloorList[i].regionId +"</span><span class=\'info\' style=\"display: none\">"+ aFloorList[i].name +"</span></div>";
	}

	oPtionBtn.innerHTML = sHtml;
	// console.log(aFloors);

};

function loadRegion(){

	$.get('/wx/getSvg.html', {'regionId':regionId, 'floorId':floorId}, function(data) {

		if (data != null) {
			if (data.code == "success") {
				var svg = data.data;

				$("#svgBox").html(svg);

				//给每个unit添加一个id
				var aUnit = document.querySelector('#unit');
				if (aUnit) {
					var aPolygon = aUnit.getElementsByTagName('polygon');
					var aRect = aUnit.getElementsByTagName('rect');

					for (var i = 0; i < aPolygon.length; i++) {
						aPolygon[i].id = 'unit_' + i;
					}

					for (var i = 0; i < aRect.length; i++) {
						aRect[i].id = 'rect_' + i;
					}
				}
				

				calcLevel();

				$("#svgFrame").css('display', 'block');
				$("#svgBox").css("visibility", "visible");

				//进行文字加载
				Map.TxtName.getTxtList();
				
				if (!Map.ManageClick.bClickBtn) {


					Map.ManageClick.delegate();

					bindHammer();

					// compass();

					// Map.ManageClick.bluetoothBtn(); //自动定位
					locationGPS(true);

					

					//客户端检测
					(function(){
						var ua = navigator.userAgent;

						if(ua.match(/iPhone|iPod/i) != null){
							OSType = 'iPhone';
						} else if (ua.match(/Android/i) != null){
							OSType = 'Android';
						}
					})();

					
					// getInfo();
					
				} 
				Map.ManageClick.bClickBtn = false;    //还原点击按钮 

				
			} else {
				var err = data.msg;
				$("#svgBox").html(err);
				$("#svgFrame").css('display', 'block');
				$("#svgBox").css("visibility", "visible");
			}
		} else {
			alert("获取数据错误。");
		}
	});
}

function loadFloor(){
	//获取所有展商信息
	(function(){

		function getQueryString(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return null;
		}

		regionId = getQueryString('regionId');
		floorId = getQueryString('floorId');


	    var url = 'http://wx.indoorun.com/wx/getRegionInfo';
	    Map.MapTools.ajax2(url, {
	      data: {'regionId': regionId},
	      fnSucc: function(str) {
	        str = str.replace(/\n/g, '');
	        var data = eval('(' + str + ')');
	        if (data != null) {
	          if (data.code == "success") {
	            initAngle = data.data.northDeflectionAngle;
	            makeFloor(data.data.floorList);
	            compass();
	          }
	        }
	      },
	      fnFaild: function(str) {
	          alert('楼层信息获取失败!'+str);
	      },
	    });
	})();
};


/**
 * 定位功能(通用)
 * @method locationGPS(true/false);    true表示加载页面时用的
 * @explain 增加了3个全局变量
            用法上还需要在每秒调一次的方法上加上
            bOpenBlueTooth = true;
            iBlueCount = 0; //置0 
            其余的逻辑根据bOpenBlueTooth这个变量写
 */
var locationGPS = function(bLoadingGPS) {

	if (bLoadingGPS) {    //true 为加载页面后自动判断蓝牙有没有开启 (也就第一次加载时使用一次)

		window.bOpenBlueTooth = false;    //全局 蓝牙默认未开启
		window.bOne = true;    //第一次蓝牙没开但是开了，所以手动改回去
		window.iBlueCount = 0;    //当这个变量等于5时，说明不在蓝牙区域或者关闭蓝牙了
		window.bPointShow = false;    //动态点是否显示

		getInfo();    //进行判断蓝牙是否开启

		//开启一个定时器，用来判断是否有蓝牙信号或者关闭了蓝牙    记得把iBlueCount置0
		(function(){
			setInterval(function(){
				iBlueCount ++;
				// debug.log('iBlueCount:' +iBlueCount);
				if (iBlueCount > 5) {
					bOpenBlueTooth = false;
					bPointShow = false;
					bOne = true;
					iBlueCount = 0;

					(function(){    //其他业务逻辑
						// debug.log('蓝牙已关闭或已远离蓝牙覆盖区! bOpenBlueTooth:'+bOpenBlueTooth);
						document.querySelector('#pointImg').style.display = 'none';
						Map.StaticGPS.bIsClickStart = false;
						Map.StaticGPS.bIsBluetooth = false;
						
					})();
				}
			}, 1000);
		})();


		window.startSearch = function() {
			wx.startSearchBeacons({
				ticket: "",
				complete: function(argv) {
					// debug.log('aaa:'+ JSON.stringify(argv));
					if (argv) {
						// debug.log(argv.errMsg);
						if(argv.errMsg == 'startSearchBeacons:ok'){
							bOpenBlueTooth = true;    //全局 蓝牙开启了

							if (bOne) {    //把假设开启的，再手动调回去
								bOpenBlueTooth = false;
								bOne = false;
							}
							// debug.log('蓝牙开启了');

							(function(){    //其他业务逻辑
								if (bOpenBlueTooth) {
									// debug.log('让你左边不能点击');
									Map.StaticGPS.bIsClickStart = true;
									Map.StaticGPS.bIsBluetooth = true;
									
								}
							})();
							
						} else {
							// debug.log('蓝牙未开启');
							var oUpperTip = document.querySelector('#upperTip');
							if (oUpperTip.name != 'tip') {
								oUpperTip.style.display = 'block';
								oUpperTip.name = 'tip';
							}

							if (!bOpenBlueTooth) {
								//提示没找的
								// debug.log('点击后的提示:'+'没找到蓝牙');
								var oUpperTip = document.querySelector('#upperTip');
								oUpperTip.style.display = 'block';
								oUpperTip.name = 'tip';
								
							};
						};

						
					}
				}
			});
		};

	} else {    //以下就是点击定位按钮处理逻辑了
		
		if (bOpenBlueTooth && bPointShow) {
			dingwei();
			// debug.log('定位');
		} else {
			// debug.log('开启蓝牙');
			wx.stopSearchBeacons({
				complete: function(res) {
					startSearch();
				}
			});

			// debug.log(bOpenBlueTooth +','+ bPointShow);

			if (bOpenBlueTooth == false || bPointShow == false) {    //远离蓝牙信号区提示
				//提示没找的
				// debug.log('点击后的提示:'+'没找到蓝牙');
				var oUpperTip = document.querySelector('#upperTip');
				oUpperTip.style.display = 'block';
				oUpperTip.name = 'tip';
				
			};
		};

		

		
	};

	//其他业务逻辑
	(function(){
		if (bOpenBlueTooth) {
			Map.ManageClick.cancleGps();
			// bIsGPS = true;
			Map.StaticGPS.bIsClickStart = true;
			Map.StaticGPS.bIsBluetooth = true;
		}
	})();

};




function load() {
	loadRegion();
	loadFloor();
	//startBeaconSearch();
};

function calcLevel() {
	var svg = $("#svgBox svg")[0];
	var viewBox = svg.getAttribute("viewBox");
	// var viewBox = getStyle(svg, 'viewBox');

	box_w = $(window).width();
	box_h = $(window).height();
	console.log('('+window.screen.height + ';'+ window.screen.width + ')');
	console.log('('+box_h + ';'+ box_w + ')');
	var view = viewBox.split(" ");

	svg.removeAttribute("viewBox");
	svg.setAttribute("width", "100%");
	svg.setAttribute("height", "100%");

	x = parseFloat(view[0]); //svg原始 左上角x坐标，一般为0
	y = parseFloat(view[1]); //svg原始 左上角y坐标，一般为0
	width = vb_w = parseFloat(view[2]) - x; //svg原始 宽度
	height = vb_h = parseFloat(view[3]) - y; //svg原始 高度
	widthLevel = box_w / width;
	heightLevel = box_h / height;
	scale = ratio = Math.min(widthLevel, heightLevel);

	//修改初始放大倍数，屏幕宽度对应400个svg像素
	//scale = ratio = box_w / 400;
	
	//修改初始放大倍数，放大svg图片到屏幕的2倍
	// scale = ratio = ratio*2;

	//var cx = vb_w/2 - x;	//svg原始 中心点x坐标
	//var cy = vb_h/2 - y;	//svg原始 中心点y坐标

	//处理中默认为viewBox中的x、y都为0，元素的坐标值即为以左上角为0点的距离。

	var px = box_w / 2 - vb_w / 2 * scale; //需要偏移的量， 屏幕坐标系即svg缩放后的，屏幕中心点坐标 - svg中心点变换后的坐标
	var py = box_h / 2 - vb_h / 2 * scale;

	lastPX = px;
	lastPY = py;
	map_show(scale, px, py);
};

function bindHammer() {
	var hammertime = Hammer($('#svgFrame')[0], {
		domEvents: true,
		transform_always_block: true,
		transform_min_scale: 1,
		drag_block_horizontal: true,
		drag_block_vertical: true,
		drag_min_distance: 0,
	});

	hammertime.get('rotate').set({
		enable: true
	});
	hammertime.get('pan').set({
		direction: Hammer.DIRECTION_ALL
	});

	hammertime.on('panstart pan panend pinchstart pinch pinchend rotatestart rotate rotateend', function(ev) {
		ev.preventDefault(); //取消事件的默认动作（重要）
		manageMultitouch(ev, hammertime);
		// return false;
	});
};

var props = "";

function displayAllProp(obj) {
	for (var name in obj) {
		props += name + ": " + obj[name] + ", ";
		if (name == "pointers") {
			var pointers = obj[name];
			for (var pointer in pointers) {
				displayAllProp(pointer);
			}
		}
		if (name == "changedPointers") {
			var pointers = obj[name];
			for (var pointer in pointers) {
				displayAllProp(pointer);
			}
		}
		if (name == "center") {
			var center = obj[name];
			displayAllProp(center);
		}
	}
};
var count = 0;
var evTypes = [];

//记录事件，定时发送至后台
var eventString = "";
function addEventStr(str){
	return;
	eventString += str + ";";
}
function sendEventStr(){
	var str = eventString;
	eventString = "";
	if(str != ""){
		$.post('/wx/sendEventStr.html',{'events':str},function(data){
			
		});
	}
}
//window.setInterval("sendEventStr()",30000);

//记录当前时间类型及平均一次事件变化的量，当某次变化的量远大于平均值时，不予处理，并结束当前事件进程。
//并且当某事件开始时间与上次事件结束时相差太近，也不予处理。相差 500ms
var MinEventStartPeriod = 500;
var curEventType = ""; //当前事件过程中的事件类型
var lastEventType = "";//上次的事件类型
var lastEventTimet = 0;

var lastPanTimet = 0;
var avgPanDis = 0;
var panCount = 0;
var lastPanDeltaX = 0;
var lastPanDeltaY = 0;

var lastPinchTimet = 0;
var avgPinchScale = 0;
var pinchCount = 0;
var lastPinchScale = 1;

var lastRotateTimet = 0;
var avgRotateAngle = 0;
var avgRotateScale = 0;	//指两次事件之间的变化值的平均
var rotateScaleCount = 0;
var rotateAngleCount = 0;
var lastRotateAngle = 0;
var lastRotateScale = 1;

function ifEnableEvent(ev){
	var time = new Date();
	var timet = time.getTime();
	
	if(ev.type == "panstart" || ev.type == "pinchstart" || ev.type == "rotatestart"){
		if(ev.type == "panstart"){
			if((lastEventType == "pinch" || lastEventType == "rotate")
					&& time.getTime() - lastEventTimet < MinEventStartPeriod){
				addEventStr(ev.type + "," + JSON.stringify(time) + ", 事件太快，取消事件");
				return false;
			}
			curEventType = "pan";
			lastPanTimet = timet;
			avgPanDis = 0;
			panCount = 0;
			lastPanDeltaX = ev.deltaX;
			lastPanDeltaY = ev.deltaY;
		}else if(ev.type == "pinchstart"){
			curEventType = "pinch";
			lastPinchTimet = timet;
			avgPinchScale = 0;
			pinchCount = 0;
			lastPinchScale = ev.scale;
		}else if(ev.type == "rotatestart"){
			curEventType = "rotate";
			lastRotateTimet = timet;
			avgRotateAngle = 0;
			avgRotateScale = 0;
			rotateScaleCount = 0;
			rotateAngleCount = 0;
			lastRotateAngle = ev.rotation;
			lastRotateScale = ev.scale;
		}
		lastEventTimet = timet;
	}else if(ev.type == "pan"){
		if(curEventType != "pan"){
			return false;
		}
		var dx = ev.deltaX - lastPanDeltaX;
		var dy = ev.deltaY - lastPanDeltaY;
		var dis = Math.sqrt(dx*dx + dy*dy);
		/* if(avgPanDis > 0 && panCount > 10){
			if(dis > avgPanDis*10){
				addEventStr("pan," + JSON.stringify(time) + "," + ev.deltaX + "," + ev.deltaY + ", 突变，取消事件");
				curEventType = "";
				lastEventTimet = timet;
				lastPanTimet = 0;
				avgPanDis = 0;
				panCount = 0;
				lastPanDeltaX = 0;
				lastPanDeltaY = 0;
				panend();
				lastEventType = "pan";
				return false;
			}
		} */
		avgPanDis = calcAvg(avgPanDis, panCount, dis);	// (avgPanDis*panCount + dis)/(panCount+1);
		if(panCount < 10){
			panCount ++;
		}
		lastPanDeltaX = ev.deltaX;
		lastPanDeltaY = ev.deltaY;
		lastEventTimet = timet;
		lastPanTimet = timet;
	}else if(ev.type == "pinch"){
		if(curEventType != "pinch"){
			return false;
		}
		var dscale = Math.abs(ev.scale - lastPinchScale);
		addEventStr(dscale);
		if(avgPinchScale > 0 && pinchCount > 5){
			if(dscale > avgPinchScale*10){
				addEventStr("pinch," + JSON.stringify(time) + "," + ev.scale + ", 突变，取消事件");
				curEventType = "";
				lastEventTimet = timet;
				lastPinchTimet = 0;
				avgPinchScale = 0;
				pinchCount = 0;
				lastPinchScale = 0;
				pinchend();
				lastEventType = "pinch";
				return false;
			}
		}
		avgPinchScale = (avgPinchScale*pinchCount + dscale)/(pinchCount+1);
		pinchCount ++;
		lastPinchScale = ev.scale;
		lastEventTimet = timet;
		lastPinchTimet = timet;
	}else if(ev.type == "rotate"){
		if(curEventType != "rotate"){
			return false;
		}
		var dscale = Math.abs(ev.scale - lastRotateScale);
		var dangle = Math.abs(calcRotationChange(lastRotateAngle, ev.rotation));
		addEventStr("rotateScaleDelta:" + dscale);
		addEventStr("avgRotateScale:" + avgRotateScale);
		addEventStr("dangle:" + dangle);
		addEventStr("avgRotateAngle:" + avgRotateAngle);
		if(dscale > 0 && dscale > avgRotateScale*10 && ev.scale == 1 
				|| dangle > 30 && dangle > avgRotateAngle*10 && ev.rotation == 0
				|| dangle > 90 && dangle > avgRotateAngle*10){
			addEventStr("rotate," + JSON.stringify(time) + "," + ev.scale + ", 突变，取消事件");
			curEventType = "";
			lastEventTimet = timet;
			lastRotateTimet = 0;
			avgRotateScale = 0;
			avgRotateAngle = 0;
			rotateScaleCount = 0;
			rotateAngleCount = 0;
			lastRotateScale = 0;
			lastRotateAngle
			rotateend();
			lastEventType = "rotate";
			return false;
		}
		
		if(dscale > 0){
			avgRotateScale = calcAvg(avgRotateScale, rotateScaleCount, dscale);
			if(rotateScaleCount < 10){
				rotateScaleCount ++;
			}
		}
		if(dangle > 0){
			avgRotateAngle = calcAvg(avgRotateAngle, rotateAngleCount, dangle);
			if(rotateAngleCount < 10){
				rotateAngleCount ++;
			}
		}
		lastRotateScale = ev.scale;
		lastRotateAngle = ev.rotation;
		lastEventTimet = timet;
		lastRotateTimet = timet;
	}else if(ev.type == "panend"){
		curEventType = "";
		lastEventTimet = timet;
		lastPanTimet = 0;
		avgPanDis = 0;
		panCount = 0;
		lastPanDeltaX = 0;
		lastPanDeltaY = 0;
		lastEventType = "pan";
	}else if(ev.type == "pinchend"){
		curEventType = "";
		lastEventTimet = timet;
		lastPinchTimet = 0;
		avgPinchScale = 0;
		pinchCount = 0;
		lastPinchScale = 1;
		lastEventType = "pinch";
	}else if(ev.type == "rotateend"){
		curEventType = "";
		lastEventTimet = timet;
		lastRotateTimet = 0
		avgRotateScale = 0;
		avgRotateAngle = 0;
		rotateScaleCount = 0;
		rotateAngleCount = 0;
		lastRotateScale = 1;
		lastRotateAngle = 0;
		lastEventType = "rotate";
	}
	
	return true;
}

function recordEvent(ev){
	var timestr = JSON.stringify(new Date());
	if(ev.type == "panstart" || ev.type == "pan" || ev.type == "panend"){
		eventString += ev.type + "," + timestr + "," + ev.deltaX + "," + ev.deltaY;
	}else if(ev.type == "pinchstart" || ev.type == "pinch" || ev.type == "pinchend"){
		eventString += ev.type + "," + timestr + "," + ev.scale;
	}else if(ev.type == "rotatestart" || ev.type == "rotate" ||ev.type == "rotateend"){
		eventString += ev.type + "," + timestr + "," + ev.scale + ";";
		eventString += ev.type + "," + timestr + "," + ev.rotation;
	}
	eventString += ";";
}

function calcAvg(lastAvg, count, delta) {
	if (count == 0) {
		return delta;
	} else {
		return lastAvg * count / (count + 1) * 0.8 + delta / (count + 1) * 1.2;
	}
}

function manageMultitouch(ev, hammertime) {
	var hammertime = hammertime || null;
	var px, py;
	var oPointImg = document.querySelector('#pointImg');
	recordEvent(ev);
	if (!ifEnableEvent(ev)) {
		return;
	}
	switch (ev.type) {
		case 'panstart':
			dragStartPX = lastPX;
			dragStartPY = lastPY;
			Map.TxtName.clearTxt(); //清除文本内容的数据
			Map.StaticGPS.hideTrajectory();  //把起终和划线影藏
			bStopBackstage = false;
			break;
		case 'pan':
			px = lastPX = ev.deltaX + dragStartPX;
			py = lastPY = ev.deltaY + dragStartPY;
			map_show(scale, px, py);

			Map.StaticGPS.changePosPoint(oPointImg, [iPointSvgPosX, iPointSvgPosY]);  //固定动态点
			// Map.StaticGPS.askPos(iPointClientPosX, iPointClientPosY, Map.StaticGPS.iEndSvgPosX, Map.StaticGPS.iEndSvgPosY);

			compass();
			break;
		case 'panend':
			panend();
			Map.StaticGPS.showTrajectory();// 重新绘图
			bStopBackstage = true;
			break;
		/*case 'pinchstart':
			// break;
			transformStartScale = scale; //开始缩放时的缩放比例
			transformStartPX = lastPX; //开始缩放时的偏移量，屏幕坐标系及svg变换后的坐标
			transformStartPY = lastPY;
			transformStartCentX = (box_w / 2 - transformStartPX) / transformStartScale; //开始缩放时 对准屏幕中心的svg图上的点的原始坐标
			transformStartCentY = (box_h / 2 - transformStartPY) / transformStartScale;
			Map.TxtName.clearTxt(); //清除文本内容的数据
			Map.StaticGPS.hideTrajectory();  //把起终和划线影藏
			break;
		case 'pinch':
			// break;
			scale = transformStartScale * ev.scale;
			var ax = transformStartCentX * (scale - transformStartScale);
			var ay = transformStartCentY * (scale - transformStartScale);
			var px = transformStartPX - ax;
			var py = transformStartPY - ay;
			map_show(scale, px, py);
			break;
		case 'pinchend':
			// pinchend();
			Map.TxtName.textTransformation();
			Map.StaticGPS.showTrajectory();// 重新绘图
			break;*/
		case 'rotatestart':
			//break;
			rotateStartSvgAngle = lastSvgAngle;
			rotateStartRotation = ev.rotation;

			rotateStartSvgScale = scale; //开始旋转时的缩放比例
			rotateStartPX = lastPX; //开始旋转时的偏移量，屏幕坐标系及svg变换后的坐标
			rotateStartPY = lastPY;
			rotateStartCenterX = ev.center.x;
			rotateStartCenterY = ev.center.y;

			//开始时手指连线中点对应的svg图点坐标
			rotateStartCenterSvgX = (Math.cos(-rotateStartSvgAngle * Math.PI / 180) * (rotateStartCenterX - rotateStartPX) - Math.sin(-rotateStartSvgAngle * Math.PI / 180) * (rotateStartCenterY - rotateStartPY)) / rotateStartSvgScale;
			rotateStartCenterSvgY = (Math.cos(-rotateStartSvgAngle * Math.PI / 180) * (rotateStartCenterY - rotateStartPY) + Math.sin(-rotateStartSvgAngle * Math.PI / 180) * (rotateStartCenterX - rotateStartPX)) / rotateStartSvgScale;

			Map.TxtName.clearTxt(); //清除文本内容的数据
			Map.StaticGPS.hideTrajectory();  //把起终和划线影藏
			bStopBackstage = false;
			break;
		case 'rotate':
			//break;
			var angle = calcRotationChange(ev.rotation, rotateStartRotation);
			lastSvgAngle = rotateStartSvgAngle - angle;

			scale = rotateStartSvgScale * ev.scale;

			lastPX = px = ev.center.x - (Math.cos(lastSvgAngle * Math.PI / 180) * rotateStartCenterSvgX - Math.sin(lastSvgAngle * Math.PI / 180) * rotateStartCenterSvgY) * scale;
			lastPY = py = ev.center.y - (Math.cos(lastSvgAngle * Math.PI / 180) * rotateStartCenterSvgY + Math.sin(lastSvgAngle * Math.PI / 180) * rotateStartCenterSvgX) * scale;

			map_show(scale, px, py);
			
			// var oPointImg = document.querySelector('#pointImg');
			Map.StaticGPS.changePosPoint(oPointImg, [iPointSvgPosX, iPointSvgPosY]);  //固定动态点

			compass();
			break;
		case 'rotateend':
			Map.TxtName.textTransformation();
			Map.StaticGPS.showTrajectory();// 重新绘图
			bStopBackstage = true;
			break;
			
	}
}

function panend() {
	Map.TxtName.textTransformation();
	Map.StaticGPS.showTrajectory();// 重新绘图

	var oPointImg = document.querySelector('#pointImg');
	Map.StaticGPS.changePosPoint(oPointImg, [iPointSvgPosX, iPointSvgPosY]);  //固定动态点

	compass();
	bStopBackstage = true;
}

function pinchend() {
	Map.TxtName.textTransformation();
	Map.StaticGPS.showTrajectory();// 重新绘图

	var oPointImg = document.querySelector('#pointImg');
	Map.StaticGPS.changePosPoint(oPointImg, [iPointSvgPosX, iPointSvgPosY]);  //固定动态点

	compass();
	bStopBackstage = true;
}

function rotateend() {
	Map.TxtName.textTransformation();
	Map.StaticGPS.showTrajectory();// 重新绘图

	var oPointImg = document.querySelector('#pointImg');
	Map.StaticGPS.changePosPoint(oPointImg, [iPointSvgPosX, iPointSvgPosY]);  //固定动态点

	compass();
	bStopBackstage = true;
}

function calcRotationChange(rotation1, rotation2) {
	var angle = rotation2 - rotation1;
	if (angle > 180) {
		angle = angle - 360;
	} else if (angle < -180) {
		angle = angle + 360;
	}
	return angle;
}

function map_show(scale, px, py) {
	lastPX = px;
	lastPY = py;
	//转换根据:
	//x1 = ax + cy + e;
	//y1 = bx + dy + f;
	var a = Math.cos(lastSvgAngle * Math.PI / 180) * scale;
	var b = Math.sin(lastSvgAngle * Math.PI / 180) * scale;
	var c = -b;
	var d = a;
	var e = lastPX;
	var f = lastPY; //

	//var transform = 'matrix(' + scale + ',0,0,' + scale + ',' + px + ',' + py + ')';
	//var transform = 'translate(' + px + ',' + py + ') rotate(' + lastSvgAngle + ') scale(' + scale + ',' + scale + ')';
	var transform = 'matrix(' + a + ',' + b + ',' + c + ',' + d + ',' + e + ',' + f + ')';
	var viewport = $("#viewport")[0];
	viewport.setAttribute("transform", transform);
}

//window.setTimeout("showCheckBlueInfo()", 5000);
function showCheckBlueInfo() {
	document.getElementById("idCheckBlue").style.display = "block";
	document.getElementById("bg").style.display = "block";
	window.setTimeout("hideCheckBlueInfo()", 3000);
}

function hideCheckBlueInfo() {
	document.getElementById("idCheckBlue").style.display = "none";
	document.getElementById("bg").style.display = "none";
}

 