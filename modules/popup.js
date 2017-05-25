/**
 * Created by ky on 17-5-24.
 */

define(function (require, exports, module) {

    var popUpViewhtml =
        '<div id="pop_backview" class="pop_backview">\
            <div class="pop_centerDiv">\
            <label style="font-size: 300%;font-weight: 800">手 动 标 记</label>\
                <br>\
                <br>\
            <label style="font-weight: 100; font-size: 200%; color: gray;"> 请输入您的爱车所停位置的车位号</label>\
                <br>\
                <br>\
                <div id="buttons" class="pop_buttons">\
                <br>\
                </div>\
                  <input id="inputcontent" type="text" class="pop_inputcontent" placeholder="请输入车位号 例如： 026">\
                    <br>\
                <label id="errormsg" class="pop_errormsg">输入有误，请重新输入您的车位号！</label>\
                <br>\
                <br>\
                <br>\
                <button id="confirm" class="pop_confirm">确定</button>\
            </div>\
        </div>';

    function popUpView(floorList) {

        var div = document.createElement('div')

        div.id = 'background'

        div.className = 'pop_background'

        div.innerHTML = popUpViewhtml

        var main = document.getElementById('page')

        main.appendChild(div)

        var buttons = document.getElementById('buttons')

        var br = document.createElement('br')

        buttons.appendChild(br)

        for (var i = 0; i < floorList.length; ++i) {

            var btn = document.createElement('div')

            btn.className = 'pop_floorBtn pop_floorBtn-normal'

            btn.id = 'floorId_' + floorList[i].id

            btn.innerText = floorList[i].name

            btn.addEventListener('click', onFloorBtnClick, false)

            buttons.appendChild(btn)
        }

        var confirm = document.getElementById('confirm')

        confirm.addEventListener('click', onConfirmBtnClick)

        function onFloorBtnClick(sender) {

            console.log(sender.target.id)
        }

        var _input = document.getElementById('inputcontent')

        var _errorMsg = document.getElementById('errormsg')

        _errorMsg.hidden = true

        _input.addEventListener('focus', onInputFocus)

        function onInputFocus() {

            _errorMsg.hidden = true

            console.log('onfocus')
        }

        function onConfirmBtnClick() {

            var str = _input.value

            if (!checkInputValid(str)) {

                _errorMsg.hidden = false
            }
            else {

                _errorMsg.hidden = true
            }
        }

        function checkInputValid(str) {


        }
    }

    module.exports = popUpView
});
