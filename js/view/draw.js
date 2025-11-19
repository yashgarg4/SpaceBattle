define(["model/images", "model/canvas", "model/game", "model/character", "controller/gameLogic", "model/inPlay", "controller/action"],
    function (Images, Canvas, Game, Character, GameLogic, InPlay, Action) {
        var drawStars = function drawStars() {
            var i, size, x, y, alpha, ctx;
            ctx = Canvas.context;
            for (i = 0; i < Game.stars.length; i += 1) {
                if (Game.stars[i].x < 0) {
                    Game.stars[i] = Game.generateStar(true);
                }
                size = Game.stars[i].speed * 0.8; // Bigger stars
                x = Game.stars[i].x;
                y = Game.stars[i].y;
                alpha = 0.3 + (Game.stars[i].speed / 8); // Variable brightness
                
                // Draw star with glow effect
                ctx.save();
                ctx.shadowColor = "rgba(200, 220, 255, " + alpha + ")";
                ctx.shadowBlur = size * 2;
                
                // Draw bright core
                ctx.fillStyle = "rgba(255, 255, 255, " + alpha + ")";
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                Game.stars[i].x -= Game.stars[i].speed;
            }
        };

        var drawBackground = function drawBackground() {
            var mousex, mousey;
            mousex = Game.mouse.pos.x;
            mousey = Game.mouse.pos.Y;
            //Black space
            Canvas.context.fillStyle = "#000000";
            Canvas.context.fillRect(0, 0, Canvas.canvas.width, Canvas.canvas.height);
            //Debris/Stars
            drawStars();
        };
        var drawMainMenu = function drawMainMenu() {
            // Legacy canvas main menu is disabled on smartphone.
            // The HTML/CSS overlay (MenuUI) handles the main menu.
            // Just draw background so the canvas doesn't show old UI.
            Draw.drawBackground();
        };

        var drawOptions = function drawOptions() {
            var part1, part2, muteMusic, muteSFX, mainMenu;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            var mouseX = Game.mouse.pos.x;
            var mouseY = Game.mouse.pos.y;
            //Button animation
            // FIXED: Swap button images - muteMusic0 shows OFF state, muteMusic1 shows ON state
            // When music is ON (muteMusic = false), show muteMusic1 (ON button image)
            // When music is OFF (muteMusic = true), show muteMusic0 (OFF button image)
            if (Game.muteMusic) {
                // Music is OFF (muted), show OFF button (muteMusic0)
                muteMusic = Images.muteMusic0;
            } else {
                // Music is ON (not muted), show ON button (muteMusic1)
                muteMusic = Images.muteMusic1;
            }
            // FIXED: Swap button images - muteSFX0 shows OFF state, muteSFX1 shows ON state
            if (Game.muteSFX) {
                // SFX is OFF (muted), show OFF button (muteSFX0)
                muteSFX = Images.muteSFX0;
            } else {
                // SFX is ON (not muted), show ON button (muteSFX1)
                muteSFX = Images.muteSFX1;
            }

            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                mainMenu = Images.mainMenu1;
            } else {
                mainMenu = Images.mainMenu0;
            }
            //drawing button
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.drawImage(Images.bigLogo, part1 * 1.1, part2 * 0.1, part1 * 1.8, part2);
            Canvas.context.drawImage(muteMusic, part1 * 1.2, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(muteSFX, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(mainMenu, part1 * 2.1, part2 * 2, part1 * 0.75, part2 * 0.7);
        };

        var drawMenu = function drawMenu() {
            // If HTML MenuUI is present, avoid drawing legacy menus
            if (typeof window !== "undefined" && window.MenuUI && (!window.MenuUI.overlay || !window.MenuUI.overlay.classList.contains("hidden"))) {
                Draw.drawBackground();
                return;
            }
            switch (Game.screen) {
            case "main_menu":
                // Do not render legacy canvas main menu; HTML overlay handles it
                Draw.drawBackground();
                break;
            case "game_over":
                Draw.drawGameOver();
                break;
            case "options":
                Draw.drawOptions();
                break;
            case "stats":
                Draw.drawStats();
                break;
            case "paused":
                Draw.drawPause();
                break;
            default:
                break;
            }
        };

        var drawPlayerShip = function drawPlayerShip() {
            var ctx = Canvas.context;
            var x = Character.ship.player.pos.x;
            var y = Character.ship.player.pos.y;
            var width = Character.ship.player.width;
            var height = Character.ship.player.height;
            var frame = Character.ship.player.frame;
            
            if (Character.ship.player.hp > 0) {
                // Draw custom modern spaceship
                ctx.save();
                
                // Ship body - main fuselage
                var gradient = ctx.createLinearGradient(x, y - height/2, x + width, y + height/2);
                gradient.addColorStop(0, "#00ccff");
                gradient.addColorStop(0.5, "#0088ff");
                gradient.addColorStop(1, "#0044aa");
                
                // Main body (streamlined)
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(x + width, y); // Nose point
                ctx.lineTo(x + width * 0.3, y - height * 0.4); // Top left
                ctx.lineTo(x, y - height * 0.25); // Top back
                ctx.lineTo(x, y + height * 0.25); // Bottom back
                ctx.lineTo(x + width * 0.3, y + height * 0.4); // Bottom left
                ctx.closePath();
                ctx.fill();
                
                // Cockpit (glowing)
                ctx.fillStyle = "#00ffff";
                ctx.shadowColor = "#00ffff";
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.ellipse(x + width * 0.7, y, width * 0.15, height * 0.2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Wings (top and bottom)
                ctx.fillStyle = "#0066cc";
                // Top wing
                ctx.beginPath();
                ctx.moveTo(x + width * 0.4, y - height * 0.3);
                ctx.lineTo(x + width * 0.2, y - height * 0.6);
                ctx.lineTo(x, y - height * 0.5);
                ctx.lineTo(x + width * 0.3, y - height * 0.25);
                ctx.closePath();
                ctx.fill();
                
                // Bottom wing
                ctx.beginPath();
                ctx.moveTo(x + width * 0.4, y + height * 0.3);
                ctx.lineTo(x + width * 0.2, y + height * 0.6);
                ctx.lineTo(x, y + height * 0.5);
                ctx.lineTo(x + width * 0.3, y + height * 0.25);
                ctx.closePath();
                ctx.fill();
                
                // Engine glow (animated)
                var engineGlow = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
                ctx.fillStyle = "rgba(255, 100, 0, " + engineGlow + ")";
                ctx.shadowColor = "#ff6600";
                ctx.shadowBlur = 20;
                ctx.beginPath();
                ctx.ellipse(x + width * 0.05, y, width * 0.12, height * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
                
                // Engine exhaust particles
                ctx.fillStyle = "rgba(255, 150, 0, 0.6)";
                ctx.beginPath();
                ctx.ellipse(x - 5, y, 8, 12, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
                
                // Frame animation
                Character.ship.player.frame += 1;
                if (Character.ship.player.frame >= 4) {
                    Character.ship.player.frame = 0;
                }
            } else {
                // Explosion animation
                var sprite = Images.explosion;
                var sx, sy;
				width = 192;
				height = 192;
                sy = 0;
                
				if (frame === 0) {
                    sx = 0;
                } else if (frame <= 1) {
                    sx = 192;
                } else if (frame <= 2) {
                    sx = 384;
                } else if (frame <= 3) {
                    sx = 576;
                } else if (frame <= 4) {
                    sx = 768;
                } else if (frame <= 5) {
                    sx = 960;
                } else if (frame <= 6) {
                    sx = 0;
					sy = 192;
                } else if (frame <= 7) {
                    sx = 192;
					sy = 192;
                }
                Character.ship.player.frame += 0.2;
                ctx.drawImage(sprite, sx, sy, width, height, x, y - (height / 2), width, height);
			}
        };

        var drawPowerups = function drawPowerups() {
            var i;
            var powerUps = InPlay.powerUps;
            for (i = 0; i < powerUps.length; i += 1) {
                if (powerUps[i].alive) {
                    Canvas.context.drawImage(powerUps[i].icon, powerUps[i].x, powerUps[i].y);
                    if (powerUps[i].x <= -10) {
                        powerUps[i].alive = false;
                    } else {
                        powerUps[i].x -= 4;
                    }
                }
            }
        };

        var drawEnemies = function drawEnemies() {
            var i, relativeTime;
            var enemies = InPlay.enemies;
            for (i = 0; i < enemies.length; i += 1) {
                if (enemies[i].alive) {
                    relativeTime = Game.timer - GameLogic.level.startTime;
                    if (relativeTime > enemies[i].time) {
                        // Rotate enemy ships to face horizontally (perpendicular to player)
                        Canvas.context.save();
                        Canvas.context.translate(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2);
                        Canvas.context.rotate(Math.PI/2); // 90 degree rotation to face horizontally
                        Canvas.context.drawImage(enemies[i].ship, -enemies[i].width/2, -enemies[i].height/2);
                        Canvas.context.restore();
                        if (enemies[i].x <= -140) {
                            enemies[i].alive = false;
                            Character.ship.player.score -= enemies[i].score * 1.4;
                        } else {
                            enemies[i].x -= enemies[i].speed;
                            if (enemies[i].name === "interceptor") {
								if (enemies[i].x > Canvas.canvasWidth/2) {
									if (enemies[i].y + 2 < Character.ship.player.pos.y - 49.5) {
										enemies[i].y += 2;
									} else if (enemies[i].y - 2 > Character.ship.player.pos.y - 49.5) {
										enemies[i].y -= 2;
									}
								}
                            }
                            if (enemies[i].fireRate > 0) {
                                if ((relativeTime-enemies[i].time) % enemies[i].fireRate <= 0.02) {
                                    enemies[i].hasShot = true;
                                    Action.enemyShoot(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height, enemies[i].damage);
                                }
                            }
                        }
                    }
                }
            }
        };

        var drawBullets = function drawBullets() {
            var i;
            var playerBullets = InPlay.playerBullets;
            var enemyBullets = InPlay.enemyBullets;
            for (i = 0; i < playerBullets.length; i += 1) {
                if (playerBullets[i].alive) {
                    Canvas.context.drawImage(playerBullets[i].type, playerBullets[i].x, playerBullets[i].y);
                    if (playerBullets[i].x >= Canvas.canvasWidth) {
                        playerBullets.shift();
                    } else {
                        playerBullets[i].x += 40;
                    }
                }
            }
            for (i = 0; i < enemyBullets.length; i += 1) {
                if (enemyBullets[i].alive) {
                    Canvas.context.drawImage(enemyBullets[i].type, enemyBullets[i].x, enemyBullets[i].y);
                    if (enemyBullets[i].x <= 0) {
                        enemyBullets.shift();
                    } else {
                        enemyBullets[i].x -= 10;
                    }
                }
            }
        };

        var drawScore = function drawScore() {
            var score = Math.floor(Character.ship.player.score);
            var ctx = Canvas.context;
            var cw = Canvas.canvasWidth;
            var ch = Canvas.canvasHeight;
            
            // Responsive sizing - matching feature phone style
            var panelWidth = Math.max(90, Math.min(cw * 0.22, 110));
            var panelHeight = Math.max(28, Math.min(ch * 0.055, 35));
            var labelFontSize = Math.max(9, Math.min(cw / 90, 11));
            var valueFontSize = Math.max(14, Math.min(cw / 45, 18));
            var margin = 5;
            
            ctx.save();
            
            // Position: top right corner (like feature phone)
            var posX = cw - panelWidth - margin;
            var posY = margin;
            
            // Background - blue style matching feature phone
            ctx.fillStyle = "rgba(0, 53, 102, 0.7)";
            ctx.fillRect(posX, posY, panelWidth, panelHeight);
            
            // Border - cyan blue style matching feature phone
            ctx.strokeStyle = "#00b4d8";
            ctx.lineWidth = 1;
            ctx.strokeRect(posX, posY, panelWidth, panelHeight);
            
            // Score label
            ctx.fillStyle = "#90e0ef";
            ctx.font = "bold " + labelFontSize + "px Arial";
            ctx.textAlign = "left";
            ctx.fillText("SCORE", posX + 5, posY + 10);
            
            // Score value
            ctx.fillStyle = "#ffd60a";
            ctx.font = "bold " + valueFontSize + "px Arial";
            ctx.textAlign = "right";
            ctx.fillText(score, posX + panelWidth - 5, posY + panelHeight - 5);
            
            ctx.restore();
        };

        var drawHP = function drawHP() {
            var hp = Math.floor(Character.ship.player.hp);
            var maxHp = 100;
            var ctx = Canvas.context;
            var cw = Canvas.canvasWidth;
            var ch = Canvas.canvasHeight;
            
            // Responsive sizing - matching feature phone style
            var panelWidth = Math.max(85, Math.min(cw * 0.21, 105));
            var panelHeight = Math.max(28, Math.min(ch * 0.055, 35));
            var labelFontSize = Math.max(9, Math.min(cw / 90, 11));
            var valueFontSize = Math.max(9, Math.min(cw / 70, 11));
            var margin = 5;
            
            ctx.save();
            
            // Position: top left corner (like feature phone)
            var posX = margin;
            var posY = margin;
            
            // Background - blue style matching feature phone
            ctx.fillStyle = "rgba(0, 53, 102, 0.7)";
            ctx.fillRect(posX, posY, panelWidth, panelHeight);
            
            // Border - cyan blue style matching feature phone
            ctx.strokeStyle = "#00b4d8";
            ctx.lineWidth = 1;
            ctx.strokeRect(posX, posY, panelWidth, panelHeight);
            
            // HP label
            ctx.fillStyle = "#90e0ef";
            ctx.font = "bold " + labelFontSize + "px Arial";
            ctx.textAlign = "left";
            ctx.fillText("HEALTH", posX + 5, posY + 10);
            
            // HP bar background
            var barX = posX + 5;
            var barY = posY + 14;
            var barWidth = panelWidth - 10;
            var barHeight = 10;
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // HP bar - color based on health (matching feature phone colors)
            var hpWidth = (hp / maxHp) * barWidth;
            var hpColor = hp > 60 ? "#00ff41" : hp > 30 ? "#ffd60a" : "#dc2f02";
            ctx.fillStyle = hpColor;
            ctx.fillRect(barX, barY, hpWidth, barHeight);
            
            // HP percentage text
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold " + valueFontSize + "px Arial";
            ctx.textAlign = "center";
            ctx.fillText(hp + "%", barX + barWidth / 2, barY + 8);
            
            ctx.restore();
        };

        var drawGameOver = function drawGameOver() {
            var ctx = Canvas.context;
            var cw = Canvas.canvasWidth;
            var ch = Canvas.canvasHeight;
            var mouseX = Game.mouse.pos.x;
            var mouseY = Game.mouse.pos.y;
            
            Draw.drawPlayerShip();
            
            ctx.save();
            
            // Dark overlay
            ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
            ctx.fillRect(0, 0, cw, ch);
            
            // Modern panel
            var panelW = Math.min(cw * 0.9, 450);
            var panelH = ch * 0.65;
            var panelX = (cw - panelW) / 2;
            var panelY = (ch - panelH) / 2;
            
            // Panel background with gradient
            var gradient = ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelH);
            gradient.addColorStop(0, "rgba(30, 10, 10, 0.95)");
            gradient.addColorStop(1, "rgba(50, 15, 15, 0.95)");
            ctx.fillStyle = gradient;
            ctx.fillRect(panelX, panelY, panelW, panelH);
            
            // Panel border with glow
            ctx.shadowColor = "rgba(255, 50, 50, 0.8)";
            ctx.shadowBlur = 25;
            ctx.strokeStyle = "rgba(255, 50, 50, 0.9)";
            ctx.lineWidth = 3;
            ctx.strokeRect(panelX, panelY, panelW, panelH);
            ctx.shadowBlur = 0;
            
            // GAME OVER title - responsive
            var titleFontSize = Math.max(20, Math.min(cw / 13, 48));
            var badgeFontSize = Math.max(14, Math.min(cw / 28, 22));
            var statsFontSize = Math.max(12, Math.min(cw / 32, 18));
            var scoreFontSize = Math.max(16, Math.min(cw / 25, 28));
            var btnFontSize = Math.max(14, Math.min(cw / 30, 20));
            
            ctx.shadowColor = "rgba(255, 0, 0, 0.9)";
            ctx.shadowBlur = Math.min(35, cw / 15);
            ctx.font = "bold " + titleFontSize + "px Arial";
            ctx.fillStyle = "#ff3333";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("GAME OVER", cw / 2, panelY + panelH * 0.18);
            ctx.shadowBlur = 0;
            
            // High Score badge
            if (Game.isHighscore) {
                ctx.shadowColor = "rgba(255, 215, 0, 0.8)";
                ctx.shadowBlur = 20;
                ctx.font = "bold " + badgeFontSize + "px Arial";
                ctx.fillStyle = "#FFD700";
                ctx.fillText("★ NEW HIGH SCORE! ★", cw / 2, panelY + panelH * 0.28);
                ctx.shadowBlur = 0;
            }
            
            // Stats - responsive
            ctx.font = "bold " + statsFontSize + "px Arial";
            ctx.fillStyle = "rgba(200, 220, 255, 0.9)";
            ctx.fillText("LEVEL: " + Game.level, cw / 2, panelY + panelH * 0.4);
            
            ctx.font = "bold " + scoreFontSize + "px Arial";
            ctx.fillStyle = "#ffaa00";
            ctx.fillText("SCORE: " + Math.floor(Character.ship.player.score), cw / 2, panelY + panelH * 0.5);
            
            // Buttons - responsive sizing
            var btnW = Math.min(panelW * 0.75, 280);
            var btnH = Math.max(ch * 0.06, 35);
            var btnX = cw / 2 - btnW / 2;
            var btnSpacing = Math.max(10, ch * 0.02);
            var btn1Y = panelY + panelH * 0.62;
            var btn2Y = btn1Y + btnH + btnSpacing;
            
            // RESTART button
            var isRestartHovered = mouseX >= btnX && mouseX <= btnX + btnW && 
                                   mouseY >= btn1Y && mouseY <= btn1Y + btnH;
            if (isRestartHovered) {
                ctx.shadowColor = "#44ff44";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#44ff44";
            } else {
                ctx.fillStyle = "rgba(40, 80, 40, 0.7)";
            }
            ctx.fillRect(btnX, btn1Y, btnW, btnH);
            ctx.strokeStyle = isRestartHovered ? "#44ff44" : "rgba(100, 200, 100, 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(btnX, btn1Y, btnW, btnH);
            ctx.shadowBlur = 0;
            
            ctx.font = "bold " + btnFontSize + "px Arial";
            ctx.fillStyle = isRestartHovered ? "#000" : "#fff";
            ctx.textBaseline = "middle";
            ctx.fillText("RESTART", cw / 2, btn1Y + btnH / 2);
            
            // MAIN MENU button
            var isMenuHovered = mouseX >= btnX && mouseX <= btnX + btnW && 
                                mouseY >= btn2Y && mouseY <= btn2Y + btnH;
            if (isMenuHovered) {
                ctx.shadowColor = "#00aaff";
                ctx.shadowBlur = 20;
                ctx.fillStyle = "#00aaff";
            } else {
                ctx.fillStyle = "rgba(20, 40, 80, 0.7)";
            }
            ctx.fillRect(btnX, btn2Y, btnW, btnH);
            ctx.strokeStyle = isMenuHovered ? "#00aaff" : "rgba(100, 150, 200, 0.5)";
            ctx.lineWidth = 2;
            ctx.strokeRect(btnX, btn2Y, btnW, btnH);
            ctx.shadowBlur = 0;
            
            ctx.font = "bold " + btnFontSize + "px Arial";
            ctx.fillStyle = isMenuHovered ? "#000" : "#fff";
            ctx.textBaseline = "middle";
            ctx.fillText("MAIN MENU", cw / 2, btn2Y + btnH / 2);
            
            ctx.restore();
        };

        var drawStats = function drawStats() {
            var part1, part2, mainMenu, resetStats, mouseX, mouseY;
            part1 = Canvas.canvasWidth / 4;
            part2 = Canvas.canvasHeight / 4;
            mouseX = Game.mouse.pos.x;
            mouseY = Game.mouse.pos.y;
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 && mouseY <= part2 + part2 * 0.7) {
                mainMenu = Images.mainMenu1;
            } else {
                mainMenu = Images.mainMenu0;
            }
            if (mouseX >= part1 * 2.1 && mouseX <= part1 * 2.1 + part1 * 0.75 && mouseY >= part2 * 2 && mouseY <= part2 * 2 + part2 * 0.7) {
                resetStats = Images.resetStats1;
            } else {
                resetStats = Images.resetStats0;
            }
            Canvas.context.drawImage(Images.blueMetal, part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.fillStyle = 'rgba(0,0,0,0.5)';
            Canvas.context.fillRect(part1, 0, part1 * 2, part2 * 3.5);
            Canvas.context.fillStyle = 'yellow';
            Canvas.context.drawImage(mainMenu, part1 * 2.1, part2, part1 * 0.75, part2 * 0.7);
            Canvas.context.drawImage(resetStats, part1 * 2.1, part2 * 2, part1 * 0.75, part2 * 0.7);
            Canvas.context.fillText("Highscore: " + Game.highscore, part1 * 1.1, part2 * 0.5);
            Canvas.context.fillText("Enemies killed", part1 * 1.1, part2);
            Canvas.context.fillText("Scout: " + Game.scout, part1 * 1.1, part2 * 1.40);
            Canvas.context.fillText("Fighter: " + Game.fighter, part1 * 1.1, part2 * 1.70);
            Canvas.context.fillText("Interceptor: " + Game.interceptor, part1 * 1.1, part2 * 2);
            Canvas.context.fillText("Tank: " + Game.tank, part1 * 1.1, part2 * 2.30);
            Canvas.context.fillText("Transporter: " + Game.transport, part1 * 1.1, part2 * 2.60);
        };

        var drawPause = function drawPause() {
            Canvas.context.drawImage(Images.pauseScreen, 0, 0, Canvas.canvasWidth, Canvas.canvasHeight);
        };

        var drawGame = function drawGame() {
            if (Game.levelStarted) {
                Draw.drawScore();
                Draw.drawHP();
            } else {
                // Modern level transition screen - fully responsive
                var ctx = Canvas.context;
                var cw = Canvas.canvasWidth;
                var ch = Canvas.canvasHeight;
                
                ctx.save();
                
                // Dark overlay
                ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
                ctx.fillRect(0, 0, cw, ch);
                
                // Responsive font sizes
                var completeFontSize = Math.max(16, Math.min(cw / 18, 32));
                var levelFontSize = Math.max(24, Math.min(cw / 10, 60));
                var subtitleFontSize = Math.max(12, Math.min(cw / 28, 20));
                
                // Congratulations (only after level 1)
                if (Game.level > 1) {
                    ctx.shadowColor = "rgba(0, 255, 100, 0.8)";
                    ctx.shadowBlur = Math.min(30, cw / 20);
                    ctx.font = "bold " + completeFontSize + "px Arial";
                    ctx.fillStyle = "#00ff66";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText("★ LEVEL COMPLETE! ★", cw / 2, ch / 2 - ch * 0.12);
                    ctx.shadowBlur = 0;
                }
                
                // Level number with glow effect
                ctx.shadowColor = "rgba(255, 215, 0, 0.9)";
                ctx.shadowBlur = Math.min(35, cw / 15);
                ctx.font = "bold " + levelFontSize + "px Arial";
                ctx.fillStyle = "#FFD700";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText("LEVEL " + Game.level, cw / 2, ch / 2);
                
                // Get ready message
                ctx.shadowBlur = 0;
                ctx.font = subtitleFontSize + "px Arial";
                ctx.fillStyle = "rgba(200, 220, 255, 0.9)";
                ctx.fillText("Prepare for Battle...", cw / 2, ch / 2 + ch * 0.1);
                
                ctx.restore();
            }
            // Proper space shooter rendering order: player behind enemies, bullets on top
            Draw.drawPlayerShip();
            Draw.drawEnemies();
            Draw.drawBullets();
            Draw.drawPowerups();
        };

        var Draw = {
            //functions

            drawStars: drawStars,
            drawBackground: drawBackground,
            drawHP: drawHP,
            drawScore: drawScore,
            drawPlayerShip: drawPlayerShip,
            drawEnemies: drawEnemies,
            drawPowerups: drawPowerups,
            drawBullets: drawBullets,
            drawGame: drawGame,
            drawMainMenu: drawMainMenu,
            drawOptions: drawOptions,
            drawMenu: drawMenu,
            drawStats: drawStats,
            drawPause: drawPause,
            drawGameOver: drawGameOver
        };

        return Draw;
    });