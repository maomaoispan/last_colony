/**
 * Created with JetBrains WebStorm.
 * User: qrrs
 * Date: 13-3-22
 * Time: 下午3:49
 * To change this template use File | Settings | File Templates.
 */

var buildings = {
    list: {
        "base": {
            name: "base",

            // Properties for drawing the object
            pixelWidth: 60,
            pixelHeight: 60,
            baseWidth: 40,
            baseHeight: 40,
            pixelOffsetX: 0,
            pixelOffsetY: 20,

            // Properties for describing structure for pathFinding
            buildableGrid: [
                [1, 1],
                [1, 1]
            ],
            passableGrid: [
                [1, 1],
                [1, 1]
            ],
            sight: 3,
            hitPoints: 500,
            cost: 5000,
            spriteImages: [
                {name: "healthy", count: 4},
                {name: "damaged", count: 1},
                {name: "constructing", count: 3}
            ],
            processOrders: function () {
                switch (this.orders.type) {
                    case
                    "construct-building":
                        this.action = "construct";
                        this.animationIndex = 0;
                        var itemDetails = this.orders.details;
                        // teleport in building and subtract the cost from player cash
                        itemDetails.team = this.team;
                        if (itemDetails.name == "ground-radar") {
                            itemDetails.action = "stand";
                        } else {
                            itemDetails.action = "teleport";
                        }
                        var item = game.add(itemDetails);
                        game.cash[this.team] -= item.cost;
                        this.orders = {type: "stand"};
                        break;
                }
            }
        },
        "starport": {
            name: "starport",
            pixelWidth: 40,
            pixelHeight: 60,
            baseWidth: 40,
            baseHeight: 55,
            pixelOffsetX: 1,
            pixelOffsetY: 5,
            buildableGrid: [
                [1, 1],
                [1, 1],
                [1, 1]
            ],
            passableGrid: [
                [1, 1],
                [0, 0],
                [0, 0]
            ],
            sight: 3,
            cost: 2000,
            hitPoints: 300,
            spriteImages: [
                {name: "teleport", count: 9},
                {name: "closing", count: 18},
                {name: "healthy", count: 4},
                {name: "damaged", count: 1}
            ],
            processOrders: function () {
                switch (this.orders.type) {
                    case "construct-unit":
                        if (this.lifeCode != "healthy") {
                            return;
                        }
                        // First make sure there is no unit standing on top of the building
                        var unitOnTop = false;
                        for (var i = game.items.length - 1; i >= 0; i--) {
                            var item = game.items[i];
                            if (item.x > this.x && item.x < this.x + 2
                                && item.y > this.y && item.y < this.y + 3) {
                                unitOnTop = true;
                                break;
                            }
                        }

                        var cost = window[this.orders.details.type].list[this.orders.details.name].cost;
                        if (unitOnTop) {
                            if (this.team == game.team) {
                                game.showMessage("system", "Warning! Cannot teleport unit while landing bay is occupied");
                            }
                        } else if (game.cash[this.team] < cost) {
                            if (this.team == game.team) {
                                game.showMessage("system", "Warning! Insufficient Funds. Need " + cost + " credits.");
                            }
                        } else {
                            this.action = "open";
                            this.animationIndex = 0;
                            // Position new unit above center of starport
                            var itemDetails = this.orders.details;
                            itemDetails.x = this.x + 0.5 * this.pixelWidth / game.gridSize;
                            itemDetails.y = this.y + 0.5 * this.pixelHeight / game.gridSize;
                            // Teleport in uint and subtract the cost form player cash
                            itemDetails.action = "teleport";
                            itemDetails.team = this.team;
                            game.cash[this.team] -= cost;
                            this.constructUnit = $.extend([], itemDetails);
                        }
                        this.orders = {type: "stand"};
                        break;
                }
            }
        },
        "harvester": {
            name: "harvester",
            pixelWidth: 40,
            pixelHeight: 60,
            baseWidth: 40,
            baseHeight: 20,
            pixelOffsetX: -2,
            pixelOffsetY: 40,
            buildableGrid: [
                [1, 1]
            ],
            passableGrid: [
                [1, 1]
            ],
            sight: 3,
            cost: 5000,
            hitPoints: 300,
            spriteImages: [
                {name: "deploy", count: 17},
                {name: "healthy", count: 3},
                {name: "damaged", count: 1}
            ]
        },
        "ground-radar": {
            name: "ground-radar",
            action: "stand",
            pixelWidth: 40,
            pixelHeight: 60,
            baseWidth: 40,
            baseHeight: 20,
            pixelOffsetX: 0,
            pixelOffsetY: 40,
            buildableGrid: [
                [1, 1]
            ],
            passableGrid: [
                [1, 1]
            ],
            sight: 6,
            cost: 1000,
            hitPoints: 300,
            spriteImages: [
                {name: "damaged", count: 1},
                {name: "healthy", count: 14}
            ]
        },
        "ground-turret": {
            name: "ground-turret",
            canAttack: true,
            canAttackLand: true,
            canAttackAir: false,
            weaponType: "cannon-ball",
            action: "guard", // Default action is guard unlike other buildings
            direction: 0, // Face upward(0) by default
            directions: 8, //Total of 8 turret directions allowed (0-7)
            orders: {type: "guard"},
            pixelWidth: 38,
            pixelHeight: 32,
            baseWidth: 20,
            baseHeight: 18,
            cost: 1500,
            pixelOffsetX: 9,
            pixelOffsetY: 12,
            buildableGrid: [
                [1]
            ],
            passableGrid: [
                [1]
            ],
            sight: 5,
            hitPoints: 200,
            spriteImages: [
                {name: "teleport", count: 9},
                {name: "healthy", count: 1, directions: 8},
                {name: "damaged", count: 1}
            ],
            isValidTarget: isValidTarget,
            findTargetsInSight: findTargetsInSight,
            processOrders: function () {
                if (this.reloadTimeLeft) {
                    this.reloadTimeLeft--;
                }
                // damaged turret cannot attack
                if (this.lifeCode != "healthy") {
                    return;
                }
                switch (this.orders.type) {
                    case "guard":
                        var targets = this.findTargetsInSight();
                        if (targets.length > 0) {
                            this.orders = {type: "attack", to: targets[0]};
                        }
                        break;
                    case "attack":
                        if (!this.orders.to
                            || this.orders.to.lifeCode == "dead"
                            || !this.isValidTarget(this.orders.to)
                            || (Math.pow(this.orders.to.x - this.x, 2) + Math.pow(this.orders.to.y - this.y, 2)
                            > Math.pow(this.sight, 2))) {
                            var targets = this.findTargetsInSight();
                            if (targets.length > 0) {
                                this.orders.to = targets[0];
                            } else {
                                this.orders = {type: "guard"};
                            }
                        }

                        if (this.orders.to) {
                            var newDirection = findFiringAngle(this.orders.to, this, this.directions);
                            var difference = angleDiff(this.direction, newDirection, this.directions);
                            var turnAmount = this.turnSpeed * game.turnSpeedAdjustmentFactor;
                            if (Math.abs(difference) > turnAmount) {
                                this.direction = wrapDirection(this.direction + turnAmount * Math.abs(difference) / difference, this.directions);
                                return;
                            } else {
                                this.direction = newDirection;
                                if (!this.reloadTimeLeft) {
                                    this.reloadTimeLeft = bullets.list[this.weaponType].reloadTime;
                                    var angleRadius = -(Math.round(this.direction) / this.directions) * 2 * Math.PI;
                                    var bulletX = this.x + 0.5 - (1 * Math.sin(angleRadius));
                                    var bulletY = this.y + 0.5 - (1 * Math.cos(angleRadius));
                                    var bullet = game.add({name: this.weaponType, type: "bullets", x: bulletX, y: bulletY,
                                        direction: this.direction, target: this.orders.to});
                                }
                            }
                            break;
                        }
                }
            }
        }
    },
    defaults: {
        type: "buildings",
        animationIndex: 0,
        direction: 0,
        orders: {type: "stand"},
        action: "stand",
        selected: false,
        selectable: true,

        /*
         * Default function for animation a building
         * 每个 building 的默认动画方法(并未进行绘制操作，仅仅循环设置图片)
         */
        animate: function () {
            // Consider an item healthy if it has more than 40% life
            if (this.life > this.hitPoints * 0.4) {
                this.lifeCode = "healthy";
            } else if (this.life <= 0) {
                this.lifeCode = "dead";
                game.remove(this);
                return;
            } else {
                this.lifeCode = "damaged";
            }

            switch (this.action) {
                case "stand":
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                    }
                    break;
                case "construct":
                    this.imageList = this.spriteArray["constructing"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    //Once constructing is complete go back to standing
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        this.action = "stand";
                    }
                    break;
                case "teleport":
                    this.imageList = this.spriteArray["teleport"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    // Once teleporting is complete, move to either guard or stand mode
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        if (this.canAttack) {
                            this.action = "guard";
                        } else {
                            this.action = "stand";
                        }
                    }
                    break;
                case "close":
                    this.imageList = this.spriteArray["closing"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    // Once closing is complete go back to standing
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        this.action = "stand";
                    }
                    break;
                case "open":
                    this.imageList = this.spriteArray["closing"];
                    // Opening is just the closing sprites running backwards
                    this.imageOffset = this.imageList.offset + this.imageList.count - this.animationIndex;
                    this.animationIndex++;
                    // Once opening is complete, go back to close
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        this.action = "close";
                        // If constructUnit has been set, add the new unit to the game
                        if (this.constructUnit) {
                            game.add(this.constructUnit);
                            this.constructUnit = undefined;
                        }
                    }
                    break;
                case "deploy":
                    this.imageList = this.spriteArray["deploy"];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    // Once deploying is complete, go to harvest now
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        this.action = "harvest";
                    }
                    break;
                case "harvest":
                    this.imageList = this.spriteArray[this.lifeCode];
                    this.imageOffset = this.imageList.offset + this.animationIndex;
                    this.animationIndex++;
                    if (this.animationIndex >= this.imageList.count) {
                        this.animationIndex = 0;
                        if (this.lifeCode == "healthy") {
                            // Harvests mine 2 credits of cash per animation cycle
                            game.cash[this.team] += 2;
                        }
                    }
                    break;
                case "guard":
                    if (this.lifeCode == "damaged") {
                        // The damaged turret has no directions
                        this.imageList = this.spriteArray[this.lifeCode];
                    } else {
                        // The healthy turret has 8 directions
                        var direction = wrapDirection(Math.round(this.direction), this.directions);
                        this.imageList = this.spriteArray[this.lifeCode + "-" + direction];
                    }
                    this.imageOffset = this.imageList.offset;
                    break;
            }
        },

        /*
         * Default function for drawing a building
         * 绘制每一个“实体”的默认方法
         */
        draw: function () {
            var x = (this.x * game.gridSize) - game.offsetX - this.pixelOffsetX;
            var y = (this.y * game.gridSize) - game.offsetY - this.pixelOffsetY;
            this.drawingX = x;
            this.drawingY = y;
            if (this.selected) {
                this.drawSelection();
                this.drawLifeBar();
            }
            // All sprites sheets will have blue in the first row and green in the second row
            var colorIndex = (this.team == "blue") ? 0 : 1;
            var colorOffset = colorIndex * this.pixelHeight;
            game.foregroundContext.drawImage(this.spriteSheet,
                this.imageOffset * this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight,
                x, y, this.pixelWidth, this.pixelHeight);
        },

        /*
         * 绘制生命条
         */
        drawLifeBar: function () {
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY - 2 * game.lifeBarHeight;
            game.foregroundContext.fillStyle = (this.lifeCode == "healthy") ?
                game.healthBarHealthyFillColor : game.healthBarDamagedFillColor;
            game.foregroundContext.fillRect(x, y, this.baseWidth * this.life / this.hitPoints, game.lifeBarHeight);

            game.foregroundContext.strokeStyle = game.healthBarBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.strokeRect(x, y, this.baseWidth, game.lifeBarHeight)
        },

        /*
         * 绘制选中标志-一个方框
         */
        drawSelection: function () {
            var x = this.drawingX + this.pixelOffsetX;
            var y = this.drawingY + this.pixelOffsetY;
            game.foregroundContext.strokeStyle = game.selectionBorderColor;
            game.foregroundContext.lineWidth = 1;
            game.foregroundContext.fillStyle = game.selectionFillColor;
            game.foregroundContext.fillRect(x - 2, y - 2, this.baseWidth + 4, this.baseHeight + 4);
            game.foregroundContext.strokeRect(x - 1, y - 1, this.baseWidth + 2, this.baseHeight + 2);
        }
    },
    load: loadItem,
    add: addItem
}