/**
 * Created by yan on 15/03/2017.
 */
define(function (require, exports, module) {

    var PathSearch = require('./pathRoute/PathSearch')

    var Position = require('./pathRoute/Position')

    var idrNetworkInstance = require('./idrNetworkManager')

    function idrRouter(regionId, floorList, clientId, appId, sessionKey) {

        var _clientId = clientId

        var _appId = appId

        var _sessionKey = sessionKey

        var _regionId = regionId

        var _floorList = floorList

        var _pathSearch = null

        function getFloorIndex(floorId) {

            for (var i = 0; i < _floorList.length; ++i) {

                if (_floorList[i].id === floorId) {

                    return _floorList[i].floorIndex
                }
            }

            return -1
        }

        function getFloorId(floorIndex) {

            for (var i = 0; i < _floorList.length; ++i) {

                if (_floorList[i].floorIndex === floorIndex) {

                    return _floorList[i].id
                }
            }

            return null
        }

        /**
         * @param start 起点
         * @param end 终点
         * @param car 是否车行
         * @return PathResult
         */
        this.routerPath = function(start, end, car, successFunc) {

            if (_pathSearch == null) {

                serverCallRegionPath(_regionId, function(data) {

                    unzipBlob(data, function(jobj) {

                        _pathSearch = new PathSearch(jobj)

                        var result = doRouter(start, end, car)

                        successFunc(result)
                    })

                }, null);
            }
            else  {

                var result = doRouter(start, end, car)

                successFunc(result)
            }
        }

        function doRouter(start, end, car) {

            var _sIndex = getFloorIndex(start.floorId)

            var _eIndex = getFloorIndex(end.floorId)

            var s = new Position

            s.x = start.x

            s.y = start.y

            var e = new Position

            e.x = end.x

            e.y = end.y

            var result = _pathSearch.search(_sIndex, s, _eIndex, e, car, null)

            for (var i = 0; i < result.paths.length; ++i) {

                var floorId = getFloorId(result.paths[i].floorIndex)

                result.paths[i].floorId = floorId

                for (var j = 0; j < result.paths[i].position.length; ++j) {

                    result.paths[i].position[j].floorId = floorId
                }
            }

            return result
        }

        zip.workerScriptsPath = './zip/'

        function unzipBlob(blob, callback) {

            var blobreader = new zip.Data64URIReader(blob)

            zip.createReader(blobreader, function(zipReader) {

                zipReader.getEntries(function(entries) {

                    entries[0].getData(new zip.BlobWriter("text/plain"), function(data) {

                        zipReader.close();

                        var reader = new FileReader();

                        reader.onload = function() {

                            var jobj = JSON.parse(reader.result)

                            callback(jobj)
                        }

                        reader.readAsText(data);
                    });
                });
            }, onerror);
        }

        function serverCallRegionPath(regionId, success, failed) {

            var url = 'http://wx.indoorun.com/wx/getPathOfRegionZipBase64.html?'

            var data = {
                'regionId': regionId,
                'appId': _appId,
                'clientId': _clientId,
                'sessionKey': _sessionKey
            };

            jsLib.ajax({

                type: "get",

                dataType: 'jsonp',

                url: url, //添加自己的接口链接

                data: data,

                timeOut: 10000,

                before:function () {

                },

                success:function (response) {

                    if (response != null && response.code == "success") {

                        if (typeof success === "function") {

                            success(response.data);
                        }
                    }
                },

                error:function (response) {

                    if (typeof failed === "function") {

                        failed(response);
                    }
                }
            });
        }
    }

    module.exports = idrRouter
});