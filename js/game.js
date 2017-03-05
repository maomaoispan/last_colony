/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-3-19
 * Time: 下午4:55
 * To change this template use File | Settings | File Templates.
 */

/*
 游戏入口
 */
//$(window).load(function () {
//    game.init();
//})

var game = {
    start:false,

    /**
     * Start load assets
     * 1.音频初始化
     * 2.鼠标初始化
     * 3.准备游戏主要画布
     */
    init: function () {
        loader.init();
        mouse.init();
        touch.init();
//        keys.init();
//        sidebar.init();
//        sounds.init();


//        $('.gamelayer').hide();
//        $('#gamestartscreen').show();

        game.backgroundCanvas = document.getElementById('main_Back_Canvas');
        game.backgrounContext = game.backgroundCanvas.getContext('2d');

        game.foregroundCanvas = document.getElementById('main_Fore_Canvas');
        game.foregroundContext = game.foregroundCanvas.getContext('2d');

        game.microMapBackCanvas = document.getElementById('micro_Back_Canvas');
        game.microMapBackContext = game.microMapBackCanvas.getContext('2d');

        game.microMapForeCanvas = document.getElementById('micro_Fore_Canvas');
        game.microMapForeContext = game.microMapForeCanvas.getContext('2d');

        game.set_Game_Window_Size();

    },

    scale: 1,

    set_Game_Window_Size: function () {
        game.refreshBackground = true;

//        console.log("宽度:" + game.canvasWidth + "  高度:" + game.canvasHeight);
        document.getElementById('main_Back_Canvas').width = document.getElementById('main_Back_Canvas').clientWidth * game.scale;
        document.getElementById('main_Back_Canvas').height = document.getElementById('main_Back_Canvas').clientHeight * game.scale;

        document.getElementById('main_Fore_Canvas').width = document.getElementById('main_Fore_Canvas').clientWidth * game.scale;
        document.getElementById('main_Fore_Canvas').height = document.getElementById('main_Fore_Canvas').clientHeight * game.scale;

        document.getElementById('micro_Back_Canvas').width = document.getElementById('micro_Back_Canvas').clientWidth * game.scale;
        document.getElementById('micro_Back_Canvas').height = document.getElementById('micro_Back_Canvas').clientHeight * game.scale;

        document.getElementById('micro_Fore_Canvas').width = document.getElementById('micro_Fore_Canvas').clientWidth * game.scale;
        document.getElementById('micro_Fore_Canvas').height = document.getElementById('micro_Fore_Canvas').clientHeight * game.scale;

        game.canvasWidth = document.getElementById('main_Back_Canvas').width;
        game.canvasHeight = document.getElementById('main_Back_Canvas').height;
//        console.log("宽度:" + game.canvasWidth + "  高度:" + game.canvasHeight);

//        console.log("game.foregroundCanvas.width" + game.foregroundCanvas.width + "$('#main_Fore_Canvas')" + $("#main_Fore_Canvas").width());
    },

    /**
     * 开启游戏，动画开始
     */
    start: function () {
//        $('.gamelayer').hide();
//        $('#gameinterfacescreen').show();
        //游戏是否正在运行
        game.running = true;
        //是否需要刷新“游戏背景地图”
        game.refreshBackground = true;

        game.drawingLoop();

//        $('#gamemessages').html("");
        // Initialize All Game Triggers
        for (var i = game.currentLevel.triggers.length - 1; i >= 0; i--) {
            game.initTrigger(game.currentLevel.triggers[i]);
        }
    },

    // The map is broken into squre tiles of this size (20 pixels x 20 pixels
    // 地图的网格大小：20像素
    gridSize: 20,

    // Store whether or not the background moved and needs to be redrawn
    // 背景是否被移动并且需要重新绘制
    backgroundChanged: true,

    // A control loop that rends at a fixed period of time
    // 100 milliseconds or 10 times a second
    // 1秒钟循环10次，或者说没100毫秒循环一次
    animationTimeout: 100,

    // X & Y panning offsets for the map
    // 地图的 X Y 各方向的平移量
    offsetX: 0,
    offsetY: 0,
    // Distance from edge of canvas at which panning start
    // 鼠标位于 canvas 边缘60像素以内开始平移
    panningThreshold: 30,
    // Pixels to pan every drawing loop
    // 每循环一次平移10个像素
    panningSpeed: 5,

    /*
     处理“地图平移”所需数据，包括判断game.offsetX,game.offsetY,计算坐标系
     */
    handlePanning: function () {
        // do not pan if mouse leaves the canvas
        // 如果鼠标离开"地图canvas"则不进行平移
        if (!mouse.insideCanvas) {
            return;
        }


        if (mouse.x <= game.panningThreshold) {
            if (game.offsetX >= game.panningSpeed) {
                game.refreshBackground = true;
                game.offsetX -= game.panningSpeed;
            }
        } else if (mouse.x >= game.canvasWidth - game.panningThreshold) {
            if (game.offsetX + game.canvasWidth + game.panningSpeed <= game.currentMapImage.width) {
                game.refreshBackground = true;
                game.offsetX += game.panningSpeed;
            }
        }

        if (mouse.y <= game.panningThreshold) {
            if (game.offsetY >= game.panningSpeed) {
                game.refreshBackground = true;
                game.offsetY -= game.panningSpeed;
            }
        } else if (mouse.y >= game.canvasHeight - game.panningThreshold) {
            if (game.offsetY + game.canvasHeight + game.panningSpeed <= game.currentMapImage.height) {
                game.refreshBackground = true;
                game.offsetY += game.panningSpeed;
            }
        }

        //如果地图背景发生变化，则重新计算坐标
        if (game.refreshBackground) {
            //Update mouse game coordinates based on game offsets
            mouse.calculateGameCoordinates();
        }
    },


    /*
     * 绘制每个 “实体”的动画，并排序
     */
    animationLoop: function () {
        // Animate the sidebar
        sidebar.animate();

        // Process orders for any item that handles it
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].processOrders) {
                game.items[i].processOrders();
            }
        }

        // Animate each of the elements within the game
        for (var i = game.items.length - 1; i >= 0; i--) {
            game.items[i].animate();
        }

        // Sort game items into a sortedItems array based on their x,y coordinates
        // 根据游戏画面里所有“实体”的 x、y 坐标，从小到大对其进行排序，并保存在 sortedItems 中
        game.sortedItems = $.extend([], game.items);
        game.sortedItems.sort(function (a, b) {
            return b.y - a.y + ((b.y == a.y) ? (a.x - b.x) : 0);
        })


        fog.animate();

        // Save the time that the last animation loop completed
        game.lastAnimationTime = (new Date()).getTime();


    },

    /*
     * 负责循环绘制游戏画面，直到游戏结束。
     * 计算坐标、绘制地图、清除并重新绘制前台元素、绘制鼠标框选方框等
     */
    drawingLoop: function () {
//        if (game.canvasWidth != document.getElementById('main_Back_Canvas').clientWidth) {
        game.set_Game_Window_Size();
//        }
//
        // Handle Panning the Map
//        game.handlePanning();

        // Check the time since the game was animated and calculate a linear interpolation factor (-1 to 0)
        // Since drawing will happen more often than animation
        game.lastDrawTime = (new Date()).getTime();
        if (game.lastAnimationTime) {
            game.drawingInterpolationFactor = (game.lastDrawTime - game.lastAnimationTime) / game.animationTimeout - 1;
            if (game.drawingInterpolationFactor > 0) {// No point interpolating beyond the next animation loop...
                game.drawingInterpolationFactor = 0;
            } else {
                game.drawingInterpolationFactor = -1;
            }
        }

        // Since drawing the background map is a fairly large operation
        // We only redraw the background if it changes (due to panning)
        // 如果地图发生偏移（game.offsetX game.offsetY)，则重新绘制新的地图区域
        if (game.refreshBackground && game.canvasWidth != 0 && game.canvasHeight != 0) {

            game.backgrounContext.drawImage(game.currentMapImage,
                game.offsetX, game.offsetY, game.canvasWidth, game.canvasHeight,
                0, 0, game.canvasWidth, game.canvasHeight);

            /*       console.log(" | " + game.offsetX + " | " + game.offsetY + " | " + game.canvasWidth + " | " + game.canvasHeight
             + " | " + 0 + " | " + 0 + " | " + game.canvasWidth + " | " + game.canvasHeight);*/
            //TODO:DEBUG
            //game.currentMapPassableGridDrawing();

            game.refreshBackground = false;
        }

        // Clear the foreground canvas
        // 清除前台画布
        game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight);

        // Start drawing the foreground elements
        // 开始重新绘制前台元素
        for (var i = game.sortedItems.length - 1; i >= 0; i--) {
            if (game.sortedItems[i].type != "bullets")
                game.sortedItems[i].draw();
        }

        // Draw the bullets on top of all the other elements
        for (var i = game.bullets.length - 1; i >= 0; i--) {
            game.bullets[i].draw();
        }

        fog.draw();

        // Draw the mouse
        mouse.draw();

        mouse.drawDirection();

        // Call the drawing loop for the next frame using request animation frame
        if (game.running) {
            requestAnimationFrame(game.drawingLoop);

        }


        // MicroMap
        game.drawMicroMap();
    },

    /*
     * 游戏恢复初始化
     */
    resetArrays: function () {
        game.counter = 1;
        game.items = [];
        game.sortedItems = [];
        game.buildings = [];
        game.vehicles = [];
        game.aircraft = [];
        game.terrain = [];
        game.triggeredEvents = [];
        game.selectedItems = [];
        game.sortedItems = [];
        game.bullets = []
    },

    /*
     * 向游戏中添加一个“实体”，并设置一个唯一标示符 uid
     */
    add: function (itemDetails) {
        //Set a unique id for the item
        if (!itemDetails.uid) {
            itemDetails.uid = game.counter++;
        }

        var item = window[itemDetails.type].add(itemDetails);

        // Add the item to the items array
        game.items.push(item);
        // Add the item to the type specific array
        game[item.type].push(item);

        // Reset currentMapPassableGrid
        if (item.type == "buildings" || item.type == "terrain") {
            game.currentMapPassableGrid = undefined;
        }
        if (item.type == "bullets") {
            sounds.play(item.name);
        }
        return item;
        // todo
        //this.rebuildBuildableGrid();
    },

    /*
     *从游戏中删除一个“实体”
     */
    remove: function (item) {

        // Unselect item if it is selected
        item.selected = false;
        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
            if (game.selectedItems[i].uid == item.uid) {
                game.selectedItems.splice(i, 1);
                break;
            }
        }

        // Remove item from the items array
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].uid == item.uid) {
                game.items.splice(i, 1);
                break;
            }
        }

        // Remove items from the type specific array
        for (var i = game[item.type].length - 1; i >= 0; i--) {
            if (game[item.type][i].uid == item.uid) {
            }
            game[item.type].splice(i, 1);
            break;
        }

        // Reset currentMapPassableGrid
        if (item.type == "buildings" || item.type == "terrain") {
            game.currentMapPassableGrid = undefined;
        }

        // todo
        //this.rebuildBuildableGrid();
    },

    /* Selection Related Code */
    selectionBorderColor: "rgba(255,255,0,0.5)",
    selectionFillColor: "rgba(255,215,0,0.2)",
    healthBarBorderColor: "rgba(0,0,0,0.8)",
    healthBarHealthyFillColor: "rgba(0,255,0,0.5)",
    healthBarDamagedFillColor: "rgba(255,0,0,0.5)",
    lifeBarHeight: 5,

    /*
     * 清空已选中的实体
     */
    clearSelection: function () {
        while (game.selectedItems.length > 0) {
            game.selectedItems.pop().selected = false;
        }
    },

    /*
     * 选择实体
     */
    selectItem: function (item, shiftPressed) {
        // Pressing shift and clicking on a selected item will deselect it
        if (shiftPressed && item.selected) {
            // deselect item
            item.selected = false;
            for (var i = game.selectedItems.length - 1; i >= 0; i--) {
                if (game.selectedItems[i].uid == item.uid) {
                    game.selectedItems.splice(i, 1);
                    break;
                }
            }
            return;
        }
        if (item.selectable && !item.selected) {
            item.selected = true;
            game.selectedItems.push(item);
        }
    },

    /* Send command to either singlePlayer or multiPlayer object
     * 向“单击模式”或"多人模式"发送"指令"
     */
    sendCommand: function (/*当前被选中的item-uid*/uids, /*包含具体执行的命令*/details) {
        if (game.type == "singleplayer") {
            singleplayer.sendCommand(uids, details);
        } else {
            multiplayer.sendCommand(uids, details);
        }
    },

    /*
     * 根据 uid 从整个游戏 items 中获取一个 item
     */
    getItemByUid: function (uid) {
        for (var i = game.items.length - 1; i >= 0; i--) {
            if (game.items[i].uid == uid) {
                return game.items[i];
            }
        }
    },

    /*
     * Receive command from singlePlayer or multiPlayer object and send it to the units
     * 从“单人模式”或“多人模式”接受“指令”
     */
    processCommand: function (uids, details) {
        // In case the target "to" objects is in terms of uid, fetch the target object
        var toObject;
        if (details.toUid) {
            toObject = game.getItemByUid(details.toUid);
            if (!toObject || toObject.lifeCode == "dead") {
                // To object no longer exists. Invalid command
                return;
            }
        }

        for (var i in uids) {
            var uid = uids[i];
            var item = game.getItemByUid(uid);
            // if uid is a valid item, set the order for the item
            if (item) {
                item.orders = $.extend([], details);
                if (toObject) {
                    item.orders.to = toObject;
                }
            }
        }
    },

    /* Movement related properties */
    speedAdjustmentFactor: 1 / 64,
    turnSpeedAdjustmentFactor: 1 / 8,

    rebuildPassableGrid: function () {
        game.currentMapPassableGrid = $.extend([], game.currentMapTerrainGrid);
        for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
            if (item.type == "buildings" || item.type == "terrain") {
                for (var y = item.passableGrid.length - 1; y >= 0; y--) {
                    for (var x = item.passableGrid[y].length - 1; x >= 0; x--) {
                        if (item.passableGrid[y][x]) {
                            game.currentMapPassableGrid[item.y + y][item.x + x] = 1;
                        }
                    }
                }
            }
        }
        //TODO:DEBUG
        //game.currentMapPassableGridDrawing();
    },

    rebuildBuildableGrid: function () {
        game.currentMapBuildableGrid = $.extend(true, [], game.currentMapTerrainGrid);
        for (var i = game.items.length - 1; i >= 0; i--) {
            var item = game.items[i];
            if (item.type == "buildings" || item.type == "terrain") {
                for (var y = item.buildableGrid.length - 1; y >= 0; y--) {
                    for (var x = item.buildableGrid[y].length - 1; x >= 0; x--) {
                        if (item.buildableGrid[y][x]) {
                            game.currentMapBuildableGrid[item.y + y][item.x + x] = 1;
                        }
                    }
                }
            } else if (item.type == "vehicles") {
                // Mark all squares under or near the vehicle as unbuildable
                var radius = item.radius / game.gridSize;
                var x1 = Math.max(Math.floor(item.x - radius), 0);
                var x2 = Math.min(Math.floor(item.x + radius), game.currentLevel.mapGridWidth - 1);
                var y1 = Math.max(Math.floor(item.y - radius), 0);
                var y2 = Math.min(Math.floor(item.y + radius), game.currentLevel.mapGridHeight - 1);
                for (var x = x1; x <= x2; x++) {
                    for (var y = y1; y <= y2; y++) {
                        game.currentMapBuildableGrid[y][x] = 1;
                    }
                }
            }
        }
    },


    /**
     * currentMapPassableGrid debug
     */
    currentMapPassableGridDrawing: function () {
        var gamedebugcanvas = document.getElementById("gamedebugcanvas");
        var c = gamedebugcanvas.getContext("2d");
        c.fillStyle = "rgba(150,200,0,0.5)";


        var maxHeight = Math.floor(gamedebugcanvas.height / game.gridSize);
        var maxWidth = Math.floor(gamedebugcanvas.width / game.gridSize);
        var offset_x = Math.floor(game.offsetX / game.gridSize);
        var offset_y = Math.floor(game.offsetY / game.gridSize);
        var mod_x = game.offsetX % game.gridSize;
        var mod_y = game.offsetY % game.gridSize;

        var mygrid = new Array(maxHeight);
        for (var o = 0; o <= mygrid.length - 1; o++) {
            mygrid[o] = new Array(maxWidth);
        }
        c.clearRect(0, 0, gamedebugcanvas.width, gamedebugcanvas.height);

        if (game.currentMapPassableGrid) {
            for (var i = offset_y; i < maxHeight + offset_y; i++) {
                for (var j = offset_x; j < maxWidth + offset_x; j++) {
                    mygrid[i - offset_y][j - offset_x] = game.currentMapPassableGrid[i][j];
                }
            }

            for (var m = 0; m < maxHeight; m++) {
                for (var n = 0; n < maxWidth; n++) {
                    if (mygrid[m][n] == 1) {
                        c.fillRect(n * game.gridSize - mod_x - 2, m * game.gridSize - mod_y - 2, game.gridSize + 3, game.gridSize + 3);
                    }
                }
            }
        }
    },


    /**
     * Functions for communicating with player
     */
    characters: {
        "system": {
            "name": "System",
            "image": "images/characters/system.png"
        },
        "AI": {
            "name": "AI",
            "image": "images/characters/AI.png"
        },
        "op": {
            "name": "Operator",
            "image": "images/characters/girl1.png"
        },
        "pilot": {
            "name": "Pilot",
            "image": "images/characters/girl2.png"
        },
        "driver": {
            "name": "Driver",
            "image": "images/characters/man1.png"
        }
    },
    showMessage: function (from, message) {
        sounds.play("message-received");
        var character = game.characters[from];
        if (character) {
            from = character.name;

            if (character.image) {
//                $("#info_B_Picture").html('<img src="' + character.image + '"/>');
                $("#info_B_Picture").css("backgroundImage", "url(" + character.image + ")");
                // hide the profile picture after six seconds
                setTimeout(function () {
                    $("#info_B_Picture").css("backgroundImage", "");
                }, 6000)
            }
        }
        // Append message to messages pane and scroll to the bottom
        var existingMessage = $("#game_Messages").html();
        var newMessage = existingMessage + '<span>' + from + ': </span>' + message + '<br>';
        $("#game_Messages").html(newMessage);
//        $("#game_Messages").animate({scrollTop: $('#game_Messages').prop('scrollHeight')});
    },


    /* Message Box related code */
    messageBoxOkCallback: undefined,
    messageBoxCancelCallback: undefined,
    showMessageBox: function (message, onOK, onCancel) {
        // Set message box text
        $('#messageboxtext').html(message);

        // set message box ok and cancel handlers and enable buttons
        if (!onOK) {
            game.messageBoxOkCallback = undefined;
        } else {
            game.messageBoxOkCallback = onOK;
        }

        if (!onCancel) {
            game.messageBoxCancelCallback = undefined;
            $("#messageboxcancel").hide();
        } else {
            game.messageBoxCancelCallback = onCancel;
            $("#messageboxcancel").show();
        }

        // Display the message box and wait for user to click a button
        $('#messageboxscreen').show();
    },
    messageBoxOK: function () {
        $('#messageboxscreen').hide();
        if (game.messageBoxOkCallback) {
            game.messageBoxOkCallback();
        }
    },
    messageBoxCancel: function () {
        $('#messageboxscreen').hide();
        if (game.messageBoxCancelCallback) {
            game.messageBoxCancelCallback();
        }
    },


    /* Methods for handing triggered events within the game */
    initTrigger: function (trigger) {
        if (trigger.type == "timed") {
            trigger.timeout = setTimeout(function () {
                game.runTrigger(trigger);
            }, trigger.time);
        } else if (trigger.type == "conditional") {
            trigger.interval = setInterval(function () {
                game.runTrigger(trigger);
            }, 1000)
        }
    },
    runTrigger: function (trigger) {
        if (trigger.type == "timed") {
            // Re initialize the trigger based on repeat settings
            if (trigger.repeat) {
                game.initTrigger(trigger);
            }
            // Call the trigger action
            trigger.action(trigger);
        } else if (trigger.type == "conditional") {
            // Check if the condition has been satisfied
            if (trigger.condition()) {
                // Clear the trigger
                game.clearTrigger(trigger);
                // Call the trigger action
                trigger.action(trigger);
            }
        }
    },
    clearTrigger: function (trigger) {
        if (trigger.type == "timed") {
            clearTimeout(trigger.timeout);
        } else if (trigger.type == "conditional") {
            clearInterval(trigger.interval);
        }
    },
    end: function () {
        // Clear Any Game Triggers
        if (game.currentLevel.triggers) {
            for (var i = game.currentLevel.triggers.length - 1; i >= 0; i--) {
                game.clearTrigger(game.currentLevel.triggers[i]);
            }
        }
        game.running = false;
    },

    /* MicroMap */
    // MicroMap 微型导航地图
    /**
     * 绘制微地图内容
     */
    drawMicroMap: function () {
        var microBackC = game.microMapBackContext;
        var microForeC = game.microMapForeContext;

        microBackC.clearRect(0, 0, game.microMapBackCanvas.width, game.microMapBackCanvas.height);
        microForeC.clearRect(0, 0, game.microMapForeCanvas.width, game.microMapForeCanvas.height);
        if (!fog.isSpySatellite) {
            return;
        }
        var scale = game.microMapBackCanvas.width / game.currentMapImage.width;
        var microMap_Y = (game.microMapBackCanvas.height - game.currentMapImage.height * scale) / 2;

        // MapBack
        microBackC.drawImage(game.currentMapImage,
            0, 0, game.currentMapImage.width, game.currentMapImage.height,
            0, microMap_Y, game.microMapBackCanvas.width, game.currentMapImage.height * scale);

        // MapFore
        microForeC.strokeStyle = "red";
        microForeC.strokeRect(game.offsetX * scale, game.offsetY * scale + microMap_Y,
            game.foregroundCanvas.width * scale, game.foregroundCanvas.height * scale)

        // Draw Sprite
        for (var i = 0; i <= game.sortedItems.length - 1; i++) {
            var item = game.sortedItems[i];
            if (item.team == game.team) {
                if (item.life < item.lastLife) {
                    item.beUnderAttack = 30;
                }
                if (item.beUnderAttack > 0) {
                    microForeC.fillStyle = (item.beUnderAttack > 15 && item.beUnderAttack < 30) ? "blue" : "red";
                    microForeC.beginPath();
                    microForeC.arc(item.x * game.gridSize * scale, item.y * game.gridSize * scale + microMap_Y, 4, 0, 2 * Math.PI, true);
                    microForeC.fill();
                    item.beUnderAttack--;
                    item.lastLife = item.life;
                } else if (item.beUnderAttack < 0) {
                    item.beUnderAttack = 0;
                }
            }
            var d = 0;
            if (item.name == "bigrocks"
                || item.name == "smallrocks"
                || item.name == "oilfield"
                || item.name == "bullet") {
                continue;
            } else if (item.name == "cannon-ball"
                || item.name == "fireball"
                || item.name == "heatseeker") {
                microForeC.fillStyle = "red";
                d = 1;
            } else if (item.team == game.team) {
                microForeC.fillStyle = "rgb(100,255,150)";
                d = 3;
            }
            else if (item.team != game.team) {
                microForeC.fillStyle = "yellow";
                d = 3;
            }
            microForeC.fillRect(item.x * game.gridSize * scale - d / 2,
                item.y * game.gridSize * scale - d / 2 + microMap_Y, d, d);
        }
    }
}