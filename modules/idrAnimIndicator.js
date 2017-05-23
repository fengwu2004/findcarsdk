/**
 * Created by yan on 07/03/2017.
 */
define(function (require, exports, module) {

    var idrIndicator = (function() {

        var instance;

        var bFlash = true;    //  true表示可以进行波动

        function init() {

            var oWave = jsLib('#point').toDom(),

                oWaveObj = jsLib('#point'),

                oImg = jsLib('#point').find('img').toDom();

            function recovery() {

                var left = oWaveObj.css('left');

                var top = oWaveObj.css('top');

                oWave.className = '';

                oWave.className = 'repbox';

                oWave.style.left = left + 'px';

                oWave.style.top = top + 'px';

                oWave.style.opacity = 1;

                oWave.style.display = 'block';
            }

            return {

                setDomStyle: function(x, y) {    //设置样式

                    var left = x;

                    var top = y;

                    oWave.className = '';
                    oWave.className = 'pbox';
                    oWave.style.left = left + 'px';
                    oWave.style.top = top + 'px';
                    oImg.className = '';
                    oImg.className = 'pcontent';

                },

                move: function() {    //雷达波
                    waveing();
                    function waveing() {
                        jsLib.move.linear([0, 100], 500, function(v){
                            bFlash = false;
                            var iSpeed = Math.ceil(v);
                            if (iSpeed % 2 == 0) {
                                oWave.style.width = iSpeed + 'px';
                                oWave.style.height = iSpeed + 'px';

                                var opacity = iSpeed/100;
                                var op = 1 - opacity;
                                oWave.style.opacity = op;
                            }
                        }, function() {
                            bFlash = true;
                            recovery();
                            // oWaveObj.show();
                        });
                    }
                },

                state: function() {
                    return bFlash;
                },

                domRotate: function(rotate) {    // 动态点旋转
                    if (rotate === 'rotate') {
                        gV.bPointIsRotate = true;
                    } else {
                        gV.bPointIsRotate = false;
                    }
                },

                recoveryStyle: function() {
                    recovery();
                }
            };
        };

        return {

            getInstance: function() {

                if (!instance) {

                    instance = init();
                }

                return instance;
            }
        };
    }());
});