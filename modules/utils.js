/**
 *   utils.js  实用工具
 *   js一些常用的函数方法
 *   author: Sorrow.X 
 */


define(function(require, exports, module) {
	function Utils() {};

	module.exports = Utils;

	Utils.prototype = {
		constructor: Utils,

		//操作节点元素对象
		HandleNode: {

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
		      *    给节点元素添加样式
		      *    use: setStyle([oDiv,oDiv2], {width: '100px', height: '100px', background: '#ccc', opacity: 30});
		      *    use: setStyle(oDiv, {width: 100, height: 100, background: '#ccc', opacity: 30});
		  	 */
		  	setStyle: function(obj, json) {
		    		if (obj.length) {    //对象数组

		    			for (var i = 0; i < obj.length; i++) arguments.callee(obj[i], json);

		    		} else {
		    			if (arguments.length == 2){

		    				for (var attr in json) arguments.callee(obj, attr, json[attr]);

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

		  	//移除某元素节点的class
		  	removeClass: function(obj, sClass){
		    		var re = new RegExp('\\b' + sClass + '\\b', 'g');

		    		obj.className = obj.className.replace(re, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
		  	},

		  	//给元素节点添加class
		  	addClass: function(obj, sClass) {
		    		var re = new RegExp('\\b' + sClass + '\\b');

		    		if (re.test(obj.className)) return;
		    		obj.className = (obj.className + ' ' + sClass).match(/\S+/g).join(' ');
		  	},

		  	//给元素节点设置Css3样式
		  	setStyle3: function(obj, name, value) {
			  		if (!obj) return;
		    		obj.style['Webkit' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
		    		obj.style['Moz' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
		    		obj.style['ms' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
		    		obj.style['O' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
		    		obj.style[name] = value;
		  	}
		},

		//事件处理（跨浏览器）
		EventUtil: {

		  	//事件绑定  EventUtil.addHandler()
		  	addHandler: function(element, type, handler) { //要绑定的元素, 事件类型, 发生事件的函数
			  		if (!element) return;
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
		    		var oEvent = this.getEvent(event);
		    		return oEvent.target || oEvent.srcElement; //标准或ie下
		  	},

		  	//取消默认事件 
		  	preventDefault: function(event) {
		    		var oEvent = this.getEvent(event);
		    		oEvent.preventDefault ? oEvent.preventDefault() : oEvent.returnValue = false;
		  	},

		  	//阻止事件冒泡和事件捕获 
		  	stopPropagation: function(event) {
		    		var oEvent = this.getEvent(event);
		    		oEvent.stopPropagation ? oEvent.stopPropagation() : oEvent.cancelBubble = true;
		  	}
		},

		//图片处理
		ImageUtil: {

		  	//预加载图片
		  	preloadImgs: function(arr, fnSucc, fnFaild, fnProgress) {
		    		var loaded = 0;
		    		for (var i = 0; i < arr.length; i++) {
		    			var oImg = new Image();

		    			oImg.onload = function() {
		    				loaded++;

		    				fnProgress && fnProgress(100 * loaded / arr.length);

		    				if (loaded == arr.length) fnSucc && fnSucc();

		    				this.onload = this.onerror = null;
		    				this.src = '';
		    			};

		    			oImg.onerror = function() {
		    				fnFaild && fnFaild(this.src);

		    				fnFaild = fnSucc = fnProgress = null;
		    			};

		    			oImg.src = arr[i];
		    		}
		  	},
		}, 

		//url参数处理
		UrlUtil: {
		    getQueryStringToObj: function() {

		        var str = location.search.length > 0 ? location.search.substring(1) : "";
		        var items = str.length ? str.split("&") : [];

		        var args = {},
		            item = null, 
		            name = null,
		            value = null;

		        for (var i = 0, len = items.length; i < len; i++) {
		            item = items[i].split("=");
		            name = decodeURIComponent(item[0]);
		            value = decodeURIComponent(item[1]);
		            if (name.length) {
		                args[name] = value;
		            }
		        };
		        
		        return args;
		    },

		    getQueryString: function(name) {
		        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		        var r = window.location.search.substr(1).match(reg);
		        if (r != null) return unescape(r[2]);
		        return null;
		    }
		},

		//ajax 向后台请求数据
		RequestData: {

		  	//后缀数据
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

		  	isNullObj: function(obj){
		  	    for(var i in obj){
		  	        if(obj.hasOwnProperty(i)){
		  	            return false;
		  	        }
		  	    }
		  	    return true;
		  	},
			 //ajax (get, post 封装)
		  	ajax: function(url, opt) {
		  	  	opt = opt || {};
		  	  	opt.data = opt.data || {};
		  	  	// opt.data.t = opt.data.t || new Date().getTime();
		  	  	opt.method = opt.method || 'get';


		  	  	var oAjax = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

		  	  	if (opt.method == 'post') {
		    	  		oAjax.open('POST', url, true);
		    	  		oAjax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		    	  		try {
		    	  			oAjax.send(opt.data ? this.json2url(opt.data) : null);
		    	  		} catch (e) {}
		  	  	} else {
			  	  		if (!this.isNullObj(opt.data)) {
			    	  		url += '?' + this.json2url(opt.data);
							// alert('url : ' + url);
			  	  		} 
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
		  	}
		},

		//节点元素运动
		Move: {

		    getStyle: function(obj, attr) {
		        if (obj.currentStyle) {
		            return obj.currentStyle[attr];
		        } else {
		            return getComputedStyle(obj, false)[attr];
		        }
		    },
		  //运动
		  startMove: function(obj, json, fn) {
		      clearInterval(obj.timer);
		      obj.timer = setInterval(function() {
		        var attr = '';
		        var iStop = true; //假设所有值都到达了，定时器里一轮的运动结束了
		          for (attr in json) {
		            //1.计算当前值
		              var iCurr = 0;
		              if (attr == 'opacity') {
		                  iCurr = parseInt(parseFloat(Utils.prototype.Move.getStyle(obj, attr)) * 100);
		              } else {
		                  iCurr = parseInt(Utils.prototype.Move.getStyle(obj, attr));
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
		}
	}
});