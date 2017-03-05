/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-3-19
 * Time: 下午4:55
 * To change this template use File | Settings | File Templates.
 */

var mouse = {
    // x,y coordinates of mouse relative to top left corner of canvas
    // 鼠标相对与 game-canvas 左上角的值
    x: 0,
    y: 0,
    // x,y coordinates of mouse relative to top left corner of game map
    // 鼠标相对与 game-map（地图) 左上角的偏移量
    gameX: 0,
    gameY: 0,
    // game grid x, y coordinates of mouse
    // 游戏网格的坐标(个数)
    gridX: 0,
    gridY: 0,

    //TODO:鼠标中键拖动-标识
    dragStartX: 0,
    dragStartY: 0,
    dragStopX: 0,
    dragStopY: 0,
    cursorRadius: 10,
    middleButtonPressed: false,

    //TODO:鼠标中间拖动地图
    dragMapStartX: 0,
    dragMapStartY: 0,
    dragMapStopX: 0,
    dragMapStopY: 0,
    dragMapDeltaX: 0,
    dragMapDeltaY: 0,

    // whether or not the left mouse button is currently pressed
    buttonPressed: false,

    // whether or not the player is dragging and selecting with the left mouse button pressed
    dragSelect: false,
    // whether or not the mouse is inside the canvas region
    insideCanvas: false,

    /*
     * 鼠标单击动作实现：包括左键选中、右键移动、攻击，警戒等
     */
    click: function (ev) {
        // Player clicked inside the canvas

        var clickedItem = this.itemUnderMouse();
        var shiftPressed = ev.shiftKey;
        if (ev.which == 1) { // Player left clicked 玩家单击左键
            if (game.deployBuilding) {
                if (game.canDeployBuilding) {
                    sidebar.finishDeployingBuilding();
                } else {
                    game.showMessage("system", "Warning! Cannot deploy building here.");
                }
                return;
            }

            if (clickedItem) {
                // Pressing shift adds to existing selection. If shift is not pressed, clear existing selection
                if (!shiftPressed) {
                    game.clearSelection();
                }
                game.selectItem(clickedItem, shiftPressed);
            }
        } else if (ev.which == 3) {
            // Player right clicked 右键单击，执行单元 攻击、警戒、移动 等动作。
            // Handle actions like attacking and movement of selected units
            if (game.deployBuilding) {
                sidebar.cancelDeployingBuilding();
                return;
            }

            var uids = [];
            //Player right-clicked on something
            // 玩家右键单击一个实体（非地面）
            if (clickedItem) {
                if (clickedItem.type != "terrain") { //当前选中的不能为 terrain-地形
                    if (clickedItem.team != game.team) {//Player right-clicked on an enemy item
                        // 玩家右键单击敌人精灵
                        // Identity selected items from players team that can attack
                        // 判断玩家中已被选中的项目是否有攻击能力
                        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                            var item = game.selectedItems[i];
                            if (item.team == game.team && item.canAttack) {
                                uids.push(item.uid);
                            }
                        }
                        // then command them to attack the clicked item
                        // 对于有攻击能力的精灵，命令它们向敌人发动攻击
                        if (uids.length > 0) {
                            game.sendCommand(uids, {type: "attack", toUid: clickedItem.uid})
                            sounds.play("acknowledge-attacking");
                        }
                    } else { //Player right-clicked on a friendly item
                        // 玩家单击队友精灵
                        // identify selected items from players team that can move
                        // 过滤出能移动的精灵，然后向它们发送警戒命令
                        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                            var item = game.selectedItems[i];
                            if (item.team == game.team && (item.type == "vehicles" || item.type == "aircraft")) {
                                uids.push(item.uid);
                            }
                        }
                        // Then command them to guard the clicked item
                        if (uids.length > 0) {
                            game.sendCommand(uids, {type: "guard", toUid: clickedItem.uid});
                            sounds.play("acknowledge-moving");
                        }

                    }
                } else if (clickedItem.name == "oilfield") {
                    // Player right clicked on an oilfield
                    // 玩家右键单击一个油田
                    // Identity the first selected harvester from players team (since only one can deploy at a time)
                    // 从玩家被选中队列中识别第一次选中的采矿车， 然后命令其采矿
                    for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                        var item = game.selectedItems[i];
                        if (item.team == game.team && (item.type == "vehicles" && item.name == "harvester")) {
                            uids.push(item.uid);
                            break;
                        }
                    }
                    // then command ti to deploy on the oilfield
                    if (uids.length > 0) {
                        game.sendCommand(uids, {type: "deploy", toUid: clickedItem.uid});
                        sounds.play("acknowledge-moving");
                    }
                }
            } else {
                // Player clicked on the ground
                // 玩家右键单击了 地面--默认为移动
                // identity selected items from players team that can move
                for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                    var item = game.selectedItems[i];
                    if (item.team == game.team && (item.type == "vehicles" || item.type == "aircraft")) {
                        uids.push(item.uid);
                    }
                }
                // then command them to move to the clicked location
                if (uids.length > 0) {
                    game.sendCommand(uids, {type: "move", to: {x: mouse.gameX / game.gridSize, y: mouse.gameY / game.gridSize}});
                    sounds.play("acknowledge-moving");
                }
            }
        }
    },

    /*
     * 返回当前被鼠标单击的一个 Item
     */
    itemUnderMouse: function () {
        if (fog.isPointOverFog(mouse.gameX, mouse.gameY)) {
            return;
        }
        for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
            if (item.type == "buildings" || item.type == "terrain") {
                if (item.lifeCode != "dead"
                    && item.x <= (mouse.gameX) / game.gridSize
                    && item.x >= (mouse.gameX - item.baseWidth) / game.gridSize
                    && item.y <= mouse.gameY / game.gridSize
                    && item.y >= (mouse.gameY - item.baseHeight) / game.gridSize
                    ) {
                    return item;
                }
            } else if (item.type == "aircraft") {
                if (item.lifeCode != "dead"
                    && Math.pow(item.x - mouse.gameX / game.gridSize, 2)
                    + Math.pow(item.y - (mouse.gameY + item.pixelShadowHeight) / game.gridSize, 2)
                    < Math.pow((item.radius) / game.gridSize, 2)
                    ) {
                    return item;
                }
            } else {
                if (item.lifeCode != "dead"
                    && Math.pow(item.x - mouse.gameX / game.gridSize, 2)
                    + Math.pow(item.y - mouse.gameY / game.gridSize, 2)
                    < Math.pow((item.radius) / game.gridSize, 2)
                    ) {
                    return item;
                }
            }
        }
    },

    /*
     * 绘制鼠标框选方块
     */
    draw: function () {
        if (this.dragSelect) {
            var x = Math.min(this.gameX, this.dragX);
            var y = Math.min(this.gameY, this.dragY);
            var width = Math.abs(this.gameX - this.dragX);
            var height = Math.abs(this.gameY - this.dragY);
            game.foregroundContext.strokeStyle = 'white';
            game.foregroundContext.strokeRect(x - game.offsetX, y - game.offsetY, width, height);
        }

        if (game.deployBuilding && game.placementGrid) {
            var buildingType = buildings.list[game.deployBuilding];
            var x = (this.gridX * game.gridSize) - game.offsetX;
            var y = (this.gridY * game.gridSize) - game.offsetY;
            for (var i = game.placementGrid.length - 1; i >= 0; i--) {
                for (var j = game.placementGrid[i].length - 1; j >= 0; j--) {
                    if (game.placementGrid[i][j]) {
                        game.foregroundContext.fillStyle = "rgba(0,0,255,0.3)";
                    } else {
                        game.foregroundContext.fillStyle = "rgba(255,0,0,0.3)";
                    }
                    game.foregroundContext.fillRect(x + j * game.gridSize, y + i * game.gridSize, game.gridSize, game.gridSize);
                }
            }
        }
    },

    /*
     * 绘制鼠标拖动轨迹
     */
    drawDirection: function () {
        if (mouse.middleButtonPressed) {
            var c = game.foregroundContext;
            c.strokeStyle = "yellow";
            c.beginPath();
            c.moveTo(mouse.dragStartX, mouse.dragStartY);
            c.lineTo(mouse.dragStopX, mouse.dragStopY);
            c.arc(mouse.dragStopX, mouse.dragStopY, mouse.cursorRadius, 0, 2 * Math.PI, true);
            c.lineTo(mouse.dragStopX - mouse.cursorRadius, mouse.dragStopY);
            c.moveTo(mouse.dragStopX, mouse.dragStopY + mouse.cursorRadius);
            c.lineTo(mouse.dragStopX, mouse.dragStopY - mouse.cursorRadius);
            c.stroke();
        }
    },

    /*
     * 计算坐标(mouse.gameX, mouse.gameY;mouse.gridX,mouse.gridY)
     */
    calculateGameCoordinates: function () {
        mouse.gameX = mouse.x + game.offsetX;
        mouse.gameY = mouse.y + game.offsetY;

        mouse.gridX = Math.floor((mouse.gameX) / game.gridSize);
        mouse.gridY = Math.floor((mouse.gameY) / game.gridSize);
    },

    /*
     * 设置鼠标相关属性，绑定事件，函数
     */
    init: function () {
        var $mouseMainCanvas = $('#main_Fore_Canvas');
        $mouseMainCanvas.mousemove(function (ev) {
            var offset = $mouseMainCanvas.offset();
            mouse.x = ev.pageX - offset.left;
            mouse.y = ev.pageY - offset.top;

            mouse.calculateGameCoordinates();

            if (mouse.buttonPressed) {
                if ((Math.abs(mouse.dragX - mouse.gameX) > 4 || Math.abs(mouse.dragY - mouse.gameY) > 4)) {
                    mouse.dragSelect = true;
                } else {
                    mouse.dragSelect = false;
                }
            }

            if (ev.which == 2) {
                mouse.middleButtonPressed = true;
                mouse.dragStopX = ev.pageX - $('#main_Fore_Canvas').offset().left;
                mouse.dragStopY = ev.pageY - $('#main_Fore_Canvas').offset().top;

                mouse.dragMapStopX = ev.pageX;
                mouse.dragMapStopY = ev.pageY;
                mouse.dragMapDeltaX = mouse.dragMapStopX - mouse.dragMapStartX;
                mouse.dragMapDeltaY = mouse.dragMapStopY - mouse.dragMapStartY;
                mouse.dragMapStartX = mouse.dragMapStopX;
                mouse.dragMapStartY = mouse.dragMapStopY;

                game.offsetX -= mouse.dragMapDeltaX;
                game.offsetY -= mouse.dragMapDeltaY;
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
            }

        });

        $mouseMainCanvas.click(function (ev) {
            mouse.click(ev);
            mouse.dragSelect = false;
            return false;
        });

        $mouseMainCanvas.mousedown(function (ev) {
            if (ev.which == 1) {
                mouse.buttonPressed = true;
                mouse.dragX = mouse.gameX;
                mouse.dragY = mouse.gameY;
                ev.preventDefault();
            }
            if (ev.which == 2) {
                mouse.deltaX = ev.pageX;
                mouse.deltaY = ev.pageY;

                mouse.dragStartX = ev.pageX - $('#main_Fore_Canvas').offset().left;
                mouse.dragStartY = ev.pageY - $('#main_Fore_Canvas').offset().top;

                mouse.dragMapStartX = ev.pageX;
                mouse.dragMapStartY = ev.pageY;
            }
            return false;
        });

        $mouseMainCanvas.bind('contextmenu', function (ev) {
            mouse.click(ev);
            return false;
        });

        $mouseMainCanvas.mouseup(function (ev) {
            var shiftPressed = ev.shiftKey;
            if (ev.which == 1) {
                // Left key was released
                if (mouse.dragSelect) {
                    if (!shiftPressed) {
                        // Shift key was not pressed
                        game.clearSelection();
                    }

                    var x1 = Math.min(mouse.gameX, mouse.dragX) / game.gridSize;
                    var y1 = Math.min(mouse.gameY, mouse.dragY) / game.gridSize;
                    var x2 = Math.max(mouse.gameX, mouse.dragX) / game.gridSize;
                    var y2 = Math.max(mouse.gameY, mouse.dragY) / game.gridSize;
                    for (var i = game.items.length - 1; i >= 0; i--) {
                        var item = game.items[i];
                        if (item.type != "buildings" && item.selectable
                            && item.team == game.team && x1 <= item.x && x2 >= item.x) {
                            if ((item.type == "vehicles" && y1 <= item.y && y2 >= item.y)
                                || (item.type == "aircraft"
                                && (y1 <= item.y - item.pixelShadowHeight / game.gridSize)
                                && (y2 >= item.y - item.pixelShadowHeight / game.gridSize))
                                ) {
                                game.selectItem(item, shiftPressed);
                            }
                        }
                    }
                }

                mouse.buttonPressed = false;
                mouse.dragSelect = false;
            }
            if (ev.which == 2) {
                mouse.middleButtonPressed = false;
            }
        });

        $mouseMainCanvas.mouseleave(function (ev) {
            mouse.insideCanvas = false;
        });

        $mouseMainCanvas.mouseenter(function (ev) {
            mouse.buttonPressed = false;
            mouse.insideCanvas = true;
        });


        // MicroMapCanvas Mouse Event
        var $mouseMicroCanvas = $("#micro_Fore_Canvas");
        $mouseMicroCanvas.click(function (ev) {
            var scale = game.currentMapImage.width / game.microMapForeCanvas.width;
            game.offsetX = (ev.pageX - game.foregroundCanvas.width / scale / 2 - game.microMapForeCanvas.getBoundingClientRect().left) * scale;
            game.offsetY = (ev.pageY
                - game.microMapForeCanvas.getBoundingClientRect().top
                - (game.microMapForeCanvas.height - game.currentMapImage.height / scale) / 2
                - game.foregroundCanvas.height / scale / 2)
                * scale;
            if (game.offsetX < 0) {
                game.offsetX = 0;

            }
            if (game.offsetY < 0) {
                game.offsetY = 0;
            }
            if (game.offsetX > game.currentMapImage.width - game.foregroundCanvas.width) {
                game.offsetX = game.currentMapImage.width - game.foregroundCanvas.width;

            }
            if (game.offsetY > game.currentMapImage.height - game.foregroundCanvas.height) {
                game.offsetY = game.currentMapImage.height - game.foregroundCanvas.height;
            }
            game.refreshBackground = true;
            mouse.calculateGameCoordinates();
        });

        $mouseMicroCanvas.bind('contextmenu', function (ev) {
            return false;
        });
    }

}
