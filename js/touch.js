/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-4-27
 * Time: 下午4:08
 * To change this template use File | Settings | File Templates.
 */
var touch = {
    //TODO:鼠标中间拖动地图
    touch_Map_StartX: 0,
    touch_Map_StartY: 0,
    touch_Map_StopX: 0,
    touch_Map_StopY: 0,
    touch_Map_DeltaX: 0,
    touch_Map_DeltaY: 0,
    init: function () {
        var canvas = document.getElementById("main_Fore_Canvas");

        canvas.addEventListener("touchstart", function (event) {
            if (event.targetTouches.length == 1) {
//                event.preventDefault(); //阻止浏览器默认事件，重要
                var currentTouch = event.targetTouches[0];
                touch.touch_Map_StartX = currentTouch.pageX;
                touch.touch_Map_StartY = currentTouch.pageY
//                console.log("开始点:  " + touch.touch_Map_StartX + "   " + touch.touch_Map_StartY);
            }
        },false)

        canvas.addEventListener("touchmove", function (event) {
            if (event.targetTouches.length == 1) {// 如果这个元素的位置内只有一个手指的话
                event.preventDefault(); //阻止浏览器默认事件，重要
                var currentTouch = event.targetTouches[0];
                touch.touch_Map_StopX = currentTouch.pageX;
                touch.touch_Map_StopY = currentTouch.pageY;
                touch.touch_Map_DeltaX = touch.touch_Map_StopX - touch.touch_Map_StartX;
                touch.touch_Map_DeltaY = touch.touch_Map_StopY - touch.touch_Map_StartY;
                touch.touch_Map_StartX = touch.touch_Map_StopX;
                touch.touch_Map_StartY = touch.touch_Map_StopY;

                game.offsetX -= touch.touch_Map_DeltaX;
                game.offsetY -= touch.touch_Map_DeltaY;
                if (game.offsetX < 0) {
                    game.offsetX = 0;
                }
                if (game.offsetX > game.currentMapImage.width - game.backgroundCanvas.width) {
                    game.offsetX = game.currentMapImage.width - game.backgroundCanvas.width;
                }
                if (game.offsetY < 0) {
                    game.offsetY = 0;
                }
                if (game.offsetY > game.currentMapImage.height - game.backgroundCanvas.height) {
                    game.offsetY = game.currentMapImage.height - game.backgroundCanvas.height
                }
                game.refreshBackground = true;
                mouse.calculateGameCoordinates();


//                console.log("变化量:  " + touch.touch_Map_DeltaX + "   " + touch.touch_Map_DeltaY);
            }
        }, false);
    }
}
