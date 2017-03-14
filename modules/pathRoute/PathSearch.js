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

        var floorPath = data.floorPath;// 楼层路径数据

        var footPath = data.footPath;// 人行贯通路径数据

        var carPath = data.carPath;// 车行贯通路径数据

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
        this.search = function(f1, p1, f2, p2, type, brief) {

            var result = null;

            if(brief == null)brief = searchBrief(f1, p1, f2, p2, type, false);

            if (brief != null) {

                result = new PathResult();

                result.setDistance(brief.distance);

                var paths = [];

                var f = brief.f;

                if (f == -1) {

                    var a = brief.a;

                    var b = brief.b;

                    var structure = type == 0 ? footPath : carPath;

                    var positions = structure.positions;

                    var matrix = structure.matrix;

                    var pro = b;

                    paths.add(searchFloorPath(searchBrief(f2, positions[b].getPos(), p2, type, true)));

                    while (a != matrix[a][b].proIndex) {

                        b = matrix[a][b].proIndex;

                        if (positions[b].getFloorIndex() == positions[pro].getFloorIndex()) {

                            var fp = searchFloorPath(searchBrief(positions[b].getFloorIndex(), positions[b].getPos(),
                                positions[pro].getPos(), type, true));

                            fp.setTypeId(positions[pro].getUnitTypeId());

                            paths.push(fp);
                        }

                        pro = b;
                    }

                    var fp = searchFloorPath(searchBrief(f1, p1, positions[a].getPos(), type, true));

                    fp.setTypeId(positions[a].getUnitTypeId());

                    paths.push(fp);

                    paths.reverse()
                } else {
                    paths.push(searchFloorPathSimple(brief));
                }
                result.paths = paths;
            }
            return result;
        }

        function searchFloorPathSimple(brief) {

            var f = brief.f;

            var a = brief.a

            var b = brief.b

            var fp = new FloorPath();

            fp.setFloorIndex(f);

            fp.setDistance(brief.getDistance());

            var list = [];

            if (brief.p2 != null)
                list.push(brief.p2);
            if (brief.pe != null)
                list.push(brief.p2);

            searchFloorPath(f, a, b, list);

            if (brief.ps != null)
                list.push(brief.ps);
            if (brief.p1 != null)
                list.push(brief.p1);

            list.reverse();

            fp.setPosition(list);

            return fp;
        }

        function searchFloorPath(f, a, b, list) {

            var positions = floorPath[f].positions;

            var matrix = floorPath[f].matrix;

            if (a == -1)
                return;

            list.push(positions[b]);

            while (b != matrix[a][b].proIndex) {

                b = matrix[a][b].proIndex;

                list.push(positions[b]);
            }
        }

        function searchBrief(f1, p1, f2, p2, type, absolutely) {

            if (f1 == f2 && !absolutely)
                return searchBrief(f1, p1, p2, type, true);

            var result = new PathBrief();

            result.f = -1;

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
                                var len = pb1.getDistance() + pb2.getDistance() + matrix[a][b].length;
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
            result.a = start;
            result.b = end;
            var pb1 = searchBrief(f1, p1, positions[start].getPos(), type, true);
            var pb2 = searchBrief(f2, positions[end].getPos(), p2, type, true);
            result.p1 = pb1.p1;
            result.ps = pb1.ps;
            result.p2 = pb2.p2;
            result.pe = pb2.pe;
            result.distance = length;
            return result;
        }

        function searchBrief(f, p1, p2, type, absolutely) {

            var result = new PathBrief();

            result.f = f;

            var length = 0;

            var positions = floorPath[f].positions;

            var lines = floorPath[f].lines;

            var matrix = floorPath[f].matrix;

            var l1 = PathUtil.findNearestLine(p1, lines);

            var l2 = PathUtil.findNearestLine(p2, lines);

            var s = PathUtil.p2lDes(p1, lines[l1]);

            var e = PathUtil.p2lDes(p2, lines[l2]);

            if (s.getDistance() > IGNOREDES) {
                length += s.distance;
                result.p1 = p1;
            }

            if (e.getDistance() > IGNOREDES) {
                length += e.distance;
                result.p2 = p2;
            }

            var ps = s.getPosition();

            var pe = e.getPosition();

            result.ps = ps;

            result.pe = pe;

            if (l1 != l2) {

                var pa = PathUtil.findPositionIndex(lines[l1].endPointOne, positions);

                var pb = PathUtil.findPositionIndex(lines[l1].endPointTwo, positions);

                var pc = PathUtil.findPositionIndex(lines[l2].endPointOne, positions);

                var pd = PathUtil.findPositionIndex(lines[l2].endPointTwo, positions);

                var sa = PathUtil.p2pDes(ps, positions[pa]);

                var sb = PathUtil.p2pDes(ps, positions[pb]);

                var sc = PathUtil.p2pDes(pe, positions[pc]);

                var sd = PathUtil.p2pDes(pe, positions[pd]);

                var len = Number.MAX_VALUE;

                var start = -1, end = -1;

                if (matrix[pa][pc] != null) {

                    len = sa + sc + matrix[pa][pc].length;

                    start = pa;
                    end = pc;
                }

                if (matrix[pa][pd] != null && sa + sd + matrix[pa][pd].length < len) {
                    len = sa + sd + matrix[pa][pd].length;
                    start = pa;
                    end = pd;
                }
                if (matrix[pb][pc] != null && sb + sc + matrix[pb][pc].length < len) {
                    len = sb + sc + matrix[pb][pc].length;
                    start = pb;
                    end = pc;
                }
                if (matrix[pb][pd] != null && sb + sd + matrix[pb][pd].length < len) {
                    len = sb + sd + matrix[pb][pd].length;
                    start = pb;
                    end = pd;
                }
                if (start != -1) {
                    result.a = start;
                    result.b = end;
                    if (PathUtil.p2pDes(ps, positions[start]) < 1)
                        result.ps = null;
                    if (PathUtil.p2pDes(pe, positions[end]) < 1)
                        result.pe = null;
                    length += len;
                } else
                    return absolutely ? null : searchBrief(f, p1, f, p2, type, true);
            } else {
                result.a = -1;
                length += PathUtil.p2pDes(ps, pe);
            }
            result.distance = length;
            return result;
        }
    }

    module.exports = PathSearch
})

