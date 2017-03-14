
define(function (require, exports, module) {

    var PositionDistance = require('./PositionDistance')

    var Position = require('./Position')

    var PathUtil = (function() {

        /**
         * 在线段集合中找到距离目标点最近的线段
         *
         * @param p目标点
         * @return 线段index
         */
        function findNearestLine(p, lines) {

            var index = 0;
            var minDes = Number.MAX_VALUE;
            for (var i = lines.length - 1; i >= 0; i--) {

                var des = p2lDes(p, lines[i]).getDistance();
                if (des < minDes) {
                    index = i;
                    minDes = des;
                }
            }

            return index;
        }

        /**
         * 二分查找点在有序集合中的位置下标
         *
         * @param pos待查找点
         * @param positions点集（有序）
         * @return pos在positions中的下标，若找不到返回-1
         */

         function compareTo(left, right) {

            if (left.x < right.x) {
                return -1;
            }
            else if (left.x > right.x) {
                return 1;
            }
            else if (left.y < right.y) {
                return -1;
            }
            else if (left.y > right.y) {
                return 1;
            }
            else {
                return 0;
            }
        }

        function findPositionIndex(pos, positions) {

            var left = 0;

            var right = positions.length - 1;

            var mid;

            while (left <= right) {

                mid = (left + right) >> 1;

                var t = compareTo(pos, positions[mid]);

                if (t < 0) {
                    right = mid - 1;

                }
                else if (t == 0) {

                    return mid;
                }
                else {

                    left = mid + 1;
                }
            }

            return -1;
        }

        /**
         * 求两点间欧氏距离
         *
         * @param a点A
         * @param b点B
         * @return AB间欧式距离
         */
        function p2pDes(a, b) {

            return Math.sqrt(Math.pow(a.getX() - b.getX(), 2) + Math.pow(a.getY() - b.getY(), 2));
        }

        /**
         * 求点到线段的最短距离及其端点
         *
         * @param p点
         * @param l线段
         * @return 最短距离及其端点
         */
        function p2lDes (p, l) {

            return dop2lDes(p.x, p.y, l.endPointOne.x, l.endPointOne.y,
                l.endPointTwo.x, l.endPointTwo.y);
        }

        /**
         * 求点到线段的最短距离及其端点
         *
         * @param x点横坐标
         * @param y点纵坐标
         * @param x1线段端点1横坐标
         * @param y1线段端点1纵坐标
         * @param x2线段端点2横坐标
         * @param y2线段端点2纵坐标
         * @return 最短距离及其端点
         */
        function dop2lDes(x, y, x1, y1, x2, y2) {

            var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
            if (cross <= 0)
                return getPositionDistance(x, y, x1, y1);
            var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
            if (cross >= d2)
                return getPositionDistance(x, y, x2, y2);
            var r = cross / d2;
            var px = x1 + (x2 - x1) * r;
            var py = y1 + (y2 - y1) * r;
            return getPositionDistance(x, y, px, py);
        }

        function getPositionDistance(x, y, px, py) {

            var result = new PositionDistance();
            var p = new Position();
            p.setX(px);
            p.setY(py);
            result.setPosition(p);
            result.setDistance(Math.sqrt((x - px) * (x - px) + (y - py) * (y - py)));
            return result;
        }

        return {
            findNearestLine:findNearestLine,
            findPositionIndex:findPositionIndex,
            p2pDes:p2pDes,
            p2lDes:p2lDes,
        }
    }())

    module.exports = PathUtil
})


