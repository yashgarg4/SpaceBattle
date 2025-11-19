define([
    "model/game",
    "model/canvas",
    "model/character",
    "model/images",
    "model/inPlay",
    "controller/gameLogic",
    "model/sounds",
    "controller/localStorageManager"
], function (Game, Canvas, Character, Images, InPlay, GameLogic, Sounds, LSM) {

    var shooting;

    // ✅ FIXED: Clamp Y position to allow full top and bottom movement
    var clampPlayerY = function (value) {
        var shipHeight = Character.ship.player.height || 0;
        var minY = 0; // Top of the canvas
        var maxY = Canvas.canvasHeight - shipHeight; // Bottom of the canvas
        return Math.min(Math.max(value, minY), maxY);
    };

    // ✅ FIXED: Corrected mouse scaling for accurate ship movement
    var getMousePos = function (evt) {
        Game.keyboard.use = false;
        Game.mouse.use = true;
        var rect = Canvas.canvas.getBoundingClientRect();

        var scaleX = Canvas.canvas.width / rect.width;
        var scaleY = Canvas.canvas.height / rect.height;

        Game.mouse.pos.x = (evt.clientX - rect.left) * scaleX;
        Game.mouse.pos.y = (evt.clientY - rect.top) * scaleY;

        if (Game.screen === "game") {
            Character.ship.player.pos.y = clampPlayerY(Game.mouse.pos.y - Character.ship.player.height / 2);
        }

        if (
            Game.mouse.pos.x <= 0 ||
            Game.mouse.pos.x >= Canvas.canvasWidth ||
            Game.mouse.pos.y <= 0 ||
            Game.mouse.pos.y >= Canvas.canvasHeight
        ) {
            clearInterval(Action.shooting);
        }
    };

    var resize = function () {
        Canvas.contextCanvasWidth = window.innerWidth;
        Canvas.contextCanvasHeight = window.innerHeight;
        Canvas.canvasWidth = Canvas.canvas.width;
        Canvas.canvasHeight = Canvas.canvas.height;
        canvas = document.getElementById("gameCanvas");
        context = canvas.getContext("2d");
        context.canvas.width = window.innerWidth;
        context.canvas.height = window.innerHeight;
        canvasWidth = canvas.width;
        canvasHeight = canvas.height;
    };

    var mouseClicked = function (down, kb) {
        Game.keyboard.use = false;
        Game.mouse.use = true;

        switch (Game.screen) {
            case "main_menu":
                if (down && !kb) Action.mainMenuButtonCheck();
                break;

            case "game":
                if (down && !Game.keyboard.sbFlag) {
                    Game.keyboard.sbFlag = true;
                    if (!Character.ship.player.hasShot) {
                        Action.playerShoot();
                        Character.ship.player.hasShot = true;
                        window.setTimeout(function () {
                            Character.ship.player.hasShot = false;
                        }, Character.ship.player.fireRate * 100);
                    }
                    Action.shooting = setInterval(function () {
                        if (Character.ship.player.hp > 0) {
                            if (GameLogic.fRate) {
                                GameLogic.fRate = false;
                                clearInterval(Action.shooting);
                                Action.shooting = setInterval(function () {
                                    if (Character.ship.player.hp > 0) {
                                        Action.playerShoot();
                                    }
                                }, Character.ship.player.fireRate * 100);
                            }
                            Action.playerShoot();
                        }
                    }, Character.ship.player.fireRate * 100);
                } else if (!down) {
                    clearInterval(Action.shooting);
                    Game.keyboard.sbFlag = false;
                }
                break;

            case "game_over":
                if (down && !kb) Action.gameOverButtonCheck();
                break;

            case "options":
                if (down && !kb) Action.optionsButtonCheck();
                break;

            case "stats":
                if (down && !kb) Action.statsButtonCheck();
                break;
        }
    };

    var moveShip = function () {
        if (Game.keyboard.use) {
            if (Game.keyboard.up) {
                Character.ship.player.pos.y = clampPlayerY(Character.ship.player.pos.y - 10);
            } else if (Game.keyboard.down) {
                Character.ship.player.pos.y = clampPlayerY(Character.ship.player.pos.y + 10);
            }
        }
    };

    var gameOverButtonCheck = function () {
        var mouseX, mouseY, cw, ch;
        cw = Canvas.canvasWidth;
        ch = Canvas.canvasHeight;
        mouseX = Game.mouse.pos.x;
        mouseY = Game.mouse.pos.y;

        console.log("Game Over Click - Mouse:", mouseX, mouseY, "Canvas:", cw, ch);

        var panelW = Math.min(cw * 0.9, 450);
        var panelH = ch * 0.65;
        var panelX = (cw - panelW) / 2;
        var panelY = (ch - panelH) / 2;

        var btnW = Math.min(panelW * 0.75, 280);
        var btnH = Math.max(ch * 0.06, 35);
        var btnX = cw / 2 - btnW / 2;
        var btnSpacing = Math.max(10, ch * 0.02);
        var btn1Y = panelY + panelH * 0.62;
        var btn2Y = btn1Y + btnH + btnSpacing;

        if (
            mouseX >= btnX &&
            mouseX <= btnX + btnW &&
            mouseY >= btn1Y &&
            mouseY <= btn1Y + btnH
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Action.resetVariables();
            Game.screen = "game";
            GameLogic.level.start();
            return;
        }

        if (
            mouseX >= btnX &&
            mouseX <= btnX + btnW &&
            mouseY >= btn2Y &&
            mouseY <= btn2Y + btnH
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Action.resetVariables();
            Game.screen = "main_menu";
            if (
                typeof window !== "undefined" &&
                window.MenuUI &&
                window.MenuUI.showMainMenu
            ) {
                try {
                    window.MenuUI.showMainMenu();
                } catch (e) {
                    console.error("MenuUI error:", e);
                }
            }
            return;
        }
    };

    var optionsButtonCheck = function () {
        var mouseX, mouseY, part1, part2;
        part1 = Canvas.canvasWidth / 4;
        part2 = Canvas.canvasHeight / 4;
        mouseX = Game.mouse.pos.x;
        mouseY = Game.mouse.pos.y;

        if (
            mouseX >= part1 * 1.2 &&
            mouseX <= part1 * 1.2 + part1 * 0.75 &&
            mouseY >= part2 &&
            mouseY <= part2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            // FIXED: Correct logic - when music is ON (muteMusic = false), clicking should turn it OFF
            if (Game.muteMusic === false) {
                // Music is currently ON, turn it OFF
                Game.muteMusic = true;
                LSM.set("music", "false"); // "false" means music is OFF
                Sounds.bgMusic.mute();
            } else {
                // Music is currently OFF, turn it ON
                if (!Game.musicCreated) {
                    Sounds.bgMusic.play();
                    Game.musicCreated = true;
                }
                Sounds.bgMusic.unmute();
                Game.muteMusic = false;
                LSM.set("music", "true"); // "true" means music is ON
            }
        }

        if (
            mouseX >= part1 * 2.1 &&
            mouseX <= part1 * 2.1 + part1 * 0.75 &&
            mouseY >= part2 &&
            mouseY <= part2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            // FIXED: Correct logic - toggle SFX and save correct value
            Game.muteSFX = !Game.muteSFX;
            // "true" means SFX is ON (muteSFX = false), "false" means SFX is OFF (muteSFX = true)
            LSM.set("sfx", Game.muteSFX ? "false" : "true");
        }

        if (
            mouseX >= part1 * 2.1 &&
            mouseX <= part1 * 2.1 + part1 * 0.75 &&
            mouseY >= part2 * 2 &&
            mouseY <= part2 * 2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Game.screen = "main_menu";
        }
    };

    var statsButtonCheck = function () {
        var mouseX, mouseY, part1, part2;
        part1 = Canvas.canvasWidth / 4;
        part2 = Canvas.canvasHeight / 4;
        mouseX = Game.mouse.pos.x;
        mouseY = Game.mouse.pos.y;

        if (
            mouseX >= part1 * 2.1 &&
            mouseX <= part1 * 2.1 + part1 * 0.75 &&
            mouseY >= part2 &&
            mouseY <= part2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Game.screen = "main_menu";
        }

        if (
            mouseX >= part1 * 2.1 &&
            mouseX <= part1 * 2.1 + part1 * 0.75 &&
            mouseY >= part2 * 2 &&
            mouseY <= part2 * 2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            GameLogic.resetStats();
            console.log("Space Battle: Reset Stats button clicked - Statistics cleared!");
        }
    };

    var mainMenuButtonCheck = function () {
        var mouseX, mouseY, part1, part2;
        part1 = Canvas.canvasWidth / 4;
        part2 = Canvas.canvasHeight / 4;
        mouseX = Game.mouse.pos.x;
        mouseY = Game.mouse.pos.y;

        if (
            mouseX >= part1 * 1.2 &&
            mouseX <= part1 * 1.2 + part1 * 0.75 &&
            mouseY >= part2 &&
            mouseY <= part2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Game.screen = "game";
            Action.resetVariables();
            GameLogic.level.start();
        }

        if (
            mouseX >= part1 * 2.1 &&
            mouseX <= part1 * 2.1 + part1 * 0.75 &&
            mouseY >= part2 &&
            mouseY <= part2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Game.screen = "options";
        }

        if (
            mouseX >= part1 * 1.2 &&
            mouseX <= part1 * 1.2 + part1 * 0.75 &&
            mouseY >= part2 * 2 &&
            mouseY <= part2 * 2 + part2 * 0.7
        ) {
            if (!Game.muteSFX) Sounds.select.play();
            Game.screen = "stats";
        }
    };

    var enemyShoot = function (x, y, width, height, damage) {
        var bullet = {
            x: x - Math.max(8, width * 0.1),
            y: y + (height ? height / 2 : 52),
            damage: damage,
            alive: true,
            type: Images.redLaser1
        };
        if (!Game.muteSFX) Sounds.laser2.play();
        InPlay.enemyBullets.push(bullet);
    };

    var playerShoot = function () {
        if (Game.screen === "game") {
            var bullet = {
                x: Character.ship.player.pos.x + 60,
                y: Character.ship.player.pos.y - 4,
                alive: true,
                damage: Character.ship.player.damage,
                type: Images.blueLaser1
            };
            if (!Game.muteSFX) Sounds.laser1.play();
            InPlay.playerBullets.push(bullet);
        }
    };

    var resetVariables = function () {
        Game.gameOver = false;
        Game.timer = 0;
        Game.level = 1;
        Game.levelStarted = false;
        InPlay.enemies.length = 0;
        InPlay.enemyBullets.length = 0;
        InPlay.playerBullets.length = 0;
        InPlay.powerUps.length = 0;

        Character.ship.player.score = 0;
        Character.ship.player.hp = 100;
        Character.ship.player.guns = 1;
        Character.ship.player.damage = 10;
        Character.ship.player.fireRate = 3;
        Character.ship.player.hasShot = false;
        Character.ship.player.pos.x = 40;
        Character.ship.player.pos.y = 100;

        if (typeof LSM !== "undefined" && LSM.load) {
            LSM.load();
            console.log("Space Battle: Statistics reloaded after game reset");
        }
    };

    var Action = {
        moveShip: moveShip,
        shooting: shooting,
        mouseClicked: mouseClicked,
        playerShoot: playerShoot,
        enemyShoot: enemyShoot,
        resetVariables: resetVariables,
        mainMenuButtonCheck: mainMenuButtonCheck,
        optionsButtonCheck: optionsButtonCheck,
        gameOverButtonCheck: gameOverButtonCheck,
        statsButtonCheck: statsButtonCheck,
        getMousePos: getMousePos,
        resize: resize
    };

    return Action;
});
