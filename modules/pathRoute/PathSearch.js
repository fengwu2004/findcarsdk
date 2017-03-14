/**
 * 路径搜索
 * 
 * @author Administrator
 *
 */

define(function (require, exports, module) {

	var PathUtil = require('./PathUtil')

	var PathResult = require('./PathResult')

	var PathBrief = require('./PathBrief')

	var FloorPath = require('./FloorPath')

    function PathSearch(data) {

        var IGNOREDES = 10;// 忽略距离，到路线投影点距离小于这一值的起始结束点将被忽略

        var floorPath = data['floorPath'];// 楼层路径数据

        var footPath = data['footPath'];// 人行贯通路径数据

        var carPath = data['carPath'];// 车行贯通路径数据

        /**
         * 搜索从f1层p1点到f2层p2点的最短路径（完整信息）
         *
         * @param f1起点楼层下标
         * @param p1起点坐标
         * @param f2终点楼层下标
         * @param p2终点坐标
         * @param type贯通类型，0人行，1车行
         * @param brief简略信息，若有可减少计算量，若为null则自动计算
         * @return 最短路径结果集
         */
        var search = function(f1, p1, f2, p2, type, brief) {

            var result = null;

            if(brief == null)brief = searchBrief(f1, p1, f2, p2, type, false);

            if (brief != null) {

                result = new PathResult();

                result.setDistance(brief.getDistance());

                var paths = [];

                var f = brief.getF();

                if (f == -1) {

                    var a = brief.getA();

                    var b = brief.getB();

                    var structure = type == 0 ? footPath : carPath;

                    var positions = structure.getPositions();

                    var matrix = structure.getMatrix();

                    var pro = b;

                    paths.add(searchFloorPath(searchBrief(f2, positions[b].getPos(), p2, type, true)));

                    while (a != matrix[a][b].getProIndex()) {

                        b = matrix[a][b].getProIndex();

                        if (positions[b].getFloorIndex() == positions[pro].getFloorIndex()) {

                            var fp = searchFloorPath(searchBrief(positions[b].getFloorIndex(), positions[b].getPos(),
                                positions[pro].getPos(), type, true));

                            fp.setTypeId(positions[pro].getUnitTypeId());

                            paths.add(fp);
                        }

                        pro = b;
                    }

                    var fp = searchFloorPath(searchBrief(f1, p1, positions[a].getPos(), type, true));

                    fp.setTypeId(positions[a].getUnitTypeId());

                    paths.add(fp);

                    paths.reverse()
                } else {
                    paths.add(searchFloorPath(brief));
                }
                result.setPaths(paths);
            }
            return result;
        }

        /**
         * 同楼层路线搜索，根据简略信息补全完整信息
         *
         * @param brief简略信息
         * @return 完整路径搜索结果
         */
        function searchFloorPath(brief) {

            var f = brief.getF();

            var a = brief.getA();

            var b = brief.getB();

            var fp = new FloorPath();

            fp.setFloorIndex(f);

            fp.setDistance(brief.getDistance());

            var list = [];

            if (brief.getP2() != null)
                list.push(brief.getP2());
            if (brief.getPe() != null)
                list.push(brief.getPe());

            searchFloorPath(f, a, b, list);

            if (brief.getPs() != null)
                list.push(brief.getPs());
            if (brief.getP1() != null)
                list.push(brief.getP1());

            list.reverse();

            fp.setPosition(list);

            return fp;
        }

        /**
         * 同楼层路径搜索，搜索结果存储到list中
         *
         * @param f楼层
         * @param a矩阵起点下标
         * @param b矩阵终点下标
         * @param list存储路径点的集合
         */
        function searchFloorPath(f, a, b, list) {

            var positions = floorPath[f].getPositions();

            var matrix = floorPath[f].getMatrix();

            if (a == -1)
                return;

            list.push(positions[b]);

            while (b != matrix[a][b].getProIndex()) {

                b = matrix[a][b].getProIndex();

                list.push(positions[b]);
            }
        }

        /**
         * 跨楼层搜索从f1层p1点到f2层p2点的最短路径（简略信息）
         *
         * @param f1起点楼层下标
         * @param p1起点坐标
         * @param f2终点楼层下标
         * @param p2终点坐标
         * @param type贯通类型，0人行，1车行
         * @param absolutely绝对，true时强制使用跨楼层模式搜索，false时f1、f2相同会自动切换到同楼层搜索模式
         * @return 最短路径结果集（简略）
         */
        function searchBrief(f1, p1, f2, p2, type, absolutely) {

            if (f1 == f2 && !absolutely)
                return searchBrief(f1, p1, p2, type, true);

            var result = new PathBrief();

            result.setF(-1);

            var length = Number.MAX_VALUE;
            var structure = type == 0 ? footPath : carPath;
            var positions = structure.getPositions();
            var matrix = structure.getMatrix();
            var n = positions.length;
            var start = -1, end = -1;
            for (var a = 0; a < n; a++) {
                if (positions[a].getFloorIndex() == f1)
                    for (var b = 0; b < n; b++) {
                        if (positions[b].getFloorIndex() == f2 && matrix[a][b] != null) {
                            var pb1 = searchBrief(f1, p1, positions[a].getPos(), type, true);
                            var pb2 = searchBrief(f2, positions[b].getPos(), p2, type, true);
                            if (pb1 != null && pb2 != null) {
                                var len = pb1.getDistance() + pb2.getDistance() + matrix[a][b].getLength();
                                if (len < length) {
                                    length = len;
                                    start = a;
                                    end = b;
                                }
                            }
                        }
                    }
            }
            if (start == -1)
                return null;
            result.setA(start);
            result.setB(end);
            var pb1 = searchBrief(f1, p1, positions[start].getPos(), type, true);
            var pb2 = searchBrief(f2, positions[end].getPos(), p2, type, true);
            result.setP1(pb1.getP1());
            result.setPs(pb1.getPs());
            result.setP2(pb2.getP2());
            result.setPe(pb2.getPe());
            result.setDistance(length);
            return result;
        }

        /**
         * 同楼层搜索f层从p1点到p2点的最短路径（简略信息）
         *
         * @param f楼层下标
         * @param p1起点坐标
         * @param p2终点坐标
         * @param type贯通类型，0人行，1车行
         * @param absolutely绝对，true时强制使用同楼层模式搜索，false时若无解会自动切换到跨楼层搜索模式
         * @return 最短路径结果集（简略）
         */
        function searchBrief(f, p1, p2, type, absolutely) {

            var result = new PathBrief();

            result.setF(f);

            var length = 0;

            var positions = floorPath[f].getPositions();

            var lines = floorPath[f].getLines();

            var matrix = floorPath[f].getMatrix();

            var l1 = PathUtil.findNearestLine(p1, lines);

            var l2 = PathUtil.findNearestLine(p2, lines);

            var s = PathUtil.p2lDes(p1, lines[l1]);

            var e = PathUtil.p2lDes(p2, lines[l2]);

            if (s.getDistance() > IGNOREDES) {
                length += s.getDistance();
                result.setP1(p1);
            }

            if (e.getDistance() > IGNOREDES) {
                length += e.getDistance();
                result.setP2(p2);
            }

            var ps = s.getPosition();

            var pe = e.getPosition();

            result.setPs(ps);

            result.setPe(pe);

            if (l1 != l2) {

                var pa = PathUtil.findPositionIndex(lines[l1].getEndPointOne(), positions);

                var pb = PathUtil.findPositionIndex(lines[l1].getEndPointTwo(), positions);

                var pc = PathUtil.findPositionIndex(lines[l2].getEndPointOne(), positions);

                var pd = PathUtil.findPositionIndex(lines[l2].getEndPointTwo(), positions);

                var sa = PathUtil.p2pDes(ps, positions[pa]);

                var sb = PathUtil.p2pDes(ps, positions[pb]);

                var sc = PathUtil.p2pDes(pe, positions[pc]);

                var sd = PathUtil.p2pDes(pe, positions[pd]);

                var len = Number.MAX_VALUE;

                var start = -1, end = -1;

                if (matrix[pa][pc] != null) {

                    len = sa + sc + matrix[pa][pc].getLength();

                    start = pa;
                    end = pc;
                }

                if (matrix[pa][pd] != null && sa + sd + matrix[pa][pd].getLength() < len) {
                    len = sa + sd + matrix[pa][pd].getLength();
                    start = pa;
                    end = pd;
                }
                if (matrix[pb][pc] != null && sb + sc + matrix[pb][pc].getLength() < len) {
                    len = sb + sc + matrix[pb][pc].getLength();
                    start = pb;
                    end = pc;
                }
                if (matrix[pb][pd] != null && sb + sd + matrix[pb][pd].getLength() < len) {
                    len = sb + sd + matrix[pb][pd].getLength();
                    start = pb;
                    end = pd;
                }
                if (start != -1) {
                    result.setA(start);
                    result.setB(end);
                    if (PathUtil.p2pDes(ps, positions[start]) < 1)
                        result.setPs(null);
                    if (PathUtil.p2pDes(pe, positions[end]) < 1)
                        result.setPe(null);
                    length += len;
                } else
                    return absolutely ? null : searchBrief(f, p1, f, p2, type, true);
            } else {
                result.setA(-1);
                length += PathUtil.p2pDes(ps, pe);
            }
            result.setDistance(length);
            return result;
        }
    }

    module.exports = PathSearch
})

