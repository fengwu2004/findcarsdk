/**
 * Created by yan on 14/03/2017.
 */
define(function (require, exports, module) {

    var idrRouter = require('../idrRouter')

    var RouteTest = function() {

        var p1 = {x:15, y:155, floorId:'14428254382890016'}

        var p2 = {x:770, y:269, floorId:'14428254382890016'}

        var router = new idrRouter(null, null)

        var carNavi = false

        var result = router.routerPath(p1, p2, carNavi)

        for (var i = 0; i < result.paths[0].position.length; ++i) {

            console.log(":" + result.paths[0].position[i].x + ', ' + result.paths[0].position[i].y)
        }

        console.log(result)
    }()

    module.exports = RouteTest
})