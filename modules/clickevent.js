/**
 * clickevent.js  处理点击事件
 *
 */


define(function(require, exports, module) {
	var gV = require('./globalvalue');

	var oZhizhen = document.querySelector('#zhizhen');
	oZhizhen && oZhizhen.addEventListener('click', zhizhenFn);
	function zhizhenFn() {
		console.log(gV);
	};

	//蓝牙未开启提示关闭
	var oUpperTipKown = document.querySelector('#upperTipKown');
	var oUpperTip = document.querySelector('#upperTip');
	oUpperTip && oUpperTip.addEventListener('click', upperTipFn);
	function upperTipFn() {
		oUpperTip.style.display = 'none';
	}

	
	

});