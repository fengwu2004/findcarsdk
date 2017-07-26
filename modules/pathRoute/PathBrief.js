/**
 * 简略路径结果
 *
 * @author Administrator
 *
 */

function PathBrief() {
    
    this.p1 = null;//起点，当为null时表示起点与投影点过近，可忽略
    this.p2 = null;//终点，当为null时表示起点与投影点过近，可忽略
    this.ps = null;//起点到最短路径的投影点
    this.pe = null;//终点到最短路径的投影点
    this.f = null;//对应楼层，-1表示人行贯通，-2表示车行贯通
    this.a = null;//邻接矩阵中的起点，若为-1表示ps、pe在一条线上无需中继点
    this.b = null;//邻接矩阵中的终点
    this.distance = null;//路径距离
}

export { PathBrief as default }

