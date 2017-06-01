define(function (require, exports, module) {
	"use strict";

    function IDRSvgPolyLine() {

    	var css = document.createElement('link')

        css.type = 'text/css';

        css.rel = 'stylesheet';

        css.href = modules + "IDRSvgPath/IDRSvgPolyLine.css";

        var header = document.querySelector("head");

        header.appendChild(css)

        var scale = 1.0; //比例尺

        var defaultLineWidth = 8.0; //路径线宽度

        var defaulDotWidth = 2 * Math.sqrt(2); //路线箭头的大小

        var defaultDotIndex = 10; //路线箭头点的间距

        var pathElement; //路线Dom对象

        var rootElement;

        var angleDom; //箭头集合

		/*====================获取比例尺=============================*/
        function getScale() {

            return scale;
        }

		/*====================放大=============================*/
        function addScale() {

            scale = scale * 1.1;

            console.log(scale);

            updateScale(scale);
        }

		/*=====================缩小============================*/
        function subScale() {

            scale = scale * (1.0 / 1.1);

            console.log(scale);

            updateScale(scale);
        }

		/*=====================更新比例尺===========================*/
        function updateScale(scale) {

            if (pathElement === undefined) {

                return
            }

            pathElement.style["stroke-width"] = defaultLineWidth * scale;

            defaulDotWidth = 2 * Math.sqrt(2) * scale;

            defaultDotIndex = 10 * scale;

            if (defaultDotIndex < 10) {

                defaultDotIndex = 10;
            } else if (defaultDotIndex > 15) {

                defaultDotIndex = 15;
            }

            defaultDotIndex = Math.ceil(defaultDotIndex);
        }

		/*=====================添加路线============================*/
        function addLine(parentNode, postionList) {

            pathElement = getLineObject(postionList);

            angleDom = getPolyLineObject(postionList);

            parentNode.appendChild(pathElement);

            for (var i = 0; i < angleDom.length; i++) {

                parentNode.appendChild(angleDom[i]);
            }
        }

        function updateLine(parentNode, postionList) {

            if (rootElement !== undefined && rootElement.parentNode.isEqualNode(parentNode)) {

                parentNode.removeChild(rootElement);

                rootElement = null
            }

            if (!postionList && postionList.length <= 1) {

                parentNode.removeChild(rootElement)

                return;
            }

            rootElement = document.createElementNS("http://www.w3.org/2000/svg", "g");

            rootElement.setAttribute('id', 'rootPath')

            pathElement = getLineObject(postionList);

            angleDom = getPolyLineObject(postionList);

            rootElement.appendChild(pathElement)

            parentNode.appendChild(rootElement);

            var markers = parentNode.getElementById('markers')

            parentNode.insertChildBefore(rootElement, markers)

            for (var i = 0; i < angleDom.length - 1; i++) {

                rootElement.appendChild(angleDom[i]);
            }
        }
1
		/*=====================初始化路线对象=======================*/
        function getLineObject(postionList) {

            if (postionList.length < 1) {

                return;
            }

            var pathStr = '';

            for (var i = 0; i <= postionList.length - 1; i++) {

                var pos = postionList[i];

                if (i == 0) {

                    pathStr = "M " + pos.x + " " + pos.y;
                }
                else {

                    pathStr = pathStr + " " + pos.x + " " + pos.y;
                }
            }

            var objE = document.createElementNS("http://www.w3.org/2000/svg", "path");

            objE.setAttribute("id", "IDRPath");

            objE.setAttribute("d", pathStr);

            return objE;
        }

		/*======================初始化路线箭头对象==================*/
        function getPolyLineObject(postionList) {

            if (postionList.length <= 1) {

                return;
            }

            var angleObjects = [];

            for (var i = 0; i <= postionList.length - 2; i++) {

                var currentPos = postionList[i];
                var nextPos = postionList[i + 1];

                var distance = getDistance(currentPos, nextPos);

                for (var j = 0; j <= distance; j++) {

                    if (currentPos.x == nextPos.x) {

                        var factor = 1

                        if (nextPos.y < currentPos.y) {

                            factor = -1
                        }

                        if (j % defaultDotIndex == 0 && j > 5) {
                            getXline(currentPos, nextPos, angleObjects, j, factor);
                        }

                    }
                    else if (currentPos.y == nextPos.y) {

                        var factor = 1

                        if (nextPos.x < currentPos.x) {

                            factor = -1
                        }

                        if (j % defaultDotIndex == 0 && j > 5) {
                            getYline(currentPos, nextPos, angleObjects, j, factor);
                        }

                    }
                    else {

                        var lineExpression = getLineExpression(currentPos, nextPos);

                        var index = defaultDotIndex / Math.sqrt(1 + lineExpression.k * lineExpression.k);

                        index = Math.ceil(index);

                        j = (currentPos.x < nextPos.x) ? j : j * -1;

                        if (j > 0) {

                            if (currentPos.x + j > nextPos.x) {
                                break;
                            }

                        } else {
                            if (currentPos.x + j > nextPos.x) {
                                break;
                            }
                        }

                        if (j % index == 0 && j > 5) {

                            var x = currentPos.x + j;

                            var polyObj = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

                            var y = lineExpression.k * x + lineExpression.b;

                            var a = x - defaulDotWidth / Math.sqrt(1 + lineExpression.k * lineExpression.k);

                            var b = lineExpression.k * a + lineExpression.b;

                            var x0 = (a - x) * lineExpression.cosA - (b - y) * lineExpression.sinA + x;
                            var y0 = (a - x) * lineExpression.sinA + (b - y) * lineExpression.cosA + y;

                            var x1 = (a - x) * lineExpression.cosA + (b - y) * lineExpression.sinA + x;
                            var y1 = -(a - x) * lineExpression.sinA + (b - y) * lineExpression.cosA + y;

                            var angleStr = x0 + " " + y0 + "," + x + " " + y + "," + x1 + " " + y1;

                            polyObj.setAttribute("id", "IDRPolyLine");

                            polyObj.setAttribute("points", angleStr);

                            angleObjects.push(polyObj);
                        }

                    }
                }
            }

            return angleObjects;
        }

		/*======================X坐标相同情况下的路线箭头============*/
        function getXline(currentPos, nextPos, angleObjects, j, factor) {

            var polyObj = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

            var x = currentPos.x;
            var y = currentPos.y + j * factor;

            var x1 = x - defaulDotWidth / Math.sqrt(2);
            var y1 = y - factor * defaulDotWidth / Math.sqrt(2);

            var x2 = x + defaulDotWidth / Math.sqrt(2);
            var y2 = y1;

            var angleStr = x1 + " " + y1 + "," + x + " " + y + "," + x2 + " " + y2;

            polyObj.setAttribute("id", "IDRPolyLine");

            polyObj.setAttribute("points", angleStr);

            angleObjects.push(polyObj);

        }

		/*======================Y坐标相同情况下的路线箭头============*/
        function getYline(currentPos, nextPos, angleObjects, j, factor) {

            var polyObj = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

            var x = currentPos.x + j * factor;
            var y = currentPos.y;

            var x1 = x - factor * defaulDotWidth / Math.sqrt(2);
            var y1 = y - defaulDotWidth / Math.sqrt(2);

            var x2 = x1;
            var y2 = y + defaulDotWidth / Math.sqrt(2);

            var angleStr = x1 + " " + y1 + "," + x + " " + y + "," + x2 + " " + y2;

            polyObj.setAttribute("id", "IDRPolyLine");

            polyObj.setAttribute("points", angleStr);

            angleObjects.push(polyObj);
        }

		/*======================求两点距离=========================*/
        function getDistance(currentPos, nextPos) {

            return Math.sqrt((currentPos.x - nextPos.x) * (currentPos.x - nextPos.x) + (currentPos.y - nextPos.y) * (currentPos.y - nextPos.y));
        }

		/*======================求路线方程=========================*/
        function getLineExpression(currentPos, nextPos) {

            var k = (currentPos.y - nextPos.y) / (currentPos.x - nextPos.x);

            var b = nextPos.y - k * nextPos.x;

            var cosA = Math.sqrt(2) / 2;

            var sinA = Math.sqrt(2) / 2;

            return {
                k: k,
                b: b,
                cosA: cosA,
                sinA: sinA
            }
        }

		/*======================移除路线===========================*/
        function removePath(father, childId) {

            var fatherObj = document.querySelector(father);

            var objs = fatherObj.childNodes;

            for (var i = objs.length - 1; i >= 0; i--) {

                fatherObj.removeChild(objs[i]);
            }
        }

		/*======================移除箭头===========================*/
        function removeDot(father, childId) {

            var fatherObj = document.querySelector(father);

            var objs = fatherObj.childNodes;

            for (var i = objs.length - 1; i >= 0; i--) {

                var obj = objs[i];

                if (obj.id == "IDRPolyLine") {

                    fatherObj.removeChild(objs[i]);
                }
            }
        }

        this.getScale = getScale
        this.addScale = addScale
        this.subScale = subScale
        this.addLine = addLine
        this.updateScale = updateScale
        this.updateLine = updateLine
        this.getLineObject = getLineObject
        this.getPolyLineObject = getPolyLineObject
        this.removePath = removePath
        this.removeDot = removeDot
    }

    module.exports = IDRSvgPolyLine
});
