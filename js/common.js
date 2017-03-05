/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-5-9
 * Time: 下午7:08
 * To change this template use File | Settings | File Templates.
 */

//Setup requestAnimationFrame and cancelAnimationFrame for use in the game code
(function () {
    var lastTime = 0;
    var vendors = ['ms', ';', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        }
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        }
    }
}());

$(window).load(function () {
    game.init();
    init_UI_Event();
    adjust_Window();
    hide_All_Layer();
    $("#login").show();
});
$(window).resize(function () {
    adjust_Window();
    game.set_Game_Window_Size();
});


/**
 * 调整窗口布局
 */
function adjust_Window() {
    game.refreshBackground = true;
    var scale = 7;
    //设置控制面板的高宽比
    $('#control_Panel').height($('#control_Panel').width() / scale);
    //设置控制面板的Y向位置
    $('#control_Panel').css("top", $('#container').height() - $('#control_Panel').height());
    //设置主地图的高度
    $('#main_Map').height($('#container').height() - $('#entity_Info ').height());
}


/**
 * 各浏览器 FullScreen API
 * @param obj
 * @param method
 * @returns {*}
 * @constructor
 */
function RunPrefixMethod(obj, method) {
    var pfx = ["webkit", "moz", "ms", "o", ""];

    var p = 0, m, t;
    while (p < pfx.length && !obj[m]) {
        m = method;
        if (pfx[p] == "") {
            m = m.substr(0, 1).toLowerCase() + m.substr(1);
        }
        m = pfx[p] + m;
        t = typeof obj[m];
        if (t != "undefined") {
            pfx = [pfx[p]];
            return (t == "function" ? obj[m]() : obj[m]);
        }
        p++;
    }
}

/**
 * 全屏
 */
function fullScreen() {
    var e = document.getElementById("body");
    if (RunPrefixMethod(document, "FullScreen") || RunPrefixMethod(document, "IsFullScreen")) {
        RunPrefixMethod(document, "CancelFullScreen");
    }
    else {
        RunPrefixMethod(e, "RequestFullScreen");
    }
    adjust_Window();
}


/* 事件 */
/**
 * 影藏所有层
 */
function hide_All_Layer() {
    $("#login").hide();
    $("#register").hide();
    $("#mode_Select").hide();
    $("#game_Info").hide();
    $("#loader_Screen").hide();
    $("#game_Interface").hide();
//    $("#login").addClass("hide");
//    $("#register").addClass("hide");
//    $("#mode_Select").addClass("hide");
//    $("#game_Info").addClass("hide");
//    $("#loader_Screen").addClass("hide");
//    $("#game_Interface").addClass("hide");
}


/**
 * 初始化 UI 事件
 */
function init_UI_Event() {
    /* 测试 */
    $("#main_Back_Canvas").resize(function(){
        console.log(document.getElementById("main_Back_Canvas").width+"|" +document.getElementById("main_Back_Canvas").height);
    });

    /** login */
    $("#btn_Login_Register").click(function () {
        hide_All_Layer();
        $("#register").show();
    });

    $("#btn_Login_Step").click(function () {
        hide_All_Layer();
        $("#mode_Select").show();
    });

    /* Register */
    $("#btn_Register_Back").click(function () {
        hide_All_Layer();
        $("#login").show();
    });

    $("#btn_Register_Step").click(function () {
        hide_All_Layer();
        $("#mode_Select").show();
    });

    $("#btn_Register_Step").click(function () {
        hide_All_Layer();
        $("#mode_Select").show();
    });

    /** mode select */
    $("#btn_Mode_Campaign").click(function () {
        singleplayer.init_All_Levels();

        hide_All_Layer();
        $("#game_Info").show();
        $("#head_Campaign_Info").removeClass("hide")
        $("#head_Campaign_Info").addClass("selected")
        $("#head_Lobby_Info").addClass("hide");
        $(".info_Layer").addClass("hide");
        $("#campaign_Info").removeClass("hide");

        $("#lobby_Sidebar").removeClass("inactive");
        $("#lobby_Sidebar").addClass("active");
    });
    $("#btn_Mode_Multiplayer").click(function () {
        inti_Lobby_Rooms();

        hide_All_Layer();
        $("#game_Info").show();
        $("#head_Lobby_Info").removeClass("hide")
        $("#head_Lobby_Info").addClass("selected")
        $("#head_Campaign_Info").addClass("hide");
        $(".info_Layer").addClass("hide");
        $("#lobby_Info").removeClass("hide");

        $("#lobby_Sidebar").removeClass("active");
        $("#lobby_Sidebar").addClass("inactive");
    });

    $("#btn_Mode_Back").click(function () {
        hide_All_Layer();
        $("#login").show();
    });

    /* game info*/
    $("#game_Info_Back").click(function () {
        hide_All_Layer();
        $("#mode_Select").show();
    });

    //head
    $("#head_Campaign_Info").click(function () {
        $(".head_Tab").removeClass("selected");
        $(this).addClass("selected");

        $(".info_Layer").addClass("hide");
        $("#campaign_Info").removeClass("hide");
    });
    $("#head_Lobby_Info").click(function () {
        $(".head_Tab").removeClass("selected");
        $(this).addClass("selected");

        $(".info_Layer").addClass("hide");
        $("#lobby_Info").removeClass("hide");
    });
    $("#head_Personal_Storage").click(function () {
        $(".head_Tab").removeClass("selected");
        $(this).addClass("selected");

        $(".info_Layer").addClass("hide");
        $("#personal_Storage").removeClass("hide");
    });
    $("#head_System_Gift").click(function () {
        $(".head_Tab").removeClass("selected");
        $(this).addClass("selected");

        $(".info_Layer").addClass("hide");
        $("#system_Gift").removeClass("hide");
    });
    $("#head_Game_Store").click(function () {
        $(".head_Tab").removeClass("selected");
        $(this).addClass("selected");

        $(".info_Layer").addClass("hide");
        $("#game_Store").removeClass("hide");
    });

    // 战役


    $("#right_Arrow").click(function () {
        campaign_Level_Scroll_Left();
    });

    $("#left_Arrow").click(function () {
        campaign_Level_Scroll_Right();
    });

    $("#campaign_Slip_Control").mousewheel(function (event, delta) {
        if (delta == 1) {
            campaign_Level_Scroll_Left();
        }
        if (delta == -1) {
            campaign_Level_Scroll_Right();
        }
    })

    // 侧边栏
    $("#btn_Sidebar_Flip").click(function () {
        $("#lobby_Sidebar").toggleClass("active");
        $("#lobby_Sidebar").toggleClass("inactive");
    });

    /* Game Lobby info */
    $("#room_Slider_Up_Arrow").click(function () {
        rooms_Scroll_UP();
    });

    $("#room_Slider_Down_Arrow").click(function () {
        rooms_Scroll_Down();
    });

    $("#lobby_Rooms").mousewheel(function (event, delta, deltaX, deltaY) {
        if (delta == 1) {
            rooms_Scroll_UP();
        }
        if (delta == -1) {
            rooms_Scroll_Down();
        }
    });


    //游戏运行界面
    $("#full_Screen").click(function(){
        fullScreen();
    });

}


/**
 * 战役关卡向左滚动
 */
function campaign_Level_Scroll_Left() {
    if ($(".right_Show_Level").length == 0) {
        return;
    } else if ($(".right_Show_Level").next().attr("id") != "right_Arrow") {
        //左侧显示的 变为 影藏的
        $(".left_Show_Level").addClass("left_Level");
        $(".left_Show_Level").addClass("hide");
        $(".left_Show_Level").removeClass("left_Show_Level");

        // 选中的变为 左侧显示的
        $(".selected_Level").addClass("left_Show_Level");
        $(".selected_Level").removeClass("selected_Level");

        //找出右侧 影藏 的 第一个
        $(".right_Show_Level").next().addClass("right_Level_Will_Show");

        // 右侧显示的变为选中的
        $(".right_Show_Level").addClass("selected_Level");
        $(".right_Show_Level").removeClass("right_Show_Level");

        // 右侧第一个影藏的变为右侧显示的
        $(".right_Level_Will_Show").addClass("right_Show_Level");
        $(".right_Level_Will_Show").removeClass("right_Level");
        $(".right_Level_Will_Show").removeClass("hide");
        $(".right_Level_Will_Show").removeClass("right_Level_Will_Show");
    }

    singleplayer.set_Current_Level();
}

/**
 * 战役关卡向右滚动
 */
function campaign_Level_Scroll_Right() {
    if ($(".left_Show_Level").length == 0) {
        return;
    } else if ($(".left_Show_Level").prev().attr("id") != "left_Arrow") {
        //右侧显示的 变为 影藏的
        $(".right_Show_Level").addClass("right_Level");
        $(".right_Show_Level").addClass("hide");
        $(".right_Show_Level").removeClass("right_Show_Level");

        // 选中的变为 右侧显示的
        $(".selected_Level").addClass("right_Show_Level");
        $(".selected_Level").removeClass("selected_Level");

        //找出左侧 影藏 的 第一个
        $(".left_Show_Level").prev().addClass("left_Level_Will_Show");

        // 左侧显示的变为选中的
        $(".left_Show_Level").addClass("selected_Level");
        $(".left_Show_Level").removeClass("left_Show_Level");

        // 左侧第一个影藏的变为左侧显示的
        $(".left_Level_Will_Show").addClass("left_Show_Level");
        $(".left_Level_Will_Show").removeClass("left_Level");
        $(".left_Level_Will_Show").removeClass("hide");
        $(".left_Level_Will_Show").removeClass("left_Level_Will_Show");
    }
    singleplayer.set_Current_Level();
}


/**
 * 房间向上滚动函数
 */
function rooms_Scroll_UP() {
    if ($(".room_Top_Show:first").prev().length == 0) {
        return;
    }

    // Down show > Down
    $(".room_Down_Show").addClass("room_Down");
    $(".room_Down_Show").removeClass("room_Down_Show");

    // 缓存 将要显示的 元素
    $(".room_Top_Show:first").prev().addClass("room_Top_Temp");
    $(".room_Top_Show:first").prev().prev().addClass("room_Top_Temp");
    $(".room_Top_Show:first").prev().prev().prev().addClass("room_Top_Temp");

    // Top Show > Down show
    $(".room_Top_Show").addClass("room_Down_Show");
    $(".room_Top_Show").removeClass("room_Top_Show");


    // Top > Top Show
    $(".room_Top_Temp").addClass("room_Top_Show");
    $(".room_Top_Temp").removeClass("room_Top");
    $(".room_Top_Temp").removeClass("room_Top_Temp");
}

/**
 * 房间向下滚动函数
 */
function rooms_Scroll_Down() {
    if ($(".room_Down_Show:last").next().length == 0) {
        return;
    }
    // Top show > Top
    $(".room_Top_Show").addClass("room_Top");
    $(".room_Top_Show").removeClass("room_Top_Show");

    //缓存 将要显示的 元素
    $(".room_Down_Show:last").next().addClass("room_Down_Temp");
    $(".room_Down_Show:last").next().next().addClass("room_Down_Temp");
    $(".room_Down_Show:last").next().next().next().addClass("room_Down_Temp");

    // Down show > Top show
    $(".room_Down_Show").addClass("room_Top_Show");
    $(".room_Down_Show").removeClass("room_Down_Show");

    // down > down show
    $(".room_Down_Temp").addClass("room_Down_Show");
    $(".room_Down_Temp").removeClass("room_Down");
    $(".room_Down_Temp").removeClass("room_Down_Temp");
}


/**
 * 初始化房间
 */
function inti_Lobby_Rooms() {
    $(".room_Info").removeClass("room_Top room_Top_Show room_Down_Show room_Down room_Left room_Center room_Right")

    $("#lobby_Rooms :nth-child(3n-2)").addClass("room_Left");
    $("#lobby_Rooms :nth-child(3n-1)").addClass("room_Center");
    $("#lobby_Rooms :nth-child(3n)").addClass("room_Right");

    var num = $(".room_Selected").prevAll().length + 1;

    //选中的房间在 左侧
    if ((num + 2) / 3 - parseInt(((num + 2) / 3)) == 0) {
        $(".room_Selected").prevAll().addClass("room_Top");

        $(".room_Selected").addClass("room_Top_Show");
        $(".room_Selected").next().addClass("room_Top_Show");
        $(".room_Selected").next().next().addClass("room_Top_Show");

        $(".room_Selected").next().next().next().addClass("room_Down_Show");
        $(".room_Selected").next().next().next().next().addClass("room_Down_Show");
        $(".room_Selected").next().next().next().next().next().addClass("room_Down_Show");

        $(".room_Selected").next().next().next().next().next().nextAll().addClass("room_Down");
    }


    //选中的房间在 中间
    if ((num + 1) / 3 - parseInt(((num + 1) / 3)) == 0) {
        $(".room_Selected").prev().prevAll().addClass("room_Top");

        $(".room_Selected").prev().addClass("room_Top_Show");
        $(".room_Selected").addClass("room_Top_Show");
        $(".room_Selected").next().addClass("room_Top_Show");

        $(".room_Selected").next().next().addClass("room_Down_Show");
        $(".room_Selected").next().next().next().addClass("room_Down_Show");
        $(".room_Selected").next().next().next().next().addClass("room_Down_Show");

        $(".room_Selected").next().next().next().next().nextAll().addClass("room_Down");
    }

    //选中的房间在 中间
    if ((num) / 3 - parseInt(((num) / 3)) == 0) {
        $(".room_Selected").prev().prev().prevAll().addClass("room_Top");

        $(".room_Selected").prev().addClass("room_Top_Show");
        $(".room_Selected").prev().prev().addClass("room_Top_Show");
        $(".room_Selected").addClass("room_Top_Show");

        $(".room_Selected").next().addClass("room_Down_Show");
        $(".room_Selected").next().next().addClass("room_Down_Show");
        $(".room_Selected").next().next().next().addClass("room_Down_Show");

        $(".room_Selected").next().next().next().nextAll().addClass("room_Down");
    }
}


var loader = {
    // 所有资源是否全部载入完全
    loaded: true,
    // Asset that have been loaded so far
    // 已经载入的资源数目
    loadedCount: 0,
    // Total number of assets that need to be loaded
    //需要载入的资源的总数目
    totalCount: 0,


    /**
     * 检查并确定浏览器音频支持格式
     */
    init: function () {
        //Check for sound support
        var mp3Support, oggSupport;
        var audio = document.createElement('audio');
        if (audio.canPlayType) {
            //Current canPlayType() returns: "", "maybe" or "probably"
            mp3Support = "" != audio.canPlayType('audio/mpeg');
            oggSupport = "" != audio.canPlayType('audio/ogg; codecs = "vorbis"');
        } else {
            //The audio tag is not supported
            mp3Support = false;
            oggSupport = false;
        }

        //Check for ogg, then mp3, and finally set soundFileExtn to undefined
        loader.soundFileExtn = oggSupport ? ".ogg" : mp3Support ? ".mp3" : undefined;
    },

    /**
     * 载入图片文件，并随即更新进度条
     */
    loadImage: function (url) {
        this.totalCount++;
        this.loaded = false;
//        $('#loadingscreen').show();
        var image = new Image();
        image.src = url;
        image.onload = loader.itemLoaded;
        return image;
    },

    // 音频文件默认扩展名
    soundFileExtn: ".ogg",

    /**
     *载入音乐文件，并随即更新进度条
     */
    loadSound: function (url) {
        this.totalCount++;
        this.loaded = false;
//        $('#loadingscreen').show();
        var audio = new Audio();
        audio.src = url + loader.soundFileExtn;
        audio.addEventListener("canplaythrough", loader.itemLoaded, false);
        return audio;
    },

    /**
     * 更新载入进度，直至所有数据载入完成后影藏 载入界面 显示游戏界面
     */
    itemLoaded: function () {
        loader.loadedCount++;
        var loader_Percent = parseFloat(loader.loadedCount / loader.totalCount).toFixed(2) * 100;
        $('#loader_Percent').html('正在载入： ' + loader_Percent + "%100");
        var loader_Canvas = document.getElementById("loader_Canvas");
        var loader_Context = loader_Canvas.getContext("2d");
        loader_Context.fillStyle = "green";
        loader_Context.fillRect(0, 0, loader_Canvas.width * loader_Percent / 100, loader_Canvas.height);
        if (loader.loadedCount === loader.totalCount) {
            loader.loaded = true;

            //如果载入完毕 开始游戏

            hide_All_Layer();
            $('#game_Interface').show();

            singleplayer.play();


            if (loader.onload) {
                loader.onload();
                loader.onload = undefined;
            }
        }
    }
}

/**
 * The default load() method used by all our game entities
 * 载入游戏中所有实体的默认方法
 */
function loadItem(name) {
    var item = this.list[name];
    // if the item sprite array has already been loaded the no need to do it again
    if (item.spriteArray) {
        return;
    }
    item.spriteSheet = loader.loadImage('images/' + this.defaults.type + '/' + name + '.png');
    item.spriteArray = [];
    item.spriteCount = 0;

    for (var i = 0; i < item.spriteImages.length; i++) {
        var constructImageCount = item.spriteImages[i].count;
        var constructDirectionCount = item.spriteImages[i].directions;
        if (constructDirectionCount) {
            for (var j = 0; j < constructDirectionCount; j++) {
                var constructImageName = item.spriteImages[i].name + "-" + j;
                item.spriteArray[constructImageName] = {
                    name: constructImageName,
                    count: constructImageCount,
                    offset: item.spriteCount
                }
                item.spriteCount += constructImageCount;
            }
        } else {
            var constructImageName = item.spriteImages[i].name;
            item.spriteArray[constructImageName] = {
                name: constructImageName,
                count: constructImageCount,
                offset: item.spriteCount
            }
            item.spriteCount += constructImageCount;
        }
    }
    // load the weapon if item has one
    if (item.weaponType) {
        bullets.load(item.weaponType);
    }
}

/**
 * The default add() method used by all our game entities
 * 添加整个游戏实体的默认方法
 */
function addItem(details) {
    var item = {};
    var name = details.name;
    $.extend(item, this.defaults);
    $.extend(item, this.list[name]);
    item.life = item.hitPoints;
    item.lastLife = item.hitPoints;
    item.beUnderAttack = 0;
    $.extend(item, details);
    return item;
}

/** Common functions for turning and movement*/

/**
 * Finds the angle between two objects in terms of a direction (where 0 <= angle <directions)
 * 找出两个对象之间第一步要移动的方向
 */
function findAngle(object, unit, directions) {
    var dy = object.y - unit.y;
    var dx = object.x - unit.x;
    // Convert Arctan to value between (0 - directions)
    var angle = wrapDirection(directions / 2 - (Math.atan2(dx, dy) * directions / (2 * Math.PI)), directions);
    return angle;
}

/**
 * returns the smallest difference (value ranging between -directions/2 to + directions/2)
 * between two angles (where 0 <= angle <directions)
 * 返回新方位与当前方位的差值(-directions/2, directions/2)
 */
function angleDiff(/*current direction*/angle1, /*new direction*/angle2, directions) {
    if (angle1 >= directions) {
        angle1 = angle1 - directions;
    }
    if (angle2 >= directions / 2) {
        angle2 = angle2 - directions;
    }

    diff = angle2 - angle1;

    if (diff < -directions / 2) {
        diff += directions;
    }
    if (diff > directions / 2) {
        diff -= directions;
    }
    return diff;
}

/**
 * Wrap value of direction so that it lies between 0 and directions-1
 * 将 direction 的值元整到 0 至 directions-1 范围内
 */
function wrapDirection(direction, directions) {
    if (direction < 0) {
        direction += directions;
    }
    if (direction >= directions) {
        direction -= directions;
    }
    return direction;
}

function findFiringAngle(target, source, directions) {
    var dy = (target.y) - (source.y);
    var dx = (target.x) - (source.x);

    if (target.type == "buildings") {
        dy += target.baseWidth / 2 / game.gridSize;
        dx += target.baseHeight / 2 / game.gridSize;
    } else if (target.type == "aircraft") {
        dy -= target.pixelShadowHeight / game.gridSize;
    }

    if (source.type == "buildings") {
        dy -= source.baseWidth / 2 / game.gridSize;
        dx -= source.baseHeight / 2 / game.gridSize;
    } else if (source.type == "aircraft") {
        dy += source.pixelShadowHeight / game.gridSize;
    }

    // Convert Arctan to value between (0 - 7)
    var angle = wrapDirection(directions / 2 - (Math.atan2(dx, dy) * directions / (2 * Math.PI)), directions);
    return angle;
}

// Common Functions related to combat

function isValidTarget(item) {
    return item.team != this.team
        && (this.canAttackLand && (item.type == "buildings" || item.type == "vehicles")
        || (this.canAttackAir && (item.type == "aircraft")));
}

function findTargetsInSight(increment) {
    if (!increment) {
        increment = 0;
    }
    var targets = [];
    for (var i = game.items.length - 1; i >= 0; i--) {
        var item = game.items[i];
        if (this.isValidTarget(item)) {
            if (Math.pow(item.x - this.x, 2) + Math.pow(item.y - this.y, 2) < Math.pow(this.sight + increment, 2)) {
                targets.push(item);
            }
        }
    }

    // Sort targets based on distance from attacker
    var attacker = this;
    targets.sort(function (a, b) {
        return (Math.pow(a.x - attacker.x, 2) + Math.pow(a.y - attacker.y, 2))
            - (Math.pow(b.x - attacker.x, 2) + Math.pow(b.y - attacker.y, 2));
    })

    return targets;
}


/**
 * A* (A-Star) algorithm for a path finder
 * @author  Andrea Giammarchi
 * @license Mit Style License
 */
var AStar = (function () {
    function diagonalSuccessors($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
        if ($N) {
            $E && !grid[N][E] && (result[i++] = {x: E, y: N});
            $W && !grid[N][W] && (result[i++] = {x: W, y: N});
        }
        if ($S) {
            $E && !grid[S][E] && (result[i++] = {x: E, y: S});
            $W && !grid[S][W] && (result[i++] = {x: W, y: S});
        }
        return result;
    }

    function diagonalSuccessorsFree($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
        $N = N > -1;
        $S = S < rows;
        $E = E < cols;
        $W = W > -1;
        if ($E) {
            $N && !grid[N][E] && (result[i++] = {x: E, y: N});
            $S && !grid[S][E] && (result[i++] = {x: E, y: S});
        }
        if ($W) {
            $N && !grid[N][W] && (result[i++] = {x: W, y: N});
            $S && !grid[S][W] && (result[i++] = {x: W, y: S});
        }
        return result;
    }

    function nothingToDo($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i) {
        return result;
    }

    function successors(find, x, y, grid, rows, cols) {
        var
            N = y - 1,
            S = y + 1,
            E = x + 1,
            W = x - 1,
            $N = N > -1 && !grid[N][x],
            $S = S < rows && !grid[S][x],
            $E = E < cols && !grid[y][E],
            $W = W > -1 && !grid[y][W],
            result = [],
            i = 0
            ;
        $N && (result[i++] = {x: x, y: N});
        $E && (result[i++] = {x: E, y: y});
        $S && (result[i++] = {x: x, y: S});
        $W && (result[i++] = {x: W, y: y});
        return find($N, $S, $E, $W, N, S, E, W, grid, rows, cols, result, i);
    }

    function diagonal(start, end, f1, f2) {
        return f2(f1(start.x - end.x), f1(start.y - end.y));
    }

    function euclidean(start, end, f1, f2) {
        var
            x = start.x - end.x,
            y = start.y - end.y
            ;
        return f2(x * x + y * y);
    }

    function manhattan(start, end, f1, f2) {
        return f1(start.x - end.x) + f1(start.y - end.y);
    }

    function AStar(grid, start, end, f) {
        var
            cols = grid[0].length,
            rows = grid.length,
            limit = cols * rows,
            f1 = Math.abs,
            f2 = Math.max,
            list = {},
            result = [],
            open = [
                {x: start[0], y: start[1], f: 0, g: 0, v: start[0] + start[1] * cols}
            ],
            length = 1,
            adj, distance, find, i, j, max, min, current, next
            ;
        end = {x: end[0], y: end[1], v: end[0] + end[1] * cols};
        switch (f) {
            case "Diagonal":
                find = diagonalSuccessors;
            case "DiagonalFree":
                distance = diagonal;
                break;
            case "Euclidean":
                find = diagonalSuccessors;
            case "EuclideanFree":
                f2 = Math.sqrt;
                distance = euclidean;
                break;
            default:
                distance = manhattan;
                find = nothingToDo;
                break;
        }
        find || (find = diagonalSuccessorsFree);
        do {
            max = limit;
            min = 0;
            for (i = 0; i < length; ++i) {
                if ((f = open[i].f) < max) {
                    max = f;
                    min = i;
                }
            }
            ;
            current = open.splice(min, 1)[0];
            if (current.v != end.v) {
                --length;
                next = successors(find, current.x, current.y, grid, rows, cols);
                for (i = 0, j = next.length; i < j; ++i) {
                    (adj = next[i]).p = current;
                    adj.f = adj.g = 0;
                    adj.v = adj.x + adj.y * cols;
                    if (!(adj.v in list)) {
                        adj.f = (adj.g = current.g + distance(adj, current, f1, f2)) + distance(adj, end, f1, f2);
                        open[length++] = adj;
                        list[adj.v] = 1;
                    }
                }
            } else {
                i = length = 0;
                do {
                    result[i++] = {x: current.x, y: current.y};
                } while (current = current.p);
                result.reverse();
            }
        } while (length);
        return result;
    }

    return AStar;

}());
