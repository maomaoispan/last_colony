/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-3-26
 * Time: 下午3:22
 * To change this template use File | Settings | File Templates.
 */

keys = {
    moveSpeed: 5,
    init: function () {
        KeyboardJS.on("a,left", function () {
            if (mouse.insideCanvas) {
                game.offsetX -= keys.moveSpeed;
                if (game.offsetX < 0) {
                    game.offsetX = 0;
                } else {
                    game.refreshBackground = true;
                    mouse.calculateGameCoordinates();
                }
            }
        });
        KeyboardJS.on("d,right", function () {
            if (mouse.insideCanvas) {
                game.offsetX += keys.moveSpeed;
                if (game.offsetX > game.currentMapImage.width - game.backgroundCanvas.width) {
                    game.offsetX = game.currentMapImage.width - game.backgroundCanvas.width;
                } else {
                    game.refreshBackground = true;
                    mouse.calculateGameCoordinates();
                }
            }
        });
        KeyboardJS.on("w,up", function () {
            if (mouse.insideCanvas) {
                game.offsetY -= keys.moveSpeed;
                if (game.offsetY < 0) {
                    game.offsetY = 0;
                } else {
                    game.refreshBackground = true;
                    mouse.calculateGameCoordinates();
                }
            }
        });
        KeyboardJS.on("s,down", function () {
            if (mouse.insideCanvas) {
                game.offsetY += keys.moveSpeed;
                if (game.offsetY > game.currentMapImage.height - game.backgroundCanvas.height) {
                    game.offsetY = game.currentMapImage.height - game.backgroundCanvas.height
                } else {
                    game.refreshBackground = true;
                    mouse.calculateGameCoordinates();
                }
            }
        })

    }
}
