/**
 * Created by yan on 14/03/2017.
 */
define(function (require, exports, module) {

    var idrRouter = require('../idrRouter')

    // var gv = require('../globalvalue')

    var gv = require('../idrCoreManager')

    var RouteTest = function() {

        var p1 = {x:15, y:155, floorId:'14557583851000004'}


        var p2 = {x:770, y:269, floorId:'14428254382890016'}

        var floorList = [
            {
                "collectLineList":[ ],
                "mapModifyTime":1489550481000,
                "floorIndex":0,
                "width":1120,
                "quyuList":[ ],
                "unitModifyTime":1489550481000,
                "recordTime":1458111565000,
                "id":"14428254382890016",
                "title":"F1",
                "height":530,
                "collectModifyTime":1489144711000,
                "name":"F1",
                "unitList":[ ],
                "modifyTime":1489550481000,
                "regionId":"14428254382730015"
            },
            {
                "collectLineList":[

                ],
                "mapModifyTime":1483498009000,
                "floorIndex":1,
                "width":752,
                "quyuList":[

                ],
                "groupNames":"null",
                "unitModifyTime":1489144483000,
                "recordTime":1455758385000,
                "id":"14557583851000004",
                "title":"F2",
                "height":373,
                "collectModifyTime":1479695320000,
                "name":"F2",
                "unitList":[

                ],
                "modifyTime":1489144483000,
                "regionId":"14428254382730015"
            }]

        var router = new idrRouter('14428254382730015', floorList, gv.clientId, gv.appId, gv.sessionKey)

        var carNavi = false

        router.init(function() {

            console.log('加载成功')
        })

        // router.routerPath(p1, p2, carNavi, function(result) {
        //
        //     for (var i = 0; i < result.paths[0].position.length; ++i) {
        //
        //         console.log(":" + result.paths[0].position[i].x + ', ' + result.paths[0].position[i].y)
        //     }
        //
        //     console.log(result)
        // })


    }()

    module.exports = RouteTest
})