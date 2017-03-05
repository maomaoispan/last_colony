/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-3-19
 * Time: 下午4:57
 * To change this template use File | Settings | File Templates.
 */

var singleplayer = {
    /**
     * 初始化战役模式 ，初始化关卡信息
     */
    init_All_Levels: function () {
        game.type = "singleplayer";
        game.team = "blue";

        var levels = $("#campaign_Slip_Control");
        levels.empty();
        for (var i = 1; i <= maps.singleplayer.length; i++) {
            var score = 5000
            $level = $("<div class='level hide'></div>");
            if (i == 3) {
                $level.addClass("selected_Level");
            }

            $level_One_Star = $("<div class='star'></div>");
            $level_Two_Star = $("<div class='star'></div>");
            $level_Three_Star = $("<div class='star'></div>");

            if (score >= 2000) {
                $level_One_Star.addClass("level_One_Star");
            }
            if (score >= 3000) {
                $level_Two_Star.addClass("level_Two_Star");
            }
            if (score >= 4000) {
                $level_Three_Star.addClass("level_Three_Star");
            }

            $level_Title = $("<div class='level_Title'>" + i + "<br/>" + maps.singleplayer[i - 1].name + "</div>")
            $level.append($level_One_Star)
                .append($level_Two_Star)
                .append($level_Three_Star)
                .append($level_Title);
            levels.append($level);
        }

//        $(".level").removeClass("left_Level left_Show_Level right_Show_Level right_Level");

        $(".selected_Level").removeClass("hide");

        $(".selected_Level").prev().addClass("left_Show_Level");
        $(".left_Show_Level").removeClass("hide");
        $(".left_Show_Level").prevAll().addClass("left_Level");
        $("#left_Arrow").removeClass("left_Level");

        $(".selected_Level").next().addClass("right_Show_Level");
        $(".right_Show_Level").removeClass("hide");
        $(".right_Show_Level").nextAll().addClass("right_Level");
        $("#right_Arrow").removeClass("right_Level");

        singleplayer.set_Current_Level();

        $(".level").click(function () {
            if ($(this).hasClass("selected_Level")) {
//                alert($(this).prevAll().length + 1);

                singleplayer.currentLevel = $(this).prevAll().length + 1;
                singleplayer.startCurrentLevel();
                hide_All_Layer();
                $("#loader_Screen").show();

            }
        });
    },

    /**
     * 切换关卡 显示当前关卡信息
     */
    set_Current_Level: function () {
        var max_Score = 0;
        var player = "";
        $selected_Level = $(".selected_Level");
        var level_Num = $selected_Level.prevAll().length + 1;
        $("#campaign_Map_Record").empty();
        $("#campaign_Map_Record").append("<p>最高记录：" + max_Score + "<br>玩家：" + player + "</p>");

        $("#campaign_Map").attr({src: maps.singleplayer[level_Num - 1].map_Brief});

        $("#campaign_map_Info").empty();
        $("#campaign_map_Info").append("<p>" + maps.singleplayer[level_Num - 1].name
            + "<br>" + maps.singleplayer[level_Num - 1].briefing + "</p>");

    },

    /*
     * 单人模式-开始游戏
     * 1.
     */
    play: function () {
        fog.initLevel();
        game.animationLoop();
        game.animationInterval = setInterval(game.animationLoop, game.animationTimeout);
        game.start();
    },

    /*
     * 单人模式-退出游戏
     */
    exit: function () {
        //Show the starting menu layer
//        $('.gamelayer').hide();
//        $('#gamestartscreen').show();
    },


    currentLevel: 0,
    /*
     * 开始当前关卡
     * 1.载入当前关卡所需资源
     * 2.游戏实体初始化
     * 3.显示当前关卡简介
     */
    startCurrentLevel: function () {
        //Load all the items for the level
        var level = maps.singleplayer[singleplayer.currentLevel-1];


//        //Don't allow player to enter mission until assets for the level are loaded
//        $('#entermission').attr("disabled", true);

        //Load all the assets for the level
        game.currentMapImage = loader.loadImage(level.mapImage);
        game.currentLevel = level;

        game.offsetX = level.startX * game.gridSize;
        game.offsetY = level.startY * game.gridSize;


        // Load level Requirements
        game.resetArrays();
        for (var type in level.requirements) {
            var requirementArray = level.requirements[type];
            for (var i = 0; i < requirementArray.length; i++) {
                var name = requirementArray[i];
                if (window[type]) {
                    window[type].load(name);
                } else {
                    console.log('Could not load type: ', type);
                }
            }
        }
        for (var i = level.items.length - 1; i >= 0; i--) {
            var itemDetails = level.items[i];
            game.add(itemDetails);
        }

        // Create a grid that stores all obstructed tiles as 1 and unobstructed as 0
        //
        game.currentMapTerrainGrid = [];
        for (var y = 0; y < level.mapGridHeight; y++) {
            game.currentMapTerrainGrid[y] = [];
            for (var x = 0; x < level.mapGridWidth; x++) {
                game.currentMapTerrainGrid[y][x] = 0;
            }
        }
        for (var i = level.mapObstructedTerrain.length - 1; i >= 0; i--) {
            var obstruction = level.mapObstructedTerrain[i];
            game.currentMapTerrainGrid[obstruction[1]][obstruction[0]] = 1;
        }
        game.currentMapPassableGrid = undefined;

        // Load Starting Cash For Game
        game.cash = $.extend([], level.cash);


        // Enable the enter mission button once all assets are loaded
//        if (loader.loaded) {
//            $('#entermission').removeAttr("disabled");
//        } else {
//            loader.onload = function () {
//                $('#entermission').removeAttr("disabled");
//            }
//        }

        // Clear deployBuilding flag
        game.deployBuilding = undefined;
//
//        // Load the mission screen with the current briefing
//        $('#missionbriefing').html(level.briefing.replace('\n', '<br><br>'));
//        $('#missionscreen').show();

//        singleplayer.play();
    },

    endLevel: function (success) {
        clearInterval(game.animationInterval);
        game.end();

        if (success) {
            var moreLevels = (singleplayer.currentLevel < maps.singleplayer.length - 1);
            if (moreLevels) {
                game.showMessageBox("Mission Accomplished.", function () {
                    $('.gamelayer').hide();
                    singleplayer.currentLevel++;
                    singleplayer.startCurrentLevel();
                })
            } else {
                game.showMessageBox("Mission Accomplished.<br><br>This was the last mission in the campaign.<br><br>Thank You for playing.",
                    function () {
                        $('.gamelayer').hide();
                        $('#gamestartscreen').show();
                    })
            }
        } else {
            game.showMessageBox("Mission Failed.<br><br>Try again?", function () {
                $('.gamelayer').hide();
                singleplayer.startCurrentLevel();
            }, function () {
                $('.gamelayer').hide();
                $('#gamestartscreen').show();
            })
        }
    },

    /*
     *
     */
    sendCommand: function (uids, details) {
        game.processCommand(uids, details);
    }
}