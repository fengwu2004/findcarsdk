/**
 * Created by yan on 01/03/2017.
 */


import coreManager from './idrCoreManager.js'

var networkInstance = new idrNetworkManager();

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

function doAjax_(url, data, successFn, failedFn) {
    
    ajax({
        
        type: "get",
        
        dataType: 'jsonp',
        
        url: url, //添加自己的接口链接
        
        data: data,
        
        timeOut: 10000,
        
        before:function () {
        
        },
        
        success:function (response) {
            
            if (response != null && response.code == "success") {
                
                successFn && successFn(response.data)
            }
        },
        
        error:function (response) {
            
            failedFn && failedFn(response);
        }
    });
}

function doAjax(url, data, successFn, failedFn) {
    
    ajax({
        
        type: "get",
        
        dataType: 'jsonp',
        
        url: url, //添加自己的接口链接
        
        data: data,
        
        timeOut: 10000,
        
        before:function () {
        
        },
        
        success:function (response) {
            
            if (response != null && response.code == "success") {
    
                successFn && successFn(response)
            }
        },
        
        error:function (response) {
    
            failedFn && failedFn(response);
        }
    });
}

function idrNetworkManager() {

}

idrNetworkManager.prototype.serverCallWxAuth = function(success, failed) {
    
    var url = 'http://wx.indoorun.com/wxauth/getAuthParas?reqUrl=' + window.location.href;
    
    doAjax(url, {}, success, failed)
}

idrNetworkManager.prototype.serverCallInitSession = function(url, success, failed) {
    
    doAjax(url, {}, success, failed)
}

idrNetworkManager.prototype.serverCallWXSign = function(data, success, failed) {
 
    var url = 'http://wx.indoorun.com/wx/getSign.html'
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallRegionPath = function(regionId, success, failed) {
    
    var url = 'http://wx.indoorun.com/wx/getPathOfRegionZipBase64.html?regionId=14428254382730015'
    
    var data = {
        'regionId': regionId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallSvgMap = function (regionId, floorId, success, failed) {
    
    var url = 'http://wx.indoorun.com/wx/getSvg.html';
    
    var data = {
        'regionId': regionId,
        'floorId': floorId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallUnits = function(regionId, floorId, success, failed) {
    
    var data = {'regionId': regionId, 'floorId': floorId, 'appId': coreManager.appId, 'clientId': coreManager.clientId, 'sessionKey': coreManager.sessionKey};
    
    var url = 'http://wx.indoorun.com/wx/getUnitsOfFloor.html';
    
    doAjax_(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallRegionAllInfo = function (regionId, success, failed) {
    
    var url = 'http://wx.indoorun.com/wx/getRegionInfo';
    
    var data = {
        'regionId': regionId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallLocating = function(beacons, regionId, floorId, success, failed) {
    
    var domain = 'http://wx.indoorun.com';
    
    var url = domain + '/locate/locating';
    
    domain = "http://192.168.1.116:3000"
    
    url = domain + '/users/locating'
    
    var data = {
        'beacons': beacons,
        'gzId': 'ewr2342342',
        'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
        'OSType': 'iPhone',
        'regionId': regionId,
        'floorId': floorId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallRouteData = function(regionId, success, failed) {
    
    var url = 'http://wx.indoorun.com/wx/getPathOfRegionZipBase64.html?'
    
    var data = {
        'regionId': regionId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    doAjax(url, data, success, failed)
}

idrNetworkManager.prototype.serverCallLocate = function(regionId, floorId, success, failed) {
    
    var data = {
        'gzId': 'ewr2342342',
        'openId': 'wx_oBt8bt-1WMXu67NNZI-JUNQj6UAc',
        'OSType': 'iPhone',
        'regionId': regionId,
        'appId': coreManager.appId,
        'clientId': coreManager.clientId,
        'sessionKey': coreManager.sessionKey
    };
    
    var url = "http://localhost:3000/users/locating"
    
    doAjax(url, data, success, failed)
}

function pureAjax(url, data, success, failed) {

    var xhr = new XMLHttpRequest();

    if (data === null) {

        getType()

    } else {

        postType()
    }

    function getType() {

        xhr.onreadystatechange = function() {

            if (xhr.readyState === 4) {

                if (xhr.status >= 200 && xhr.status <= 304) {

                    var results = JSON.parse(xhr.response)

                    if (typeof success === 'function') {

                        success(results)
                    }

                }
                if (typeof failed === 'function') {

                    failed()
                }
            }
        }

        xhr.open('get', url + "?", true);

        xhr.send();
    }

    function postType() {

        xhr.onreadystatechange = function() {

            if (xhr.readyState === 4) {

                if (xhr.status === '200' || '304') {

                    var results = JSON.parse(xhr.response)

                    if (typeof success === 'function') {

                        success(results)
                    }

                } else {

                    if (typeof failed === 'function') {

                        failed()
                    }
                }
            }
        }

        xhr.open('post', url, true);

        xhr.setRequestHeader("Content-Type","application/json")

        xhr.send(data);
    }
}

export { networkInstance as default }