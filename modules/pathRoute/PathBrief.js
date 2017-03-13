/**
 * 简略路径结果
 * 
 * @author Administrator
 *
 */

define(function (require, exports, module) {

    function PathBrief() {

        var _p1;//起点，当为null时表示起点与投影点过近，可忽略
        var _p2;//终点，当为null时表示起点与投影点过近，可忽略
        var _ps;//起点到最短路径的投影点
        var _pe;//终点到最短路径的投影点
        var _f;//对应楼层，-1表示人行贯通，-2表示车行贯通
        var _a;//邻接矩阵中的起点，若为-1表示ps、pe在一条线上无需中继点
        var _b;//邻接矩阵中的终点
        var _distance;//路径距离

        this.getP1 = function() {

            return _p1;
        }
        this.setP1 = function(p1) {

            _p1 = p1;
        }

        this.getP2 = function() {

            return p2;
        }

        this.setP2 = function(p2) {

            this.p2 = p2;
        }

        this.getPs = function() {

            return _ps;
        }

        this.setPs = function(ps) {

            _ps = ps;
        }

        this.getPe = function() {

            return _pe;
        }

        this.setPe = function(pe) {

            _pe = pe;
        }

        this.getF = function() {

            return _f;
        }

        this.setF = function(f) {

            _f = f;
        }

        this.getA = function() {

            return _a;
        }

        this.setA = function(a) {

            _a = a;
        }

        this.getB = function() {

            _b;
        }

        this.setB = function(b) {

            _b = b;
        }

        this.getDistance = function() {

            return _distance;
        }

        this.setDistance = function(distance) {

            _distance = distance;
        }

    }

    module.exports = PathBrief
})

