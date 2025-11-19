define(["model/game", "model/character", "model/inPlay", "model/canvas", "model/sounds", "model/images", "controller/localStorageManager"], function (Game, Character, InPlay, Canvas, Sounds, Images, LSM) {
    var timerInterval;
    var resetTimer = function resetTimer() {
        Game.timer = 0;
    };

    var clone = (function () {
        return function (obj) {
            Clone.prototype = obj;
            return new Clone();
        };

        function Clone() {}
    }());

    var startTimer = function startTimer() {
        timerInterval = setInterval(function () {
            if (Game.levelStarted) {
                Game.timer += 0.01;
                GameLogic.addScore(2);
            }
        }, 10);
    };

    var addScore = function addScore(add) {
        Character.ship.player.score += add;
    };

    var stopTimer = function stopTimer() {
        clearInterval(timerInterval);
    };

    var getTimer = function getTimer() {
        return Game.timer;
    };

    var timer = {
        reset: resetTimer,
        start: startTimer,
        stop: stopTimer,
        get: getTimer
    };

    var startLevel = function startLevel() {
        console.log("Space Battle: Starting Level " + Game.level);
        
        // Mid-roll ad already cached at game start, no need to cache again here
        
        setTimeout(function () {
            if (!Game.muteSFX) {
                Sounds.levelUp.play();
            }
            Game.levelStarted = true;
            GameLogic.timer.start();
            GameLogic.addEnemies();
            console.log("Space Battle: Level " + Game.level + " started with enemies");
        }, 3000);
    };

    var checkEnemiesDead = function checkEnemiesDead() {
        var alive = 0;
        var enemies = InPlay.enemies;
        var i;
        if (enemies.length > 0 && !Game.gameOver) {
            for (i = 0; i < enemies.length; i++) {
                if (enemies[i].alive) {
                    alive++;
                }
            }
            if (alive === 0) {
                GameLogic.timer.stop();
                enemies.length = 0;
                Game.level++;
                Game.levelStarted = false;
                GameLogic.level.start();
            }
        }
    };

    var checkBulletCollision = function checkBulletCollision() {
        var bullet, ship;
        var enemyBullets = InPlay.enemyBullets;
        var playerPos = Character.ship.player.pos;
        var playerBullets = InPlay.playerBullets;
        var enemies = InPlay.enemies;
        for (bullet = 0; bullet < playerBullets.length; bullet++) {
            if (playerBullets[bullet].alive) {
                for (ship = 0; ship < enemies.length; ship++) {
                    if (enemies[ship].alive) {
                        if (playerBullets[bullet].x >= enemies[ship].x && playerBullets[bullet].x <= enemies[ship].x + enemies[ship].width) {
                            if (playerBullets[bullet].y >= (enemies[ship].y - 9) && playerBullets[bullet].y <= enemies[ship].y + enemies[ship].height) {
                                playerBullets[bullet].alive = false;
                                enemies[ship].hp -= playerBullets[bullet].damage;
                                if (enemies[ship].hp <= 0) {
                                    if (!Game.muteSFX) {
                                        Sounds.death.play();
                                    }
                                    enemies[ship].alive = false;
                                    GameLogic.addScore(enemies[ship].score);
                                    if (enemies[ship].name === "transport") {
                                        GameLogic.dropPickUp(enemies[ship].x, enemies[ship].y);
                                        Game.transport += 1;
                                    }
                                    if (enemies[ship].name === "scout") {
                                        Game.scout += 1;
                                    }
                                    if (enemies[ship].name === "fighter") {
                                        Game.fighter += 1;
                                    }
                                    if (enemies[ship].name === "interceptor") {
                                        Game.interceptor += 1;
                                    }
                                    if (enemies[ship].name === "tank") {
                                        Game.tank += 1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (bullet = 0; bullet < enemyBullets.length; bullet++) {
            if (enemyBullets[bullet].alive) {
                if (enemyBullets[bullet].x >= playerPos.x - 13 && enemyBullets[bullet].x <= playerPos.x + Character.ship.player.width) {
                    if (enemyBullets[bullet].y >= playerPos.y - Character.ship.player.height / 2 && enemyBullets[bullet].y <= playerPos.y + Character.ship.player.height / 2) {
                        if (!Game.muteSFX) {
                            Sounds.playerHit.play();
                        }
                        enemyBullets[bullet].alive = false;
                        Character.ship.player.hp -= enemyBullets[bullet].damage;
                        if (Character.ship.player.hp <= 0) {
                            if (!Game.muteSFX) {
                                Sounds.explosion.play();
                            }
                            GameLogic.gameOver();
                        }
                    }
                }
            }
        }
    };

    var dropPickUp = function dropPickUp(x, y) {
        var selector;
        selector = Math.floor(Math.random() * (3 - 1 + 1) + 1);
        var pickUp = {
            x: x,
            y: y + 45,
            alive: true
        };
        if (selector === 1) {
            pickUp.type = "health";
            pickUp.icon = Images.pickUpHealth;
        } else if (selector === 2) {
            pickUp.type = "fireRate";
            pickUp.icon = Images.pickUpFireRate;
        } else if (selector === 3) {
            pickUp.type = "damage";
            pickUp.icon = Images.pickUpDamage;
        }
        InPlay.powerUps.push(pickUp);
    };

    var checkPickUp = function checkPickUp() {
        var powerUps = InPlay.powerUps;
        var player = Character.ship.player;
        var i;
        for (i = 0; i < powerUps.length; i++) {
            if (powerUps[i].alive) {
                if (powerUps[i].x >= player.pos.x && powerUps[i].x <= (player.pos.x + player.width)) {
                    if (powerUps[i].y >= (player.pos.y - player.height) && powerUps[i].y <= player.pos.y + player.height / 2) {
                        if (!Game.muteSFX) {
                            Sounds.powerUp.play();
                        }
                        if (powerUps[i].type === "health") {
                            player.hp += 20;
                        } else if (powerUps[i].type === "fireRate") {
                            player.fireRate -= 0.09;
							GameLogic.fRate = true;
                        } else if (powerUps[i].type === "damage") {
                            player.damage += 1;
                        }
                        powerUps[i].alive = false;
                    }
                }
            }
        }
    };

    var checkShipCollision = function checkShipCollision() {
        var enemies = InPlay.enemies;
        var player = Character.ship.player;
        var playerPos = Character.ship.player.pos;
        var ship;
        
        for (ship = 0; ship < enemies.length; ship++) {
            if (Character.ship.player.hp > 0 && enemies[ship].alive) {
                // Proper collision detection - reasonable touch detection
                var enemyLeft = enemies[ship].x + enemies[ship].width * 0.2; // 20% margin
                var enemyRight = enemies[ship].x + enemies[ship].width * 0.8; // 20% margin
                var enemyTop = enemies[ship].y + enemies[ship].height * 0.2; // 20% margin
                var enemyBottom = enemies[ship].y + enemies[ship].height * 0.8; // 20% margin
                
                var playerLeft = playerPos.x + player.width * 0.2; // 20% margin
                var playerRight = playerPos.x + player.width * 0.8; // 20% margin
                var playerTop = playerPos.y - player.height * 0.4; // 40% margin
                var playerBottom = playerPos.y + player.height * 0.4; // 40% margin
                
                // Check if rectangles intersect (no gap = collision)
                var isColliding = !(enemyRight < playerLeft || 
                                   enemyLeft > playerRight || 
                                   enemyBottom < playerTop || 
                                   enemyTop > playerBottom);
                
                if (isColliding) {
                    console.log("Space Battle: Collision detected between player and enemy");
                    if (!Game.muteSFX) {
                        Sounds.playerHit.play();
                        Sounds.death.play();
                    }
                    // Enemy explodes immediately on contact
                    enemies[ship].alive = false;
                    GameLogic.addScore(enemies[ship].score);
                    
                    // Player takes damage
                    Character.ship.player.hp -= enemies[ship].hp;
                    
                    if (Character.ship.player.hp <= 0) {
                        if (!Game.muteSFX) {
                            Sounds.explosion.play();
                        }
                        GameLogic.gameOver();
                    }
                }
            }
        }
    };

    var gameOver = function gameOver() {
        var isHighscore = false;
        var enemies = InPlay.enemies;
        GameLogic.timer.stop();
        enemies.length = 0;
        Game.levelStarted = false;
        Game.gameOver = true;
        
        var finalScore = Math.floor(Character.ship.player.score);
        console.log("Space Battle: Game Over - Score: " + finalScore + ", Level: " + Game.level);
        
        if (Game.highscore < Character.ship.player.score) {
            isHighscore = true;
            Game.highscore = Character.ship.player.score;
            console.log("Space Battle: NEW HIGH SCORE! " + Math.floor(Game.highscore));
        }
        
        // Save all statistics to localStorage
        GameLogic.saveStats();
        
        // Cache rewarded ad for game over if not ready
        if (!window.isRVReady) {
            cacheAdRewarded();
            console.log("Space Battle: Game Over - Rewarded ad caching started");
        }
        
        // Rewarded continue flow at Game Over
        try {
            if (window.isRVReady === true && typeof window.MenuUI !== 'undefined') {
                // Ask user to continue via rewarded
                var onNoCallback = function() {
                    // User declined: post score + midroll
                    postScore(finalScore);
                    setTimeout(function(){ showAd(); }, 500);
                };
                window.MenuUI.requestRewarded('Continue with extra health by watching a video?', onNoCallback);
            } else {
                // Not ready → wait for ad to be ready, then show option
                var checkCount = 0;
                var maxChecks = 60; // 60 checks * 500ms = 30 seconds max wait
                var adReadyShown = false;
                
                var checkAdReady = setInterval(() => {
                    checkCount++;
                    
                    if (window.isRVReady === true && typeof window.MenuUI !== 'undefined') {
                        clearInterval(checkAdReady);
                        if (!adReadyShown) {
                            adReadyShown = true;
                            var onNoCallback = function() {
                                postScore(finalScore);
                                setTimeout(function(){ showAd(); }, 500);
                            };
                            window.MenuUI.requestRewarded('Continue with extra health by watching a video?', onNoCallback);
                        }
                    } else if (checkCount >= maxChecks) {
                        clearInterval(checkAdReady);
                        // Timeout: post score + midroll
                        postScore(finalScore);
                        setTimeout(function(){ showAd(); }, 500);
                    }
                }, 500);
            }
        } catch(e) { 
            console.log(e); 
            // Fallback: post score + midroll
            postScore(finalScore);
            setTimeout(function(){ showAd(); }, 500);
        }
        
        GameLogic.uploadStats(isHighscore);
        Game.screen = "game_over";
    };

    var uploadStats = function uploadStats(isHighscore) {
        if (isHighscore) {
            LSM.set("highscore", Game.highscore);
            Game.isHighscore = true;
        } else {
            Game.isHighscore = false;
        }
        LSM.set("scout", Game.scout);
        LSM.set("fighter", Game.fighter);
        LSM.set("interceptor", Game.interceptor);
        LSM.set("tank", Game.tank);
        LSM.set("transport", Game.transport);
    };

    var resetStats = function resetStats() {
        Game.highscore = 0;
        Game.scout = 0;
        Game.fighter = 0;
        Game.interceptor = 0;
        Game.tank = 0;
        Game.transport = 0;
        LSM.set("highscore", 0);
        LSM.set("scout", 0);
        LSM.set("fighter", 0);
        LSM.set("interceptor", 0);
        LSM.set("tank", 0);
        LSM.set("transport", 0);
        
        // Force refresh the display
        console.log("Space Battle: Statistics reset successfully");
        console.log("Highscore:", Game.highscore);
        console.log("Scout:", Game.scout);
        console.log("Fighter:", Game.fighter);
        console.log("Interceptor:", Game.interceptor);
        console.log("Tank:", Game.tank);
        console.log("Transport:", Game.transport);
        
        // Reload statistics to ensure they're properly updated
        LSM.load();
    };

    var checkCollisions = function checkCollisions() {
        GameLogic.checkShipCollision();
        GameLogic.checkBulletCollision();
        GameLogic.checkEnemiesDead();
        GameLogic.checkPickUp();
    };

    var spawnCheck = function spawnCheck(newShip, spawnTime) {
        var i, enemies, spawningY, verdict, time;
        verdict = true;
        time = spawnTime;
        spawningY = newShip;
        enemies = InPlay.enemies;
        if (enemies.length >= 1) {
            for (i = 0; i < enemies.length; i++) {
                if (time < enemies[i].time + 1) {
                    if (spawningY > enemies[i].y - 104 && spawningY < enemies[i].y + 104) {
                        verdict = false;
                    }
                }
            }
        }
        return verdict;
    };

    var addEnemies = function addEnemies() {
        var i, enemy, x, y, noEnemies, rate, selector, lvlSelector;
        // Proper space shooter enemy count progression
        noEnemies = Game.level * 6 + Math.floor(Game.level / 3) * 2;
        if (Game.level <= 5) {
            lvlSelector = Game.level;
        } else {
            lvlSelector = 5;
        }
        if (Game.level < 6) {
            rate = 1;
        } else {
            rate = 0.5;
        }
        var time = 0;
        GameLogic.level.startTime = Game.timer;
        for (i = 0; i < noEnemies; i++) {
            selector = Math.floor(Math.random() * (lvlSelector - 1 + 1) + 1);
            if (selector === 1) {
                enemy = GameLogic.clone(Character.ship.enemy.scout);
            } else if (selector === 2) {
                enemy = GameLogic.clone(Character.ship.enemy.fighter);
            } else if (selector === 3) {
				if (Game.level % 3 === 0) {
					enemy = GameLogic.clone(Character.ship.enemy.transport);
				} else {
					enemy = GameLogic.clone(Character.ship.enemy.scout);
				}
            } else if (selector === 4) {
                enemy = GameLogic.clone(Character.ship.enemy.tank);
            } else if (selector === 5) {
                enemy = GameLogic.clone(Character.ship.enemy.interceptor);
            }
            y = Math.floor(Math.random() * (Canvas.canvasHeight - 90)) + 1;
            if (GameLogic.spawnCheck(y, time)) {
                x = Canvas.canvasWidth + 100;
                enemy.y = y;
                enemy.x = x;
				enemy.hp += Game.level * (Math.floor(Game.level / 2) - 1);
                // Aggressive speed progression - 25% per level with base speed boost
                var baseSpeedBoost = 1.5; // 50% faster base speed
                var speedMultiplier = baseSpeedBoost + (Game.level - 1) * 0.25;
                enemy.speed = enemy.speed * speedMultiplier;
                
                // Also increase fire rate with level
                if (enemy.fireRate > 0) {
                    enemy.fireRate = Math.max(0.5, enemy.fireRate - (Game.level - 1) * 0.1);
                }
                enemy.time = time;
                time += rate;
                InPlay.enemies.push(enemy);
            } else {
                i--;
            }
        }
    };

    var level = {
        //functions
        start: startLevel,
        //variables
        startTime: 0
    };

    var GameLogic = {
        //functions
        clone: clone,
        spawnCheck: spawnCheck,
        addEnemies: addEnemies,
        checkBulletCollision: checkBulletCollision,
        checkShipCollision: checkShipCollision,
        checkPickUp: checkPickUp,
        checkCollisions: checkCollisions,
        checkEnemiesDead: checkEnemiesDead,
        dropPickUp: dropPickUp,
        addScore: addScore,
        gameOver: gameOver,
        uploadStats: uploadStats,
        resetStats: resetStats,
        //variables
        paused: false,
	fRate: false,
        level: level,
        timer: timer
    };
    return GameLogic;
});
