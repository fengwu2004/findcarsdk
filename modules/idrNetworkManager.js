/**
 * Created by yan on 01/03/2017.
 */


import coreManager from './idrCoreManager.js'

var networkInstance = new idrNetworkManager()

//-------------------------
var networkdebug = false
import $ from 'jquery'
function doAjax_debug(url, data, success) {

  $.post(url, JSON.stringify(data), function(res) {

    success && success(res)
  })
}
//-------------------------

function ajax(options) {
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
        console.log(data)
        console.log(typeof data)
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

function doAjax(url, data, successFn, failedFn) {

  console.log('网络请求' + url)

  if (data) {

    ajax({

      type: "get",

      dataType: 'jsonp',

      url: url, //添加自己的接口链接

      data: data,

      timeOut: 10000,

      before:function () {

      },

      success:function (response) {

        console.log('请求成功' + url)

        if (response != null && response.code == "success") {

          successFn && successFn(response)
        }
        else {

          if (failedFn) {

            failedFn && failedFn(response);
          }
          else {

            console.log(JSON.stringify(response))
          }
        }
      },

      error:function (response) {

        if (failedFn) {

          failedFn && failedFn(response);
        }
        else {

          console.log(JSON.stringify(response))
        }
      }
    });
  }
  else {

    ajax({

      type: "get",

      dataType: 'jsonp',

      url: url, //添加自己的接口链接

      timeOut: 10000,

      before:function () {

      },

      success:function (response) {

        if (response != null && response.code == "success") {

          successFn && successFn(response)
        }
        else {

          if (failedFn) {

            failedFn && failedFn(response);
          }
          else {

            console.log(JSON.stringify(response))
          }
        }
      },

      error:function (response) {

        if (failedFn) {

          failedFn && failedFn(response);
        }
        else {

          console.log(JSON.stringify(response))
        }
      }
    });
  }
}

function idrNetworkManager() {

  this.host = 'https://wx.indoorun.com/'

  this.debug_host = 'http://192.168.1.86:8888/'

  var ua = navigator.userAgent

  if (ua.match(/iPhone|iPod/i) != null) {

    this.osType = 'iPhone'
  }
  else if (ua.match(/Android/i) != null) {

    this.osType = 'Android'
  }
  else {

    this.osType = 'unknow'
  }
}

idrNetworkManager.prototype.doAjax = function(url, data, successFn, failedFn) {

  data.appId = coreManager.appId

  data.sessionKey = coreManager.sessionKey

  data.clientId = coreManager.clientId

  doAjax(url, data, successFn, failedFn)
}

idrNetworkManager.prototype.serverCallWxAuth = function(success, failed) {

  var url = this.host + 'wxauth/getAuthParas?reqUrl=' + window.location.href;

  doAjax(url, null, success, failed)
}

idrNetworkManager.prototype.serverCallInitSession = function(url, success, failed) {

  if (false && networkdebug) {

    var url = this.debug_host + 'wx/initSession.html'

    doAjax_debug(url, {}, success, failed)
  }
  else {

    doAjax(url, {}, success, failed)
  }
}

idrNetworkManager.prototype.serverCallWXSign = function(data, success, failed) {

  if (false && networkdebug) {

    var url = this.debug_host + 'wx/getSign.html'

    doAjax_debug(url, data, success, failed)
  }
  else {

    var url = this.host + 'wx/getSign.html'

    this.doAjax(url, data, success, failed)
  }
}

idrNetworkManager.prototype.serverCallRegionPathData = function (regionId, success, failed) {

  var url = this.host + 'wx/getRegionPathData';

  var data = {
    'regionId': regionId
  };

  this.doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallRegionAllInfo = function (regionId, success, failed) {

  var url = this.host + 'wx/getRegionData';

  var data = {
    'regionId': regionId
  };

  this.doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.getMarkedUnit = function(regionId, success, failed) {

  if (false && networkdebug) {

    var url = this.debug_host + 'chene/getCheLocation.html'

    var data = {

      regionId:regionId
    }

    doAjax_debug(url, data, success, failed)
  }
  else {

    var url = this.host + 'chene/getCheLocation.html'

    var data = {

      regionId:regionId
    }

    this.doAjax(url, data, success, failed)
  }
}

idrNetworkManager.prototype.removeMarkedUnit = function(regionId, success, failed) {

  var url = this.host + 'chene/removeCheLocation.html'

  var data = {

    regionId:regionId
  }

  this.doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.saveMarkedUnit = function(unit, success, failed) {

  var pos = unit.getPos()

  var unitInJson = JSON.stringify({svgX:pos.x, svgY:pos.y, floorId:unit.floorId, regionId:unit.regionId})

  var url = this.host + 'chene/saveCheLocation.html'

  var data = {
    'sName': unitInJson
  };

  this.doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.getParkingPlaceUnitByCarNo = function(carNo, regionId, success, failed) {

  if (false) {

    var url = this.debug_host + 'chene/getParkingPlaceUnitByCarNo.html'

    var data = {
      'regionId': regionId,
      'carNo': carNo,
    }

    doAjax_debug(url, data, success, failed)
  }
  else {

    var url = this.host + 'chene/getParkingPlaceUnitByCarNo.html'

    var data = {
      'regionId': regionId,
      'carNo': carNo,
    }

    this.doAjax(url, data, success, failed)
  }
}

idrNetworkManager.prototype.testSaveRegionPos = function (allpos, regionId) {

  var url = this.debug_host + 'wx/saveRegionPos'

  var data = {
    'regionId': regionId,
    'pos':allpos
  };

  console.log('上传' + JSON.stringify(data))

  doAjax_debug(url, data)
}

idrNetworkManager.prototype.serverCallLocatingBin = function(beacons, count, regionId, floorId, success, failed) {
	
	var data = {
		'version':1,
		'beacons': beacons,
		'gzId': 'ewr2342342',
		'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
		'OSType': this.osType,
		'regionId': regionId,
		'floorId': floorId,
		'beaconCount':count
	}
	
  if (!beacons) {
	
	  data = {
		  'version':1,
		  'beacons': '',
		  'gzId': 'ewr2342342',
		  'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
		  'OSType': this.osType,
		  'regionId': regionId,
		  'floorId': floorId,
		  'beaconCount':count
	  }
  }
	
	
	if (coreManager.isAppEnd) {
		
		if (beacons && count) {
			
			data = {
				'version':1,
				'beacons': beacons,
				'gzId': 'ewr2342342',
				'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
				'OSType': this.osType,
				'regionId': regionId,
				'floorId': floorId,
				'beaconCount':count
			}
		}
		else {
			
			data = {
				'version':1,
				'beacons': '',
				'gzId': 'ewr2342342',
				'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
				'OSType': this.osType,
				'regionId': regionId,
				'floorId': floorId,
				'beaconCount':count
			}
		}
	}
	
	var url = this.host + 'locate/locatingBin';
	
	this.doAjax(url, data, success, failed)
}

export { networkInstance as default }