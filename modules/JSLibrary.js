/**
 *  dom选取, 和操作dom元素的一些方法
 *  包括移动端的事件
 *  ajax, url处理, 跨浏览器事件的封装
 *  和其他一些常用的方法
 *  author: Sorrow.X
 *  state: 持续跟新中
 */


(function(win, doc) {

 	function JSLibrary(arg) {

 		//用来保存选中的元素, elements是一个真正的数组, 不是HTMLCollection对象
 		this.elements = [];

 		switch (typeof arg) {
 			case 'function':
 				_methodSets.ready(arg);
 				break;
 			case 'string':
 				switch (arg.charAt(0)) {
 					case '#': //ID
 						var obj = doc.querySelector(arg);
 						this.elements.push(obj);
 						break;
 					case '.': //class
 						this.elements = _methodSets.getByClass(doc, arg.substring(1));
 						break;
 					default: //tagName
 						this.elements = _methodSets.convertToArray(doc.getElementsByTagName(arg));
 				}
 				break;
 			case 'object':
 				this.elements.push(arg);
 		}
 	};

	// 用来存放内部调用的方法
 	JSLibrary.methodSets = {

        //文档加载完毕执行js脚本
 		ready: (function() {
		    var funcs = []; //当获得事件时,要运行的函数
		    var bReady = false; //当触发事件处理程序时,切换到true

		    //当文档准备就绪时,调用事件处理程序
		    function handler(e) {
		        //如果已经运行过一次, 只需要返回
		        if (bReady) return;

		        //如果发生readystatechange事件,但是其状态不是'complete'的话, 那么文档尚未准备好
		        if (e.type === 'readystatechange' && doc.readyState !== 'complete') return;

		        //运行所有注册函数, 注意每次都要计算funcs.length, 以防止这些函数的调用可能会导致注册更多的函数
		        for (var i = 0; i < funcs.length; i++) {
		            funcs[i].call(doc);
		        }

		        //现在设置ready标识为true, 并移除所有函数
		        bReady = true;
		        funcs = null;
		    }

		    //为接收到任何事件注册处理程序
		    if (doc.addEventListener) {
		        doc.addEventListener('DomContentLoaded', handler, false);
		        doc.addEventListener('readystatechange', handler, false);
		        win.addEventListener('load', handler, false);

		    } else if (doc.attachEvent) {
		        doc.attachEvent('onreadystatechange', handler);
		        win.attachEvent('onload', handler);
		    }

		    //返回whenReady()函数
		    return function whenReady(f) {
		        if (bReady) f.call(doc); //若准备完毕, 只需要运行它
		        else funcs.push(f); //否则, 加入列队等候
		    }
		})(),

		//把NodeList数组对象转换成数组
		convertToArray: function(nodes) { 
		    var arrayOfNodes = null;

		    try {
		        arrayOfNodes = Array.prototype.slice.call(nodes, 0);
		    } catch (ex) { //兼容ie8及以前的版本
		        arrayOfNodes = new Array();
		        for (var i = 0; i < nodes.length; i++) {
		            arrayOfNodes.push(nodes[i]);
		        }

		    };

		    return arrayOfNodes;
		},

 		myAddEvent: function(obj, sEv, fn) {
 			if (obj.attachEvent) {
 				obj.attachEvent('on' + sEv, function() {
 					if (false == fn.call(obj)) {
 						event.cancelBubble = true;
 						return false;
 					}
 				});
 			} else {
 				obj.addEventListener(sEv, function(ev) {
 					if (false == fn.call(obj)) {
 						ev.cancelBubble = true;
 						ev.preventDefault();
 					}
 				}, false);
 			}
 		},

 		getByClass: function(oParent, sClass) {
 			var aEle = oParent.getElementsByTagName('*');
 			var aResult = [];
 			var i = 0;

 			for (i = 0; i < aEle.length; i++) {
 				if (aEle[i].className == sClass) {
 					aResult.push(aEle[i]);
 				}
 			}

 			return aResult;
 		},

 		getStyle: function(obj, attr) {
 			if (obj.currentStyle) {
 				return obj.currentStyle[attr];
 			} else {
 				return getComputedStyle(obj, false)[attr];
 			}
 		}
 	};

 	var _methodSets = JSLibrary.methodSets;


 	/********************* 以下JSLibrary 原型方法   开始 ************************/
 	JSLibrary.prototype = {
 		constructor: JSLibrary,

        /**
         *  这个点击事件是针对传统pc的
         *  手机端使用tap事件
         */
 		click: function(callback) {

 			this.elements.forEach(function(item) {
 				_methodSets.myAddEvent(item, 'click', callback);
 			});

 			return this;
 		},

        /**
         *  这个tap点击事件是针对移动端的,主要解决移动ios的200-300ms延迟
         *  pc端使用click事件
         *  @use
         *  jsLib('#id').tap(function(ev) {
	     *      console.log(ev);
         *  });
         */
		tap: function(callback) {

			this.elements.forEach(function(item) {
				item.addEventListener('tap', function(ev) {
					ev.preventDefault();    //阻止默认事件
					callback.call(this, ev);
				}, false);
			}, event);

			return this;
		},

		tap2: function(callback) {

			for (var i = 0, length = this.elements.length; i < length; i += 1) {
                this.elements[i].addEventListener('tap', callback);
			};

			return this;
		},

		removeTap2: function(callback) {

			for (var i = 0, length = this.elements.length; i < length; i += 1) {
                this.elements[i].removeEventListener('tap', callback);
			};

			return this;
		},

        /**
         *  dbltap双击事件是针对移动端的
         *  @use
         *  jsLib('#id').dbltap(function(ev) {
	     *      console.log(ev);
         *  });
         */
		dbltap: function(callback) {

			this.elements.forEach(function(item) {
				item.addEventListener('dbltap', function(ev) {
					ev.preventDefault();    //阻止默认事件
					callback.call(this, ev);
				}, false);
			}, event);

			return this;
		},

        /**
         *  longtap长按事件是针对移动端的
         *  @use
         *  jsLib('#id').longtap(function(ev) {
	     *      console.log(ev);
         *  });
         */
		longtap: function(callback) {

			this.elements.forEach(function(item) {
				item.addEventListener('longtap', function(ev) {
					ev.preventDefault();    //阻止默认事件
					callback.call(this, ev);
				}, false);
			}, event);

			return this;
		},

        transform: function() {

            for (var i = 0, len = this.elements.length; i < len; i += 1) {
                jsLib.Transform(this.elements[i]);
            };

            return this.toDom();
        },

        /*
         * 据父节点查找其子孩子
         * @param { String } 可以是标签名或.calss名
         */
 		find: function(str) {
 			var i = 0;
 			var aResult = [];

 			for (i = 0; i < this.elements.length; i++) {
 				switch (str.charAt(0)) {
 					case '.': //class
 						var aEle = _methodSets.getByClass(this.elements[i], str.substring(1));

 						aResult = aResult.concat(aEle);
 						break;
 					default: //标签
 						var aEle = this.elements[i].getElementsByTagName(str);

 						aResult = _methodSets.convertToArray(aEle);
 				}
 			}

 			var newJSLib = jsLib();

 			newJSLib.elements = aResult;

 			return newJSLib;
 		},

 		/*
 		 * 获取点击时它在其兄弟节点的索引位置
 		 */
 		index: function() {
 			var _this = this;
 			return (function(_this) {
 				var obj = _this.elements[0];
 				var aBrother = obj.parentNode.children;
 				var i = 0;

 				for (i = 0; i < aBrother.length; i++) {
 					if (aBrother[i] == obj) {
 						return i;
 					}
 				}
 			}(_this));
 		},

 		/*
 		 * 获取第几个dom对象(含原型方法)
 		 * @param { Number } 从0开始
 		 */
 		eq: function(n) {
 			return jsLib(this.elements[n]);
 		},

 		/*
 		 * 返回元素的length长度
 		 */
 		length: function() {
 			return this.elements.length;
 		},

 		/*
 		 * 单纯地获取dom对象(不含原型方法)
 		 * @param { Number } 从0开始
 		 */
 		toDom: function() {
 			if (this.elements.length === 1) {
 				return this.elements[0];
 			} else {
 				return this.elements;
 			}
 		},

 		show: function() {
 			this.elements.forEach(function(item) {
 				item.style.display = 'block';
 			});
 		},

 		hide: function() {
 			this.elements.forEach(function(item) {
 				item.style.display = 'none';
 			});
 		},

 		/*
 		 * 给节点元素添加样式(多个或者单个)
 		 * @param { Object } {width: '100px', height: '100px', background: '#ccc', opacity: 30}
 		 * @use: setStyle([oDiv,oDiv2], {width: '100px', height: '100px', background: '#ccc', opacity: 30});
 		 * @use: setStyle(oDiv, {width: 100, height: 100, background: '#ccc', opacity: 30});
 		 */
 		setStyle: function(json) {
 			(function (obj, json) {
 			    if (obj.length) { //对象数组

 			        for (var i = 0; i < obj.length; i++) arguments.callee(obj[i], json);

 			    } else {
 			        if (arguments.length == 2) {

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
 			})(this.elements, json);
 		},

        /*
         * 获取/设置dom样式
         * @param { String } 样式名
         * @param { String } 样式值
         */
 		css: function(attr, value) {
			if (arguments.length == 2) {    //设置样式
				var i = 0;

				for (i = 0; i < this.elements.length; i++) {
					this.elements[i].style[attr] = value;
				}
			} else {    //获取样式
				if (typeof attr == 'string') {
					return _methodSets.getStyle(this.elements[0], attr);
				} else {
					for (i = 0; i < this.elements.length; i++) {
						var k = '';

						for (k in attr) {
							this.elements[i].style[k] = attr[k];
						}
					}
				}
			}

			return this;
 		},

 		/*
 		 * 获取/设置dom属性
 		 * @param { String } dom属性名
 		 * @param { String } dom属性值
 		 */
 		attr: function(attr, value) {
 			if (arguments.length == 2) {
 				var i = 0;

 				for (i = 0; i < this.elements.length; i++) {
 					this.elements[i][attr] = value;
 				}
 			} else {
 				return this.elements[0][attr];
 			}

 			return this;
 		},

 		removeAttr: function(name) {
 			this.elements.forEach(function(item) {
 				item.removeAttribute(name);
 			});

 			return this;
 		},

 		/*
 		 * 给元素节点设置Css3样式
 		 * @param { String } name 属性名
 		 * @param { String } value 属性值
 		 */
 		setStyle3: function(name, value) {
 		    this.elements.forEach(function(item) {
 		    	item.style['Webkit' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
 		    	item.style['Moz' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
 		    	item.style['ms' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
 		    	item.style['O' + name.charAt(0).toUpperCase() + name.substring(1)] = value;
 		    	item.style[name] = value;
 		    });
 		},

 		/*
 		 * 给元素节点添加class
 		 * @param { String } sClass class名
 		 */
 		addClass: function(sClass) {
 		    var re = new RegExp('\\b' + sClass + '\\b');
            
            this.elements.forEach(function(item) {
            	if (re.test(item.className)) return;
            	item.className = (item.className + ' ' + sClass).match(/\S+/g).join(' ');
            });

			return this;
 		},

 		/*
 		 * 移除某元素节点的class
 		 * @param { String } sClass class名
 		 */
 		removeClass: function(sClass) {
 		    var re = new RegExp('\\b' + sClass + '\\b', 'g');

 		    this.elements.forEach(function(item) {
	 		    item.className = item.className.replace(re, '').replace(/^\s+|\s+$/g, '').replace(/\s+/g, ' ');
 		    });

			return this;
 		},

 		/*
 		 * 设置dom文本
 		 */
 		html: function(str) {
			this.elements.forEach(function(item) {
				item.innerHTML = str;
			});
 		},

        /*
         * 扩张方法,把一些好的方法扩张到JSLibrary原型上
         * @param { String } 方法名
         * @param { Function } 函数
         */
 		extend: function(name, fn) {
 			JSLibrary.prototype[name] = fn;
 		},

		/**
		 * [功能: 返回元素e的第几层祖先元素, 如果不存在此类祖先或祖先不是Element,
		 *  则返回NUll]
		 * @param  {Object Dom} e 指定的元素
		 * @param  {Number} n 第n层祖先元素
		 * @return {Object Dom}   返回其祖父元素
		 */
		parent: function(n) {
			if (this.elements.length > 1) return;    //多个元素直接返回
			var e = this.elements[0];

	        if (n === undefined) n = 1;
	        while(n -- && e)
	        	e = e.parentNode;
	        if (!e || e.nodeType !== 1)
	        	return null;

	        // return e;
	        return jsLib(e);
		},

	    /**
	     * [功能: 返回元素e的第几个兄弟元素, n为正,返回后续的第n个兄弟元素,
	     *  n为负,返回前面的第n个兄弟元素, n为0, 返回e本身]
	     * @param  {Object Dom} e 指定的元素
	     * @param  {Number} n 第几个兄弟节点
	     * @return {Object Dom}   返回第几个兄弟节点
	     */
		sibling: function(n) {
			if (this.elements.length > 1) return;    //多个元素直接返回
			var e = this.elements[0];

	        while(e && n !== 0) {    //如果e未定义, 立即返回它

	            if (n > 0) {    //查找后续的兄弟元素
	                if (e.nextElementSibling) {
	                	e = e.nextElementSibling;
	                } else {
	                	for (e = e.nextSibling; e && e.nodeType !== 1; e = e.nextSibling)
	                		/* 空循环 */;
	                };
	                n --;
	            } else {    //查找前面的兄弟元素
	                if (e.previousElementSibing) {
	                	e = e.previousElementSibing;
	                } else {
	                	for (e = e.previousSibling; e && e.nodeType !== 1; e = e.previousSibling)
	                		/* 空循环 */;
	                };
	                n ++;
	            }
	        }

	        // return e;
	        return jsLib(e);
		},

		/**
		 * [功能: 返回元素e的第n代子元素,如果不存在则为NUll,
		 * 负值n代表从后往前计数. 0表示第一个子元素, -1代表最后一个, -2代表倒数第二个,以此类推.(和children功能一样, 从0开始)]
		 * @param  {Object Dom} e 指定的元素
		 * @param  {Number} n 第几个
		 * @return {Object Dom}   返回第n代子元素
		 */
		child: function(n) {
			if (this.elements.length > 1) return;    //多个元素直接返回
			var e = this.elements[0];
			if (!e) return;

	        if (e.children) {                   // 如果children数组存在
	        	if (n < 0)                      // 转换负的n为数组索引
	        		n += e.children.length;     
	        	if (n < 0)                      // 如果它仍然为负, 说明没有子元素
	        		return null;
	        	// return e.children[n];           //返回指定的子元素
	        	return jsLib(e.children[n]);           //返回指定的子元素
	        }

	        //如果e没有children数组, 找到第一个子元素并向前数, 或找到最后一个子元素并往回数
	        if (n >= 0) {
	        	//找到元素的第一个子元素
	        	if (e.firstElementChild) {
	        		e = e.firstElementChild;
	        	} else {
	        		for (e = e.firstChild; e && e.nodeType !== 1; e = e.nextSibling)
	        			/* 空循环 */;
	        	}
				// return this.sibling(e, n);    //返回第一个子元素的第n个兄弟元素
				return jsLib(this.sibling(e, n));    //返回第一个子元素的第n个兄弟元素
	        } else {    // n为负数
	            if (e.lastElementChild) {
	            	e.lastElementChild;
	            } else {
	            	for (e = e.lastChild; e && e.nodeType !== 1; e = e.previousSibling)
	            		/* 空循环 */;
	            }
	            // return this.sibling(e, n+1);
	            return jsLib(this.sibling(e, n+1));
	        }
		}
 	};

 	/********************* 以上JSLibrary 原型方法   结束 ************************/


 	/************** 以下是一些常用的方法挂在到jsLib(类方法)   开始 **************/


 	/**
 	 *  一些实用工具方法挂载到jsLib.utils
 	 */

 	jsLib.utils = {};
    
    /**
     *  检测一个值是否是NaN 
     */
    jsLib.utils.isReallyNaN = function(x) {
    	return x !== x;
    };

    /**
     *  检测一个对象是否为空
     */
    jsLib.utils.isEmptyObj = function(obj){
        for(var i in obj){
            if(obj.hasOwnProperty(i)){
                return false;
            }
        }
        return true;
    };

	/**
	 *  检测一个对象是否为数组
	 */
	jsLib.utils.isArray = function (arr) {
		if (Array.isArray) {
			return Array.isArray(arr);
		} else {
			return Object.prototype.toString.call(arg) === '[object Array]';
		}
	};

	/**
	 *
	 * @param parent    要拷贝的对象
	 * @param child    返回浅拷贝的对象
	 *
	 * 如果parent对象中属性也是对象或者数组，那么浅拷贝的对象是引用parent这个对象
	 */
    jsLib.utils.extend = function(parent, child) {
		var i;
		child = child || {};
		for (i in parent) {
			if (parent.hasOwnProperty(i)) {
				child[i] = parent[i];
			};
		};
		return child;
	};

	/**
	 *
	 * @param parent
	 * @param child
	 * 深拷贝以后，parent对象和child对象就不相等了,都是独立的了
	 */
	jsLib.utils.extendDeep = function(parent, child) {
		var i,
			toStr = Object.prototype.toString,
			astr = "[object Array]";

		child = child || {};

		for (i in parent) {
			if (parent.hasOwnProperty(i)) {
				if (typeof parent[i] === 'object') {
					child[i] = (toStr.call(parent[i]) === astr) ? [] : {};
					this.extendDeep(parent[i], child[i]);
				} else {
					child[i] = parent[i];
				};
			};
		};
		return child;
	};

	/**
	 *  从数组中随机取几个不重复的元素
	 */
	jsLib.utils.getArrayItems = function(arr, num) {
		var temp_array = new Array();
		for (var index in arr) {
			temp_array.push(arr[index]);
		}
		var return_array = new Array();
		for (var i = 0; i<num; i++) {
			if (temp_array.length>0) {
				var arrIndex = Math.floor(Math.random()*temp_array.length);
				return_array[i] = temp_array[arrIndex];
				temp_array.splice(arrIndex, 1);
			} else {
				break;
			};
		};
		return return_array;
	}

	/**
	 *  判断点在多边形内
	 *  eg:  var pointCenter = {x: gV.box_w/2, y: gV.box_h/2};
	 *	 var polygon = [
	 *		 {x:aClientLeftPoint[0], y:aClientLeftPoint[1]},
	 *		 {x:aClientRightPoint[0], y:aClientRightPoint[1]},
	 *		 {x:aClientRightunderPoint[0], y:aClientRightunderPoint[1]},
	 *		 {x:aClientLeftunderPoint[0], y:aClientLeftunderPoint[1]},
	 *		 {x:aClientLeftPoint[0], y:aClientLeftPoint[1]}
	 *	 ];
	 *   jsLib.utils.pointInPolygon(pointCenter, polygon);
	 */
	jsLib.utils.pointInPolygon = function(curPoint, points) {
		var counter = 0;
		for (var i = 0, p1, p2; i < points.length; i++) {
			p1 = points[i];
			p2 = points[(i + 1) % points.length];
			if (p1.y == p2.y) {
				continue;
			}
			if (curPoint.y <= Math.min(p1.y, p2.y)) {
				continue;
			}
			if (curPoint.y >= Math.max(p1.y, p2.y)) {
				continue;
			}
			var x = (curPoint.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
			if (x > curPoint.x) counter++;
		};

		if (counter % 2 == 0) {
			return false;
		} else {
			return true;
		};
	};

	/**
     * [功能: 作为一个对象的w和h属性返回视口的尺寸(视口坐标)]
     * @param  {Object} w 指定的窗口
     * @return {Object}   { x: 屏幕的宽度, y: 屏幕的高度 }
     */
    jsLib.utils.getViewportSize = function(w) {
    	//使用指定的窗口, 如果不带参数则使用当前窗口
    	var w = w || window;

    	//出了ie8及更早的版本以外, 其他浏览器都能用
    	if (w.innerWidth != null)
    		return { w: w.innerWidth, h: w.innerHeight };

    	//对标准下的ie (或任何浏览器)
    	var d = w.document;
    	if (document.compatMode == 'CSS1Compat')
    		return {
    			w: d.documentElement.clientWidth,
    			h: d.documentElement.clientHeight
    		};

        //对怪异模式下的浏览器
        return { w: d.body.clientWidth, h: d.body.clientHeight };
    };

    /**
     * [功能: 查询窗口滚动条的位置]
     * @param  {Object} w 指定的窗口
     * @return {Object}   { x: 滚动条的x, y: 滚动条的y }
     */
    jsLib.utils.getScrollOffset = function(w) {
    	//使用指定的窗口, 如果不带参数则使用当前窗口
    	var w = w || window;

    	//除了ie8及更早的版本, 其他浏览器都能用
    	if (w.pageXOffset != null)
    		return { x: w.pageXOffset, y: w.pageYOffset }

    	//对于标准下的ie(或任意浏览器)
    	var d = w.document;
    	if (document.compatMode == 'CSS1Compat')
    		return { x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop }

    	//对于怪异模式下的浏览器
    	return { x: d.body.scrollLeft, y: d.body.scrollTop }
    };


    /**
     * [功能: 文档如果有滚动条的话,就不行了(文档坐标,含滚动条)]
     * @param  {Object Dom} e dom节点
     * @return {Object}   返回节点坐标(含滚动条)
     */
    jsLib.utils.getElementPosition = function(e) {
    	var x = 0,
    	    y = 0;
    	while(e != null) {
    		x += e.offsetLeft;
    		y += e.offsetTop;
    		e = e.offsetParent;
    	}

    	return { x: x, y: y };
    };

    /**
     * [功能: 增强版(视口坐标)  与 dom.getBoundingClientRect()对象中left和top相等,并且getBoundingClientRect方法效率高]
     * @param  {Object Dom} elt dom节点
     * @return {Object}     返回节点坐标(不含滚动条)
     */
    jsLib.utils.getElementPos = function(elt) {
    	var x = 0, y = 0;

    	//循环以累加偏移量
    	for (var e = elt; e != null; e = e.offsetParent) {
    		x += e.offsetLeft;
    		y += e.offsetTop;
    	}

    	//在此循环所有的祖先元素,减去滚动的偏移量
    	//这也减去了主滚动条, 并转化为视口坐标
    	for (var e = elt.parentNode; e != null && e.nodeType == 1; e = e.parentNode) {
    		x -= e.scrollLeft;
    		y -= e.scrollTop;
    	}

    	return { x: x, y: y };
    };

    //函数赋值
    jsLib.utils.getByClass = _methodSets.getByClass;
    jsLib.utils.convertToArray = _methodSets.convertToArray;


 	/*
 	 * 仅仅简单的dom Id选择器
 	 */
 	jsLib.getEle = function(id) {
 		return doc.querySelector(id);
 	};

 	 
	/*  ajax 的封装, 含跨域 jsonp
	 *
 	 *  参数	     默认值	          描述	              可选值
	 *	url	         “”	             请求的链接	          string
	 *	type	     get	         请求的方法	          get,post
	 *	data	     null	         请求的数据	          object,string
	 *	contentType	 “”	             请求头	              string
	 *	dataType	 “”	             请求的类型	          jsonp
	 *	async	     true	         是否异步	          blooean
	 *	timeOut	     undefined	     超时时间	          number
	 *	before	     function(){}	 发送之前执行的函数	  function
	 *	error	     function(){}	 请求报错执行的函数	  function
	 *	success	     function(){}	 请求成功的回调函数	  function
     *
	 *	@use
	 *	ajax({
	 *	    type:"post",
	 *	    dataType: 'jsonp',
	 *	    url:"http://wx.indoorun.com/wx/getUnitsOfFloor.html", //添加自己的接口链接
	 *	    data: {'regionId':'14428254382730015', 'floorId':'14428254382890016'},
	 *	    timeOut:5000,
	 *	    before:function(){
	 *	      console.log("before");  
	 *	    },
	 *	    success:function(str){
	 *	        console.log(str);
	 *	    },
	 *	    error:function(){
	 *	        console.log("error");
	 *	    }
	 *	});
 	 */
 	jsLib.ajax = function(options) {
 	    //编码数据
 	    function setData() {
 	        var name, value;
 	        if (data) {
 	            if (typeof data === "string") {
 	                data = data.split("&");
 	                for (var i = 0, len = data.length; i < len; i++) {
 	                    name = data[i].split("=")[0];
 	                    value = data[i].split("=")[1];
 	                    data[i] = encodeURIComponent(name) + "=" + encodeURIComponent(value);
 	                }
 	                data = data.replace("/%20/g", "+");
 	            } else if (typeof data === "object") {
 	                var arr = [];
 	                for (var name in data) {
 	                	if (typeof data[name] !== 'undefined') {
							var value = data[name].toString();
							name = encodeURIComponent(name);
							value = encodeURIComponent(value);
							arr.push(name + "=" + value);
						}

 	                }
 	                data = arr.join("&").replace("/%20/g", "+");
 	            }
 	            //若是使用get方法或JSONP，则手动添加到URL中
 	            if (type === "get" || dataType === "jsonp") {
 	                url += url.indexOf("?") > -1 ? (url.indexOf("=")>-1 ? "&"+data : data ): "?" + data;
 	            }
 	        }
 	    }
 	    // JSONP
 	    function createJsonp() {
 	        var script = document.createElement("script"),
 	            timeName = new Date().getTime() + Math.round(Math.random() * 1000),
 	            callback = "JSONP_" + timeName;

 	        window[callback] = function(data) {
 	            clearTimeout(timeout_flag);
 	            document.body.removeChild(script);
 	            success(data);
 	        }
 	        script.src = url +  (url.indexOf("?") > -1 ? "&" : "?") + "callback=" + callback;
 	        script.type = "text/javascript";
 	        document.body.appendChild(script);
 	        setTime(callback, script);
 	    }
 	    //设置请求超时
 	    function setTime(callback, script) {
 	        if (timeOut !== undefined) {
 	            timeout_flag = setTimeout(function() {
 	                if (dataType === "jsonp") {
 	                    // delete window[callback];
 	                    document.body.removeChild(script);

 	                } else {
 	                    timeout_bool = true;
 	                    xhr && xhr.abort();
 	                }
 	                console.log("timeout");
                    error && error('请求超时!');

 	            }, timeOut);
 	        }
 	    }
 	    // XHR
 	    function createXHR() {
 	        //由于IE6的XMLHttpRequest对象是通过MSXML库中的一个ActiveX对象实现的。
 	        //所以创建XHR对象，需要在这里做兼容处理。
 	        function getXHR() {
 	            if (window.XMLHttpRequest) {
 	                return new XMLHttpRequest();
 	            } else {
 	                //遍历IE中不同版本的ActiveX对象
 	                var versions = ["Microsoft", "msxm3", "msxml2", "msxml1"];
 	                for (var i = 0; i < versions.length; i++) {
 	                    try {
 	                        var version = versions[i] + ".XMLHTTP";
 	                        return new ActiveXObject(version);
 	                    } catch (e) {}
 	                }
 	            }
 	        }
 	        //创建对象。
 	        xhr = getXHR();
 	        xhr.open(type, url, async);
 	        //设置请求头
 	        if (type === "post" && !contentType) {
 	            //若是post提交，则设置content-Type 为application/x-www-four-urlencoded
 	            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
 	        } else if (contentType) {
 	            xhr.setRequestHeader("Content-Type", contentType);
 	        }
 	        //添加监听
 	        xhr.onreadystatechange = function() {
 	            if (xhr.readyState === 4) {
 	                if (timeOut !== undefined) {
 	                    //由于执行abort()方法后，有可能触发onreadystatechange事件，
 	                    //所以设置一个timeout_bool标识，来忽略中止触发的事件。
 	                    if (timeout_bool) {
 	                        return;
 	                    }
 	                    clearTimeout(timeout_flag);
 	                }
 	                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {

 	                    success(xhr.responseText);
 	                } else {
 	                     error(xhr.status, xhr.statusText);
 	                }
 	            }
 	        };
 	        //发送请求
 	        xhr.send(type === "get" ? null : data);
 	        setTime(); //请求超时
 	    }

 	    var url = options.url || "", //请求的链接
 	        type = (options.type || "get").toLowerCase(), //请求的方法,默认为get
 	        data = options.data || null, //请求的数据
 	        contentType = options.contentType || "", //请求头
 	        dataType = options.dataType || "", //请求的类型
 	        async = options.async === undefined && true, //是否异步，默认为true.
 	        timeOut = options.timeOut, //超时时间。 
 	        before = options.before || function() {}, //发送之前执行的函数
 	        error = options.error || function() {}, //错误执行的函数
 	        success = options.success || function() {}; //请求成功的回调函数
 	    var timeout_bool = false, //是否请求超时
 	        timeout_flag = null, //超时标识
 	        xhr = null; //xhr对角
 	    setData();
 	    before();
 	    if (dataType === "jsonp") {
 	        createJsonp();
 	    } else {
 	        createXHR();
 	    }
 	};

 	/*
 	 * 把url后面的参数放入到一个对象中去
 	 * 返回这个对象
 	 */
 	jsLib.getQueryString = function() {

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
 	};

 	/*
 	 * 绑定和解绑事件的方法
 	 */
 	jsLib.EventUtil = {

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
 	        return event ? event : win.event;
 	    },

 	    //获取事件目标 
 	    getTarget: function(event) {
 	        var oEvent = jsLib.EventUtil.getEvent(event);
 	        return oEvent.target || oEvent.srcElement; //标准或ie下
 	    },

 	    //取消默认事件 
 	    preventDefault: function(event) {
 	        var oEvent = jsLib.EventUtil.getEvent(event);
 	        oEvent.preventDefault ? oEvent.preventDefault() : oEvent.returnValue = false;
 	    },

 	    //阻止事件冒泡和事件捕获 
 	    stopPropagation: function(event) {
 	        var oEvent = jsLib.EventUtil.getEvent(event);
 	        oEvent.stopPropagation ? oEvent.stopPropagation() : oEvent.cancelBubble = true;
 	    }
 	};

 	/************** 以上是一些常用的方法挂在到jsLib(类方法)   结束 **************/




 	/************** 以下一些方法(插件)扩展到JSLibrary原型上    开始 **************/

 	/*
 	 * 任意dom节点运动方法
 	 * @param { Object } 运动的属性
 	 * @param { Function } 回调函数
 	 * @user jsLib('#id').animate({left: '200', top: '200', 'opacity': 30});
 	 */
    jsLib().extend('animate', function(json, fn, time) {

    	var time = time || 30;

    	this.elements.forEach(function(item, index, array) {
    		startMove(item, json, fn);
    	});

    	function getStyle(obj, attr) {
    	    if (obj.currentStyle) {
    	        return obj.currentStyle[attr];
    	    } else {
    	        return getComputedStyle(obj, false)[attr];
    	    }
    	}
    	//运动
    	function startMove(obj, json, fn) {
    	    clearInterval(obj.timer);
    	    obj.timer = setInterval(function() {
    	        var attr = '';
    	        var iStop = true; //假设所有值都到达了，定时器里一轮的运动结束了
    	        for (attr in json) {
    	            //1.计算当前值
    	            var iCurr = 0;
    	            if (attr == 'opacity') {
    	                iCurr = parseInt(parseFloat(getStyle(obj, attr)) * 100);
    	            } else {
    	                iCurr = parseInt(getStyle(obj, attr));
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
    	    }, time);
    	}
    });

    /*
     *  节点淡出功能
     *
     */
    jsLib().extend('fadeOut', function(oncomplete, time) {
    	this.elements.forEach(function(item, index, array) {
    		fadeOut(item, oncomplete, time);
    	});

    	function fadeOut(e, oncomplete, time) {
    	    if (typeof e === 'string') e = document.querySelector('#e');
    	    if (!time) time = 500;

    	    var ease = Math.sqrt;

    	    var start = (new Date()).getTime();
    	    animate();

    	    function animate()　 { //未完成
    	        var elapsed = (new Date()).getTime() - start;
    	        var fraction = elapsed / time;

    	        if (fraction < 1) {
    	            var opacity = 1 - ease(fraction);
    	            e.style.opacity = String(opacity);
    	            setTimeout(animate, Math.min(25, time - elapsed));

    	        } else { // 否则动画完成
    	            e.style.opacity = '0';
    	            oncomplete && oncomplete(e);
    	        }
    	    }
    	}
    });

    /*
     *  节点淡入功能
     *
     */
    jsLib().extend('fadeIn', function(oncomplete, time) {
    	this.elements.forEach(function(item, index, array) {
    		fadeOut(item, oncomplete, time);
    	});
    	
    	function fadeOut(e, oncomplete, time) {
    	    if (typeof e === 'string') e = document.querySelector('#e');
    	    if (!time) time = 500;

    	    var ease = Math.sqrt;

    	    var start = (new Date()).getTime();
    	    animate();

    	    function animate()　 { //未完成
    	        var elapsed = (new Date()).getTime() - start;
    	        var fraction = elapsed / time;

    	        if (fraction < 1) {
    	            var opacity = 0 + ease(fraction);
    	            e.style.opacity = String(opacity);
    	            setTimeout(animate, Math.min(25, time - elapsed));

    	        } else { // 否则动画完成
    	            e.style.opacity = '1';
    	            oncomplete && oncomplete(e);
    	        }
    	    }
    	}
    });

    /**
     *  移动端上下左右手势
     *  @param { Object }  callback 主要放对应的回掉函数(必须)  
     *  @param { Object }  options  配置参数(可选)
     *  @param { String }  swipe  指定 swipeLeft swipeRight swipeUp swipeDown(必须)
     *  @use
     *	jsLib('#id').find('ele').swipe({
     *		left: leftFn,
     *		right: rightFn
     *	}, {
     *		distance: 25,    
     *     	duration: 2000,    
     *     	triggerOnMove: true,
     *     	bStopPropagation: true,    
     *     	bPreventDefault: true
     *	}, 'swipeLeft swipeRight');
     */
    jsLib().extend('swipe', function(callback, options, swipe) {

     	/**
     	* 构造函数
     	* @param  ele        触发事件的元素
     	* @param  callback   事件回调函数
     	* @param  eventName   事件名
     	* @oaram  options.distance    滑动距离，超过该距离触发swipe事件，单位像素。
     	* @oaram  options.duration    滑动时长，超过该时间不触发swipe事件，单位毫秒
     	* @param  options.bStopPropagation   是否停止冒泡，true为停止冒泡
     	* @param  options.bPreventDefault    是否阻止默认事件，true为阻止默认事件
     	* @param  options.triggerOnMove      swipe事件有两种触发方式，一种是在touchmove过程中，只要满足滑动距离条件即触发。
     	*                                    一种是在touchend中，进入滑动距离判断，如果满足滑动距离触发。
     	*                                    默认是在touchend中触发。
     	*/
     	function TouchSwipe(ele, callback, options) {    //touch构造函数
     		this.ele = ele;
     		this.callback = callback || null;

     		this.options = (options !== undefined && !TouchSwipe.isEmptyObject(options)) ? {
     				distance: options.distance,    
     				duration: options.duration,    
     				triggerOnMove: options.triggerOnMove,
     				bStopPropagation: options.bStopPropagation,    
     				bPreventDefault: options.bPreventDefault
     			}: {
     				distance: 30,    
     				duration: 1000  
     			};

     		this.values = {
     			startPoint: null, 
     			endPoint: null, 
     			timer: null
     		};
     	}

     	TouchSwipe.prototype = {
     		
     		constructor: TouchSwipe,

     		//swipeLeft、swipeRight、swipeUp、swipeDown事件绑定
     		on: function(str) {
     			var arr = TouchSwipe.splitStr(str);

     			TouchSwipe.each(arr, this.bindSwipe, this);

     			return this;
     		},

     		//绑定touchstart, touchmove, touchend
     		bindSwipe: function(eventName) {
     			if (!this.ele) return;

     			var _this = this;
     			this.ele.addEventListener('touchstart', function(event){
     			    var self = this, 
     			        touchPoint = event.touches[0];

     			    _this.preventDefault(event);

     			    _this.values.startPoint = {
     			        x: Math.floor(touchPoint.clientX),
     			        y: Math.floor(touchPoint.clientY)
     			    };

     			    _this.values.timer = setTimeout(function(){
     			        //如果超时，清空本次touch数据
     			        _this.clearSwipe();
     			    }, _this.options.duration);
     			});

     			this.ele.addEventListener('touchmove', function(event){
     			    var self = this, 
     			        touchPoint = event.touches[0];

     			    _this.preventDefault(event);

     			    if(_this.values.startPoint){
     			        _this.values.endPoint = {
     			            x: Math.floor(touchPoint.clientX),
     			            y: Math.floor(touchPoint.clientY)
     			        };

     			        //执行swipe事件判断，是否符合触发事件
     			        if(_this.options.triggerOnMove){    //默认不传为false,不在此出发swipe事件
     			            if(_this.execSwipe(self, eventName, event)){
     			                _this.clearSwipe();
     			            }
     			        }
     			    }
     			});

     			this.ele.addEventListener('touchend', function(event){
     				var self = this;
     			    _this.preventDefault(event);

     			    //执行后再清除本次touch数据
     			    if (_this.execSwipe(self, eventName, event)) _this.clearSwipe();
     			    
     			});

     			return this;
     		},
     	    
     	    //阻止默认事件和冒泡事件 
     		preventDefault: function(event) {
     			if (this.options) {
     				//阻止冒泡
     				if (this.options.bStopPropagation) {
     					event.stopPropagation();
     				}
     				//取消事件的默认动作
     				if(this.options.bPreventDefault){
     				    event.preventDefault();
     				}
     			}
     		},

     	    /**
     		* 计算滑动方向
     		* 首先根据x方向和y方向滑动的长度决定触发x方向还是y方向的事件。
     		* 然后再判断具体的滑动方向。
     		* 如果滑动距离不够长，不判断方向。
     		*/
     		//判断方向
     		swipeDirection: function(x1, y1, x2, y2){    
     		    var diffX = x1 - x2,
     		        diffY = y1 - y2,
     		        absX = Math.abs(diffX),
     		        absY = Math.abs(diffY),
     		        swipe;

     		    if(absX >= absY){
     		        if(absX >= this.options.distance){
     		            swipe = diffX > 0 ? 'swipeLeft' : 'swipeRight';
     		        }
     		    }else{
     		        if(absY >= this.options.distance){
     		            swipe = diffY > 0 ? 'swipeUp' : 'swipeDown';
     		        }
     		    }
     		    return swipe;
     		},

     		// 清除本次滑动数据
     		clearSwipe: function() {
     		    this.values.startPoint = undefined;
     		    this.values.endPoint = undefined;

     		    if (this.values.timer !== undefined) {
     		        clearTimeout(this.values.timer);
     		        this.values.timer = undefined;
     		    }
     		},

     		/**
     		* 判断是否符合条件，如果符合条件就执行swipe事件
     		* @param  el     {HTMLElement}  元素
     		* @param  event  {Event}        Touch原始事件
     		* @param  return 如果执行了事件，就返回true。
     		*/
     		execSwipe: function(ele, eventName, event){
     			// console.log('this:' + this);
     			
     		    if(this.values.startPoint && this.values.endPoint && this.swipeDirection(this.values.startPoint.x, this.values.startPoint.y, this.values.endPoint.x, this.values.endPoint.y) === eventName){
     		        // this.callback.call(this.ele, event);
     		        //执行移动过程中的函数
     		        // if (triggerOnMove) this.options.onMoveFn && this.options.onMoveFn.call(ele, event); 

     	        	if (eventName == 'swipeLeft') this.callback.left && this.callback.left.call(ele, event); 
     	        	if (eventName == 'swipeRight') this.callback.right && this.callback.right.call(ele, event); 
     	        	if (eventName == 'swipeUp') this.callback.up && this.callback.up.call(ele, event); 
     	        	if (eventName == 'swipeDown') this.callback.down && this.callback.down.call(ele, event); 

     		        return true;
     		    }
     		}
     	}

     	TouchSwipe.each = function(obj, iterator, context) {
     		var i;

     		if (!obj) {
     		    return;
     		}

     		if (obj.forEach) {
     		    obj.forEach(iterator, context);
     		} else if (obj.length !== undefined) {
     		    i = 0;
     		    while (i < obj.length) {
     		        iterator.call(context, obj[i], i, obj);
     		        i++;
     		    }
     		} else {
     		    for (i in obj) {
     		        obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
     		    }
     		}
     	}

     	TouchSwipe.splitStr = function(str) {
     		return str.trim().split(/\s+/g);
     	}

     	TouchSwipe.isEmptyObject = function(obj) {  
     	    var p;  
     	    for (p in obj)  
     	        return !1;  
     	    return !0  
     	}

     	function touchSwipe(ele, callback, options) {

     		return new TouchSwipe(ele, callback, options);
     	}

     	//执行调用
     	var _arguments = arguments;
     	this.elements.forEach(function(item, index) {
     		if (typeof _arguments[1] === 'object' && typeof _arguments[2] === 'string') {
	     		touchSwipe(item, callback, options).on(swipe);

     		} else if (typeof _arguments[1] === 'string') {

	     		touchSwipe(item, callback).on(_arguments[1]);
     		}
     	});
    });

    
    /**
     *  移动端的tap,dbltap,longtap,swipeup,swipedown,swipeleft,swiperigth事件(可以独立使用)
     *  @use
     *  ele.addEventListener('tap',updateHtml);
	 *	ele.addEventListener('dbltap',updateHtml);
	 *	ele.addEventListener('longtap',updateHtml);
	 *	ele.addEventListener('swipeup',updateHtml);
	 *	ele.addEventListener('swipedown',updateHtml);
	 *	ele.addEventListener('swipeleft',updateHtml);
	 *	ele.addEventListener('swiperight',updateHtml);
	 *	ele.addEventListener('touchmove',preventDefault);
	 *	ele.addEventListener('touchstart',preventDefault);
	 *	ele.addEventListener('touchend',preventDefault);
     *
	 *	function updateHtml (e){
	 *		console.log(e);
	 *		e.preventDefault();
	 *		eventName.innerHTML = test.innerHTML =  e.type;
	 *		currX.innerHTML = e.x;
	 *		currY.innerHTML = e.y;
	 *		distanceX.innerHTML = e.distance ? e.distance.x : 'not available';
	 *		distanceY.innerHTML = e.distance ? e.distance.y : 'not available';
     *  }
    */
    (function(doc, win) {
      'use strict'
      if (typeof doc.createEvent !== 'function') return false // no tap events here
        // helpers
      var useJquery = typeof jQuery !== 'undefined',
        msEventType = function(type) {
          var lo = type.toLowerCase(),
            ms = 'MS' + type
          return navigator.msPointerEnabled ? ms : lo
        },
        // was initially triggered a "touchstart" event?
        wasTouch = false,
        touchevents = {
          touchstart: msEventType('PointerDown') + ' touchstart',
          touchend: msEventType('PointerUp') + ' touchend',
          touchmove: msEventType('PointerMove') + ' touchmove'
        },
        setListener = function(elm, events, callback) {
          var eventsArray = events.split(' '),
            i = eventsArray.length

          while (i--) {
            elm.addEventListener(eventsArray[i], callback, false)
          }
        },
        getPointerEvent = function(event) {
          return event.targetTouches ? event.targetTouches[0] : event
        },
        getTimestamp = function() {
          return new Date().getTime()
        },
        sendEvent = function(elm, eventName, originalEvent, data) {
          var customEvent = doc.createEvent('Event')
          customEvent.originalEvent = originalEvent
          data = data || {}
          data.x = currX
          data.y = currY
          data.distance = data.distance

          // jquery
          if (useJquery) {
            customEvent = jQuery.Event(eventName, {
              originalEvent: originalEvent
            })
            jQuery(elm).trigger(customEvent, data)
          }

          // addEventListener
          if (customEvent.initEvent) {
            for (var key in data) {
              customEvent[key] = data[key]
            }
            customEvent.initEvent(eventName, true, true)
            elm.dispatchEvent(customEvent)
          }

          // detect all the inline events
          // also on the parent nodes
          while (elm) {
            // inline
            if (elm['on' + eventName])
              elm['on' + eventName](customEvent)
            elm = elm.parentNode
          }

        },

        onTouchStart = function(e) {
          /**
           * Skip all the mouse events
           * events order:
           * Chrome:
           *   touchstart
           *   touchmove
           *   touchend
           *   mousedown
           *   mousemove
           *   mouseup <- this must come always after a "touchstart"
           *
           * Safari
           *   touchstart
           *   mousedown
           *   touchmove
           *   mousemove
           *   touchend
           *   mouseup <- this must come always after a "touchstart"
           */

          // it looks like it was a touch event!
          if (e.type !== 'mousedown')
            wasTouch = true

          // skip this event we don't need to track it now
          if (e.type === 'mousedown' && wasTouch) return

          var pointer = getPointerEvent(e)

          // caching the current x
          cachedX = currX = pointer.pageX
            // caching the current y
          cachedY = currY = pointer.pageY

          longtapTimer = setTimeout(function() {
            sendEvent(e.target, 'longtap', e)
            target = e.target
          }, longtapThreshold)

          // we will use these variables on the touchend events
          timestamp = getTimestamp()

          tapNum++

        },
        onTouchEnd = function(e) {

          // skip the mouse events if previously a touch event was dispatched
          // and reset the touch flag
          if (e.type === 'mouseup' && wasTouch) {
            wasTouch = false
            return
          }

          var eventsArr = [],
            now = getTimestamp(),
            deltaY = cachedY - currY,
            deltaX = cachedX - currX

          // clear the previous timer if it was set
          clearTimeout(dblTapTimer)
            // kill the long tap timer
          clearTimeout(longtapTimer)

          if (deltaX <= -swipeThreshold)
            eventsArr.push('swiperight')

          if (deltaX >= swipeThreshold)
            eventsArr.push('swipeleft')

          if (deltaY <= -swipeThreshold)
            eventsArr.push('swipedown')

          if (deltaY >= swipeThreshold)
            eventsArr.push('swipeup')

          if (eventsArr.length) {
            for (var i = 0; i < eventsArr.length; i++) {
              var eventName = eventsArr[i]
              sendEvent(e.target, eventName, e, {
                distance: {
                  x: Math.abs(deltaX),
                  y: Math.abs(deltaY)
                }
              })
            }
            // reset the tap counter
            tapNum = 0
          } else {

            if (
              cachedX >= currX - tapPrecision &&
              cachedX <= currX + tapPrecision &&
              cachedY >= currY - tapPrecision &&
              cachedY <= currY + tapPrecision
            ) {
              if (timestamp + tapThreshold - now >= 0) {
                // Here you get the Tap event
                sendEvent(e.target, tapNum >= 2 && target === e.target ? 'dbltap' : 'tap', e)
                target = e.target
              }
            }

            // reset the tap counter
            dblTapTimer = setTimeout(function() {
              tapNum = 0
            }, dbltapThreshold)

          }
        },
        onTouchMove = function(e) {
          // skip the mouse move events if the touch events were previously detected
          if (e.type === 'mousemove' && wasTouch) return

          var pointer = getPointerEvent(e)
          currX = pointer.pageX
          currY = pointer.pageY
        },
        swipeThreshold = win.SWIPE_THRESHOLD || 100,
        tapThreshold = win.TAP_THRESHOLD || 150, // range of time where a tap event could be detected
        dbltapThreshold = win.DBL_TAP_THRESHOLD || 200, // delay needed to detect a double tap
        longtapThreshold = win.LONG_TAP_THRESHOLD || 500, // delay needed to detect a long tap
        tapPrecision = win.TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
        justTouchEvents = win.JUST_ON_TOUCH_DEVICES,
        tapNum = 0,
        currX, currY, cachedX, cachedY, timestamp, target, dblTapTimer, longtapTimer

      //setting the events listeners
      // we need to debounce the callbacks because some devices multiple events are triggered at same time
      setListener(doc, touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart)
      setListener(doc, touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd)
      setListener(doc, touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove)

    }(document, window));


    /**
     * 任意运动, 传入回调函数, 分批执行 
     * @return {_stopMove} 可以停止运动
     * 可以单独使用
     * @user 
     * var stop = move.elastic([0, 1], 800, function(v){
     *     console.log(v);    // v是速度在 0,1之间以各种运动变化, 每变化一次就执行一次函数
	 * }
	 *
	 * stop();  //通过调用,可以立即停止
     */
	(function(){
		var Move = function(){};

		var curve = Move.prototype = {
			extend: function(obj){
				for(var k in obj){
					if(k in curve){
						try{
							console.warn( k + '已经被修改!');
						} catch(e){}
					}
					curve[k] = (function(moveType){
						return function(){
							return _doMove.call(this, arguments, moveType);
						}
					})(obj[k]);
				}
			}
		}

		// move中函数传入如下参数
		// r => 过渡范围, 例如[0, 1000]   (必须传, 且传数组)
		// d => 过渡时间, ms,             (可不传, 默认500)
		// fn => 每一帧的回调函数, 传入当前过渡值v   (必须传)
		// fnEnd => 动画结束时回调               (可不传)
		// 例如: m.ease([0, 1000], 500, function(v){ ... }, fnEnd)
		// 注意: 这些参数的顺序可以打乱!!!
		if(typeof module === 'object' && module.exports) {
			module.exports = new Move;
		} else {
			if(window.move) {
				try {
					console.log('move has been declared!');
				} catch(e) {}
			} else {
				// window.move = new Move;
				jsLib.move = new Move;
				jsLib.move.form = ['ease', 'easeIn', 'ease2', 'easeOut', 'collision', 'elastic', 'linear', 'wave', 'opposite'];
			}
		}


		var request = window.requestAnimationFrame,
			stopRequest = window.cancelAnimationFrame;

		var _move, _stopMove;

		//初始化运动函数和停止函数  
		if(request) {
			_move = function(fn, timer){
				var step = function() {
					if(!fn()) {
						timer.id = request(step);	// 自调用
					} 
				}
				step();
			}
		} else {
			_move = function(fn, timer) {
				timer.id = setInterval(fn, 16);
			}
		}

		if(stopRequest) {
			_stopMove = function(timer) {
				stopRequest(timer.id);
			}
		} else {
			_stopMove = function(timer) {
				clearInterval(timer.id);
			}
		}

		//开始动画函数
		function _doMove(arg, moveType){
			var arr, sTime, fn, fnEnd;

			// 严格限制传入参数, 且传入的参数可以没有顺序
			for(var i = 0; i < 4; i++){
				if(typeof arg[i] === 'object' && !arr) arr = arg[i];
				else if(typeof arg[i] === 'number' && !sTime) sTime = arg[i];
				else if(typeof arg[i] === 'function' && !fn) fn = arg[i];
				else if(typeof arg[i] === 'function' && !fnEnd) fnEnd = arg[i];
			}

			if(!arr instanceof Array || !fn) return;

			sTime = sTime || 500;

			var from = +new Date, //起始时间
				timeStamp = 0,  // 0-1左右
				speed,
				startSpeed = arr[0],    // 开始速度
				endSpeed = arr[1];    // 结束速度

			var timer = 't' + Math.random();

			var self = this;    // this指向move

			//用于保存定时器ID的对象, requestAnimation递归调用必须传入对象
			this[timer] = {};


			_move(function(){
				timeStamp = (+new Date - from)/sTime;

				if(timeStamp >= 1){
					// 动画结束
					fn(endSpeed);
					if(fnEnd) fnEnd();
					return true;
				} else {    // 动画变化
					speed = moveType(timeStamp);
					var speedChanging = startSpeed + (endSpeed - startSpeed) * speed;    // 在startSpeed 和 endSpeed之间(包含这2个)
					fn(speedChanging);
				}
			}, self[timer]);
			
			return function(){
				_stopMove(self[timer]);
				return startSpeed + (endSpeed - startSpeed) * speed;
			}
		}

		var PI = Math.PI,
				sin = Math.sin,
				cos = Math.cos,
				pow = Math.pow,
				abs = Math.abs,
				sqrt = Math.sqrt;


		/*****  动画曲线  ******/

		curve.extend({
			//定义域和值域均为[0, 1], 传入自变量x返回对应值y
			//先加速后减速
			ease: function(x){
				// return -0.5*cos(PI * (2 - x)) + 0.5;
				if(x <= 0.5) return 2*x*x;
				else if(x > 0.5) return -2*x*x + 4*x - 1;
			},

			// 初速度为0 ,一直加速
			easeIn: function(x){
				return x*x;
			},

			//先慢慢加速1/3, 然后突然大提速, 最后减速
			ease2: function(x){
				return x < 1/3 ? x*x : -2*x*x + 4*x - 1;
			},

			//初速度较大, 一直减速, 缓冲动画
			easeOut: function(x){
				return pow(x, 0.8);
			},

			//碰撞动画
			collision: function(x){
				var a, b; //a, b代表碰撞点的横坐标
				for(var i = 1, m = 20; i < m; i++){
					a = 1 - (4/3) * pow(0.5, i - 1);
					b = 1 - (4/3) * pow(0.5, i);
					if(x >= a && x <= b ){
						return pow(3*(x - (a + b)/2 ), 2) + 1 - pow(0.25, i - 1);
					}
				}
			},
		
			//弹性动画
			elastic: function(x){
				return -pow(1/12, x) * cos( PI*2.5*x*x ) + 1;
			},

			//匀速动画
			linear: function(x){
				return x;
			},

			//断断续续加速减速
			wave: function(x){
				return (1/12)*sin( 5*PI*x ) + x;
			},
			
			//先向反方向移动一小段距离, 然后正方向移动, 并超过终点一小段, 然后回到终点
			opposite: function(x){
				return (sqrt(2)/2)*sin( (3*PI/2)*(x - 0.5) ) + 0.5;
			}
			
		})

	})();

    (function() {

        var DEG_TO_RAD =  0.017453292519943295;

        // 三维矩阵
        var Matrix3D = function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
            this.elements = window.Float32Array ? new Float32Array(16) : [];
            var te = this.elements;
            te[0] = (n11 !== undefined) ? n11 : 1;
            te[1] = n21 || 0;
            te[2] = n31 || 0;
            te[3] = n41 || 0;

            te[4] = n12 || 0;
            te[5] = (n22 !== undefined) ? n22 : 1;
            te[6] = n32 || 0;
            te[7] = n42 || 0;

            te[8] = n13 || 0;
            te[9] = n23 || 0;
            te[10] = (n33 !== undefined) ? n33 : 1;
            te[11] = n43 || 0;

            te[12] = n14 || 0;
            te[13] = n24 || 0;
            te[14] = n34 || 0;
            te[15] = (n44 !== undefined) ? n44 : 1;
        };

        Matrix3D.prototype = {
            constructor: Matrix3D,

            set: function(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
                var te = this.elements;
                te[0] = n11; te[4] = n12; te[8] = n13; te[12] = n14;
                te[1] = n21; te[5] = n22; te[9] = n23; te[13] = n24;
                te[2] = n31; te[6] = n32; te[10] = n33; te[14] = n34;
                te[3] = n41; te[7] = n42; te[11] = n43; te[15] = n44;
                return this;
            },
            identity: function() {
                this.set(
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1
                );
                return this;
            },
            appendTransform: function(x, y, z, scaleX, scaleY, scaleZ, rotateX, rotateY, rotateZ, skewX, skewY, originX, originY, originZ) {

                var rx = rotateX * DEG_TO_RAD;
                var cosx = this._rounded(Math.cos(rx));
                var sinx = this._rounded(Math.sin(rx));
                var ry = rotateY * DEG_TO_RAD;
                var cosy = this._rounded(Math.cos(ry));
                var siny = this._rounded(Math.sin(ry));
                var rz = rotateZ * DEG_TO_RAD;
                var cosz = this._rounded(Math.cos(rz * -1));
                var sinz = this._rounded(Math.sin(rz * -1));

                this.multiplyMatrices(this, this._arrayWrap([
                    1, 0, 0, x,
                    0, cosx, sinx, y,
                    0, -sinx, cosx, z,
                    0, 0, 0, 1
                ]));

                this.multiplyMatrices(this, this._arrayWrap([
                    cosy, 0, siny, 0,
                    0, 1, 0, 0,
                    -siny, 0, cosy, 0,
                    0, 0, 0, 1
                ]));

                this.multiplyMatrices(this, this._arrayWrap([
                    cosz * scaleX, sinz * scaleY, 0, 0,
                    -sinz * scaleX, cosz * scaleY, 0, 0,
                    0, 0, 1 * scaleZ, 0,
                    0, 0, 0, 1
                ]));

                if (skewX || skewY) {
                    this.multiplyMatrices(this, this._arrayWrap([
                        this._rounded(Math.cos(skewX * DEG_TO_RAD)), this._rounded(Math.sin(skewX * DEG_TO_RAD)), 0, 0,
                        -1 * this._rounded(Math.sin(skewY * DEG_TO_RAD)), this._rounded(Math.cos(skewY * DEG_TO_RAD)), 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1
                    ]));
                };

                if (originX || originY || originZ) {
                    this.elements[12] -= originX * this.elements[0] + originY * this.elements[4] + originZ * this.elements[8];
                    this.elements[13] -= originX * this.elements[1] + originY * this.elements[5] + originZ * this.elements[9];
                    this.elements[14] -= originX * this.elements[2] + originY * this.elements[6] + originZ * this.elements[10];
                };

                return this;
            },
            // 矩阵相乘
            multiplyMatrices: function(a, be) {
                var ae = a.elements;
                var te = this.elements;

                var a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
                var a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
                var a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
                var a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

                var b11 = be[0], b12 = be[1], b13 = be[2], b14 = be[3];
                var b21 = be[4], b22 = be[5], b23 = be[6], b24 = be[7];
                var b31 = be[8], b32 = be[9], b33 = be[10], b34 = be[11];
                var b41 = be[12], b42 = be[13], b43 = be[14], b44 = be[15];

                te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
                te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
                te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
                te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

                te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
                te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
                te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
                te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

                te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
                te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
                te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
                te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

                te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
                te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
                te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
                te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

                return this;
            },
            // 解决角度为90的整数倍导致Math.cos得到极小的数，其实是0。导致不渲染
            _rounded: function(value, i) {
                i = Math.pow(10, i || 15);
                return Math.round(value * i) / i;
            },
            _arrayWrap: function(arr) {
                return window.Float32Array ? new Float32Array(arr) : arr;
            }
        };

        // 主入口函数
        function Transform(obj, notPerspective) {
            var observeProps = ['translateX', 'translateY', 'translateZ', 'scaleX', 'scaleY', 'scaleZ', 'rotateX', 'rotateY', 'rotateZ', 'skewX', 'skewY', 'originX', 'originY', 'originZ'],
                objIsElement = isElement(obj);
            if (!notPerspective) {
                observeProps.push('perspective');
            };

            obj.matrix3d = new Matrix3D();
            observe(
                obj,
                observeProps,
                function() {
                    var mtx = obj.matrix3d.identity().appendTransform(obj.translateX, obj.translateY, obj.translateZ, obj.scaleX, obj.scaleY, obj.scaleZ, obj.rotateX, obj.rotateY, obj.rotateZ, obj.skewX, obj.skewY, obj.originX, obj.originY, obj.originZ);
                    var transform = (notPerspective ? '' : 'perspective(' + obj.perspective + 'px) ') + 'matrix3d(' + Array.prototype.slice.call(mtx.elements).join(',') + ')';
                    if (objIsElement) {
                        obj.style.transform = obj.style.msTransform = obj.style.OTransform = obj.style.MozTransform = obj.style.webkitTransform = transform;
                    } else {
                        obj.transform = transform;
                    };
                });

            if (!notPerspective) {
                obj.perspective = 500;    // 景深默认值
            };
            obj.scaleX = obj.scaleY = obj.scaleZ = 1;
            obj.translateX = obj.translateY = obj.translateZ = obj.rotateX = obj.rotateY = obj.rotateZ = obj.skewX = obj.skewY = obj.originX = obj.originY = obj.originZ = 0;
        };

        // 工具函数
        function isElement(obj) {
            return (
                typeof HTMLElement === 'object' ? obj instanceof HTMLElement : //DOM2
                    obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string'
            );
        };

        function observe(target, props, callback) {
            for (var i = 0, len = props.length; i < len; i += 1) {
                var prop = props[i];
                watch(target, prop, callback);
            };
        };

        // 每一次改变那15个属性中的任意一个,都会执行回调
        function watch(target, prop, callback) {
            Object.defineProperty(target, prop, {
                get: function() {
                    return this['_' + prop];
                },
                set: function(value) {
                    if (value !== this['_' + prop]) {
                        this['_' + prop] = value;
                        callback();
                    };
                }
            });
        };

        // 抛出去
        jsLib.Transform = Transform;
    })();


    /************** 上面一些方法(插件)扩展到JSLibrary原型上    结束 **************/


    // 把jsLib抛出去
 	function jsLib(arg) {
 		return new JSLibrary(arg);
 	}

 	if (!win.jsLib) win.jsLib = jsLib;

}(window, document, undefined));