/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-4-9
 * Time: 下午4:22
 * To change this template use File | Settings | File Templates.
 */

var sidebar = {
    /**
     * init buttons click
     * 初始化侧边栏按钮单击事件
     */
    init: function () {
        $("#scouttankbutton").click(function () {
            sidebar.constructAtStarport({type: "vehicles", "name": "scout-tank"});
        });
        $("#heavytankbutton").click(function () {
            sidebar.constructAtStarport({type: "vehicles", "name": "heavy-tank"});
        });
        $("#harvesterbutton").click(function () {
            sidebar.constructAtStarport({type: "vehicles", "name": "harvester"});
        });
        $("#chopperbutton").click(function () {
            sidebar.constructAtStarport({type: "aircraft", "name": "chopper"});
        });
        $("#wraithbutton").click(function () {
            sidebar.constructAtStarport({type: "aircraft", "name": "wraith"});
        });

        // Initialize building construction buttons
        $("#starportbutton").click(function () {
            game.deployBuilding = "starport";
        });
        $("#turretbutton").click(function () {
            game.deployBuilding = "ground-turret";
        });
        $("#radarbutton").click(function (ev) {
            game.deployBuilding = "ground-radar";
        });

//        this.displayButtonTitle();
    },

    /**
     *
     */
    constructAtStarport: function (unitDetails) {
        //星港
        var starport;
        // Find the first eligible starport among selected items
        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
            var item = game.selectedItems[i];
            if (item.type == "buildings" && item.name == "starport" && item.team == game.team
                && item.lifeCode == "healthy" && item.action == "stand") {
                starport = item;
                break;
            }
        }
        if (starport) {
            game.sendCommand([starport.uid], {type: "construct-unit", details: unitDetails});
        }
    },

    animate: function () {
        // Display the current cash balance value
        $('#info_A_1').html("资金:"+game.cash[game.team]);

        this.enableSidebarButtons();

        this.displayButtonTitle();

        if (game.deployBuilding) {
            // Create the buildable grid to see where building can be placed
            game.rebuildBuildableGrid();
            // Compare with buildable grid to see where we need to place the building
            var placementGrid = buildings.list[game.deployBuilding].buildableGrid;
            game.placementGrid = $.extend(true, [], placementGrid);
            game.canDeployBuilding = true;
            for (var i = game.placementGrid.length - 1; i >= 0; i--) {
                for (var j = game.placementGrid[i].length - 1; j >= 0; j--) {
                    if (game.placementGrid[i][j] &&
                        (mouse.gridY + i >= game.currentLevel.mapGridHeight
                            || mouse.gridX + j >= game.currentLevel.mapGridWidth
                            || game.currentMapBuildableGrid[mouse.gridY + i][mouse.gridX + j] == 1
                            || (!fog.isSpySatellite && fog.grid[game.team][mouse.gridY + i][mouse.gridX + j] == 1))) {
                        game.canDeployBuilding = false;
                        game.placementGrid[i][j] = 0;
                    }
                }
            }
        }
    },

    /**
     * Enable or disable buttons as appropriate
     */
    enableSidebarButtons: function () {
        // Buttons only enabled when appropriate building is selected
        $("#gameinterfacescreen #sidebarbuttons input[type='button']").attr("disabled", true);

        // If no building selected, then no point checking below
        if (game.selectedItems.length == 0) {
            return;
        }

        var baseSelected = false;
        var starportSelected = false;
        // Check if base or starport is selected
        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
            var item = game.selectedItems[i];
            // Check if player selected a healthy, inactive building (damaged building can't produce)
            if (item.type == "buildings" && item.team == game.team && item.lifeCode == "healthy" && item.action == "stand") {
                if (item.name == "base") {
                    baseSelected = true;
                } else if (item.name == "starport") {
                    starportSelected = true;
                }
            }
        }

        var cashBalance = game.cash[game.team];
        /* Enable building buttons if base is selected, building has been loaded in requirements,
         * no in deploy building mode and player has enough money */
        if (baseSelected && !game.deployBuilding) {
            if (game.currentLevel.requirements.buildings.indexOf('starport') > -1
                && cashBalance >= buildings.list["starport"].cost) {
                $("#starportbutton").removeAttr("disabled");
            }
            if (game.currentLevel.requirements.buildings.indexOf('ground-turret') > -1
                && cashBalance >= buildings.list["ground-turret"].cost) {
                $("#turretbutton").removeAttr("disabled");
            }
            if(game.currentLevel.requirements.buildings.indexOf('ground-radar')>-1
                &&cashBalance>=buildings.list["ground-radar"].cost){
                $("#radarbutton").removeAttr("disabled");
            }
        }

        /* Enable unit buttons if starport is selected, unit has been loaded in requirements, and player has enough money */
        if (starportSelected) {
            if (game.currentLevel.requirements.vehicles.indexOf('scout-tank') > -1
                && cashBalance >= vehicles.list["scout-tank"].cost) {
                $("#scouttankbutton").removeAttr("disabled");
            }
            if (game.currentLevel.requirements.vehicles.indexOf('heavy-tank') > -1
                && cashBalance >= vehicles.list["heavy-tank"].cost) {
                $("#heavytankbutton").removeAttr("disabled");
            }
            if (game.currentLevel.requirements.vehicles.indexOf('harvester') > -1
                && cashBalance >= vehicles.list["harvester"].cost) {
                $("#harvesterbutton").removeAttr("disabled");
            }
            if (game.currentLevel.requirements.aircraft.indexOf('chopper') > -1
                && cashBalance >= aircraft.list["chopper"].cost) {
                $("#chopperbutton").removeAttr("disabled");
            }
            if (game.currentLevel.requirements.aircraft.indexOf('wraith') > -1
                && cashBalance >= aircraft.list["wraith"].cost) {
                $("#wraithbutton").removeAttr("disabled");
            }
        }
    },

    cancelDeployingBuilding: function () {
        game.deployBuilding = undefined;
    },
    finishDeployingBuilding: function () {
        var buildingName = game.deployBuilding;
        var base;
        for (var i = game.selectedItems.length - 1; i >= 0; i--) {
            var item = game.selectedItems[i];
            if (item.type == "buildings" && item.name == "base" && item.team == game.team
                && item.lifeCode == "healthy" && item.action == "stand") {
                base = item;
                break;
            }
        }
        if (base) {
            var buildingDetails = {type: "buildings", name: buildingName, x: mouse.gridX, y: mouse.gridY};
            game.sendCommand([base.uid], {type: "construct-building", details: buildingDetails});
        }

        // Clear deployBuilding flag
        game.deployBuilding = undefined;
    },

    displayButtonTitle: function () {
        $("#starportbutton").attr("title","军工厂: "+buildings.list["starport"].cost);
        $("#turretbutton").attr("title","回转炮塔: "+buildings.list["ground-turret"].cost);
        $("#radarbutton").attr("title","雷达: "+buildings.list["ground-radar"].cost);

        $("#scouttankbutton").attr("title","侦察坦克: "+vehicles.list["scout-tank"].cost);
        $("#heavytankbutton").attr("title","重型坦克: "+vehicles.list["heavy-tank"].cost);
        $("#harvesterbutton").attr("title","采矿车: "+vehicles.list["harvester"].cost);

        $("#chopperbutton").attr("title","直升机: "+aircraft.list["chopper"].cost);
        $("#wraithbutton").attr("title","幽灵战机: "+aircraft.list["wraith"].cost);
    }
}
