/**
 * Created by Sorrow.X on 2016/9/22.
 */

onmessage = function(e) {
	var objArr = e.data;

    var html = '';

    for (var attr = 0; attr < objArr.length; attr++) {

        if (objArr[attr][5]) { //objArr[attr][5] 是否显示蓝色圆点
            html += '<span style="left:' + (objArr[attr][1] - 4) + 'px;top:' + (objArr[attr][2] - 3) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
        } else {
            html += '<span style="left:' + (objArr[attr][1] - objArr[attr][3] / 2 + 4) + 'px;top:' + (objArr[attr][2]) + 'px;"' + 'id=' + 'm_' + objArr[attr][0] + '>' + objArr[attr][0] + '</span>';
        }
    };

	//最后， 传递回主线程
	postMessage(html);
}