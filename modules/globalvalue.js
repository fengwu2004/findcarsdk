/**
 * Created by 13569 on 2016/9/20.
 *  globalvalue.js  存放一些常用的全局变量
 *  挂载到 globalVar对象上去
 */

define(function(require, exports, module) {
    var globalVar = {
        box_w: 0,
        box_h: 0, //显示设备宽高

        vb_w: 0,
        vb_h: 0, //原始svg图片 viewBox 的宽高

        globalViewBow: 0,

        x: 0,
        y: 0,
        width: 0,
        height: 0, //当前图片起点xy坐标及宽高

        widthLevle: 0,
        heightLevel: 0, //显示设备宽高与当前图片大小的比例，widthLevel= box_w / width；

        ratio: 0,
        scale: 0,

        lastPX: 0,
        lastPY: 0, //即时偏移（屏幕坐标）

        dragStartPX: 0,
        dragStartPY: 0,

        transformStartScale: 0,
        transformStartCentX: 0,
        transformStartCentY: 0,
        transformStartPX: 0,
        transformStartPY: 0,

        lastSvgAngle: 0, //实时svg图片偏转的角度
        initAngle: undefined,  //初始90度
        eomagnetigcAngle: 0,    // 地磁偏转角
        deflectionAngle: 0,    // 后台获取的偏转值+地磁偏转值+用户旋转的值
        bPointIsRotate: false,    // 动态点是否旋转

        rotateStartSvgAngle: 0, //旋转动作开始时svg当时偏转的角度
        rotateStartSvgScale: 0, //旋转动作开始时svg缩放的比例
        rotateStartRotation: 0, //旋转动作开始时手指连线的角度
        rotateStartCenterX: 0, //旋转动作开始时手指连线中心点的x坐标（屏幕）
        rotateStartCenterY: 0, //旋转动作开始时手指连线中心点的y坐标（屏幕）
        rotateStartPX: 0, //旋转动作开始时的偏移
        rotateStartPY: 0,

        rotateStartCenterSvgX: 0, //旋转动作开始时手指连线中心点对应的svg坐标
        rotateStartCenterSvgY: 0,

        //记录当前时间类型及平均一次事件变化的量，当某次变化的量远大于平均值时，不予处理，并结束当前事件进程。
        //并且当某事件开始时间与上次事件结束时相差太近，也不予处理。相差 500ms
        MinEventStartPeriod: 500,
        curEventType: "", //当前事件过程中的事件类型
        lastEventType: "",//上次的事件类型
        lastEventTimet: 0,

        lastPanTimet: 0,
        avgPanDis: 0,
        panCount: 0,
        lastPanDeltaX: 0,
        lastPanDeltaY: 0,

        lastPinchTimet: 0,
        avgPinchScale: 0,
        pinchCount: 0,
        lastPinchScale: 1,

        lastRotateTimet: 0,
        avgRotateAngle: 0,
        avgRotateScale: 0,	//指两次事件之间的变化值的平均
        rotateScaleCount: 0,
        rotateAngleCount: 0,
        lastRotateAngle: 0,
        lastRotateScale: 1,

        bStopBackstage: true,    //拖或者旋转时，不响应后台每秒掉一次  (默认是响应的)
        oSelectUnit: null,    //点击地图选中的unit

        bGps: false,    //导航中，默认不导航

        staticGps: {    //静态导航中的一些变量
            iSvgStartX: 0,
            iSvgStartY: 0,
            iSvgEndX: 0,
            iSvgEndY: 0,
            startUnit: null,   //staticGps.startUnit
            endUnit: null
        },

        floorData: {    //楼层信息
            aAllFloor: [],    //所有楼层   floorData.aAllFloor
            len: 0,   //楼层个数
            oCurrFloor: null,    //当前楼层
            oSelectFloor: null,    //表示用户点击选择的楼层
            iSelectFlag: 0,    //被选择的楼层下标
            iCurrFlag: 0,    //当前楼层下标
        },

        bSFloorCount: 0,    // 超过5次就切换

        regionId: '',
        floorId: '',    //主要存储用户选择的楼层

        exhStr: '',    //存展会的信息

        floorMore: {    //多楼层静态导航存储信息      gV.floorMore.startObj       gV.floorMore.endObj    gV.floorMore.floorInfo
            startObj: {
                svgx: 0,
                svgy: 0,
                regionId: '',
                floorId: '',
                unit: null
            },
            endObj: {
                svgx: 0,
                svgy: 0,
                regionId: '',
                floorId: '',
                unit: null
            },
            floorInfo: []    //楼层向后请求的数据
        },

        floorDTMore: {    //多楼层动态导航存储信息     floorDTMore.endObj.regionId
            endObj: {
                svgx: 0,
                svgy: 0,
                regionId: '',
                floorId: '',
                unit: null
            }
        },

        facilities: {
            allSearchUnit: [],
            drawStartPoint: false,  //
            drawEndPoint: false,   //为true说明不能点击终点
            isPeopleType: false    //是否为人型(点击出口的时候用到)   gV.facilities.isPeopleType
        },


        //蓝牙模块的全模块变量
        bnData: {    // gV.bnData.bOpenBlueTooth
            bOpenBlueTooth: false,    // 默认未开启蓝牙
            data: {}
        },

        //hamm模块中的markSets副本(同步跟新)
        markSets : [],

        //maputils模块中的画线功能所需变量
        aLineSvgPos: [], //线的坐标集合
        floorInfo: [],    //楼层向后请求的数据
        aFloors: [],    //多楼层时画线的起始楼层floorId(没使用这个变量了)

        //用于配置
        configure: {
            appId: '',
            clientId: '',
            time: '',
            sign: '',
            wxAppId: '',
            wxTimestamp: '',
            wxNonceStr: '',
            wxSignature: '',
            sessionKey: ''
        },


        compass: {    //指北针
            id: '',
            isCompass: false,    //是否指北针旋转（默认）
        },

        bDynamicNag: false,    // 此变量是为了控制动态导航,手放开后又自动画一次线的bug,静态导航可以，但是动态导航不需要了

        bClearLine: true,    // 是否清空线(默认清空线)

        bShowRule: true,    // 是否显示比例尺


    }

    module.exports = globalVar;
});