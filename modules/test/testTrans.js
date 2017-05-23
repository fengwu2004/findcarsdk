/**
 * Created by yan on 07/03/2017.
 */
seajs.use(['http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/matrix3', 'http://wx.indoorun.com/indoorun/app/yanli/indoorun/sdk/modules/math'], function (matrix3, xMath) {

    var m = matrix3.create()

    console.log(m)

    xMath.translate(m, 100, 100)

    console.log(m)
});