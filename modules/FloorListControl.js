/**
 * Created by yan on 23/01/2017.
 */

define(function (require, exports, module) {



    var FloorListControl = function(mapMD, blueTooth, comm) {

        var oFloorCtx = jsLib('#floorCtx');    // 包含生成楼层的父Div块

        var oCurrFloor = jsLib('#currName');    // 显示当前楼层的Div块

        var allFloorData = [];    // 所有楼层信息

        var bSupportPlate = false;    // 是否支持车牌查找和查询所有空车位数据

        var bSwitchFloor = true;    // 默认是自动切换楼层的

        var outInfo = [];    // 出口信息

        // 自动生成楼层
        function _createFloor(data) {

            var sHtml = '';

            data.forEach(function (obj, index) {

                sHtml += "<div class=\"lc_div2 lc_divcom\" id=" + '"' + obj.id + '"' + " title=" + '"' + obj.regionId + '"' + ">" + obj.name + " " +
                    "<span style=" + " 'opacity: 0' " + " class=" + "'lc_dot'" + ">●</span>" + "</div>";
            });

            oFloorCtx.html(sHtml);

            _changeStyle(data);
        };

        // 当前楼层被选中的样式
        function _changeStyle(data) {

            _autoChangeStyle();

            _floorListen();
        };

        // 给自动生成的div添加tap事件
        function _floorListen() {

            oFloorCtx.find('div').tap(function () {
                // 设置不自动切换
                bSwitchFloor = false;

                //切换楼层之前先保存
                _switchFloor(this.id, this.title);

                _autoChangeStyle();

                comm.showOrHidddenDiv('floorCtx', false);
            });

            //顶部当前楼层的tap事件
            oCurrFloor.tap(function () {

                if (oFloorCtx.toDom().style.display === 'block') {

                    comm.showOrHidddenDiv('floorCtx', false);
                }
                else {

                    comm.showOrHidddenDiv('floorCtx', true);
                }
            });
        };

        // 自动更改楼层样式
        function autoChangeStyle() {

            var oChild = oFloorCtx.find('div').elements;

            var mapInfo = mapMD.getMapInfo();

            var regionId = mapInfo.regionId;

            var floorId = mapInfo.floorId;    //从mapMD模块获取的

            Array.prototype.slice.call(oChild).map(function (objDom) {

                jsLib(objDom).removeClass('lc_div3 lc_divcom').addClass('lc_div2 lc_divcom');

                return objDom;

            }).forEach(function (objDom) {

                if (objDom.id === floorId && objDom.title === regionId) {

                    jsLib(objDom).removeClass('lc_div2 lc_divcom').addClass('lc_div3 lc_divcom');

                    oCurrFloor.html(objDom.innerHTML);
                }
            });
        };

        // 楼层切换
        function _switchFloor(floorId, regionId) {

            if ((floorId === undefined &&
                regionId === undefined) || floorId === map.floorId) return;

            map.load({
                floorId: floorId,
                regionId: regionId,
                switchFloor: true
            }, function succFn() {

                mapMD.setMapInfo(floorId, regionId);

                map.reducedMap();

                commMethods.dataLoadingCancel();

                commMethods.reuseCode();

            }, function beforeFn() {

                commMethods.dataLoading('楼层切换中...');
            });
        };

        // 根据楼层floorId求出楼层名
        function getFloorNameByFid(fId) {
            var i, length;
            for (i = 0, length = allFloorData.length; i < length; i += 1) {
                if (fId === allFloorData[i].id) {
                    return [allFloorData[i].name, allFloorData[i].regionId];
                }
                ;
            }
            ;
        };

        // 以下对外抛出

        return {    // 公有变量和方法
            // 楼层逻辑
            floorLogic: function () {
                map.changeFloor(function (data) {    // 很多信息
                    var floorList = data.floorList;    // 楼层信息
                    allFloorData = [];    // 置空
                    outInfo = data.outerExitList;    // 出口信息
                    allFloorData = floorList;
                    if (typeof data.dyRecognize === 'number' && data.dyRecognize === 1) {
                        bSupportPlate = true;
                    }
                    ;

                    _createFloor(floorList.reverse());
                }, function (errordata) {    // 获取楼层信息失败的回掉函数
                    console.log(errordata);
                });
            },

            // 自动更改楼层样式
            autoChangeStyle: autoChangeStyle,

            // 是否支持车牌找车
            isSupportPlate: function () {
                return bSupportPlate;
            },

            // 根据楼层floorId求出楼层名
            getFloorName: getFloorNameByFid,

            // 设置楼层是否切换
            setIsSwitchFloor: function (bool) {
                bSwitchFloor = bool;
            },

            // 获取是否切换楼层
            getIsSwitchFloor: function () {
                return (function () {
                    return bSwitchFloor;
                })();
            },

            // 获取出口信息
            getOutInfo: function () {
                return outInfo;
            }
        };
    };

    module.exports = FloorListControl;
});
