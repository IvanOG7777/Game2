import levels from "./Levels.js";
import paths from "./Paths.js";


function spawnEnemies(scene, movement, passedRows, passedCols, passedStartX, passedStartY) {
    
    // create local referneces of passed variables. I think i can just pass without, but i like it like this
    let ROWS = passedRows;
    let COLS = passedCols;
    let startX = passedStartX;
    let startY = passedStartY;

    // Spacing per enemy
    let spacingX = 120;
    let spacingY = 100;

    // Loop trough ros an cols which are given through Levels.js
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {

            //calculate correct x,y coord for enemy ship
            let x = startX + (col * spacingX);
            let y = startY + (row * spacingY);

            let ship = scene.add.sprite(x, y, "alienParts", "shipPink_manned.png").setScale(0.7); // add ship

            // index to calculate which enemy can shoot
            let index = row * COLS * 1.5;


            // All types of movements that can the group of enemies
            if (movement == "groupDown" || movement == "zigzagANDGroup" || movement == "zagzigANDGroup") {
                ship.canShoot = index % 2 == 0; // select index mod 2 ship to allow to shoot
            }

            // Give correct coordinates and push into array of enemies
            ship.x = x;
            ship.y = y;
            scene.enemies.push(ship);
        }
    }
}


function startWave(scene, waveNumber) {

    // If wave number is greated then the levels we win
    if (waveNumber > levels.length) {
        scene.my.sounds.engine1.stop();
        scene.my.sounds.engine2.stop();
        scene.my.sounds.music.stop();
        scene.my.sounds.winSound.play();
        scene.gameWon = true;
        scene.gameEnd = true;
        return;
    }

    if (!scene.waveText) {
        scene.waveText = scene.add.text(
        scene.game.config.width / 2, 600, `WAVE ${waveNumber}`, {
            fontSize: "50px",
            fill: "#00fd22"
        }).setOrigin(0.5);
    }

    //Chatgpt
    scene.time.delayedCall(2000, () => {
        if (scene.waveText) {
            scene.waveText.destroy();
            scene.waveText = null;
        }
    });
    //End of chat

    // pass wave number to class wave
    scene.currentWave = waveNumber;

    // grap current level form levels array
    let level = levels[scene.currentWave - 1];

    // reset enemy direction
    scene.enemyDirection = 1;

    // spawner for group movement
    if (level.movement == "groupDown") {
        scene.pathEnemiesSpawned = 0;
        scene.pathSpawnLimit = 0;
        spawnEnemies(scene, level.movement, level.rows, level.cols, level.startX, level.startY);
    }


    // spawner for zigzag movements
    if (level.movement == "zigzag" || level.movement == "zagzig") {

        scene.pathEnemiesSpawned = 0; // reset spawn counter
        scene.pathSpawnLimit = level.enemyCount; // get allowed of zigzag enemies to spawn
        scene.pathSpawnDelay = 1000; // spawn delay per spawn
        scene.pathTimer = 0;

        scene.points = paths[level.movement]; // set points from path.js
        scene.curve = new Phaser.Curves.Spline(scene.points); // give phaser the points to plot
    }

    // Use a mix of both above
    if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup") {
        spawnEnemies(scene, level.movement, level.rows, level.cols, level.startX, level.startY);

        scene.pathEnemiesSpawned = 0;
        scene.pathSpawnLimit = level.enemyCount;
        scene.pathSpawnDelay = 1000;
        scene.pathTimer = 0;

        scene.points = paths[level.movement];
        scene.curve = new Phaser.Curves.Spline(scene.points);
    }

    if (level.movement == "boss") {
        scene.pathEnemiesSpawned = 0; // reset spawn counter
        scene.pathSpawnLimit = level.enemyCount; // get allowed of zigzag enemies to spawn
        scene.pathSpawnDelay = 1000; // spawn delay per spawn
        scene.pathTimer = 0;

        scene.points = paths[level.movement]; // set points from path.js
        scene.curve = new Phaser.Curves.Spline(scene.points); // give phaser the points to plot
    }

    scene.enemySize = scene.enemies.length;
}

function checkWave(scene) {
    let nextWave = scene.currentWave + 1; // get next wave

    // ChatGPT
    let aliveEnemies = scene.enemies.filter(enemy => !enemy.isDead && enemy.active);
    // END OF CHAT

    // Infinite mode
    if (scene.infiniteMode) {
        if (aliveEnemies.length == 0 && scene.pathEnemiesSpawned >= scene.pathSpawnLimit) {
            // essentially restarting
            if (nextWave > levels.length) {
                nextWave = 1;
            }

            scene.speedUp = false;
            startWave(scene, nextWave);
        }
    }
    
    //For default mode
    if (nextWave > levels.length) { // check if greater then level count
        if (aliveEnemies.length == 0 && scene.pathEnemiesSpawned >= scene.pathSpawnLimit) {
            startWave(scene, nextWave);
        }
        return; 
    }

    let nextLevel = levels[nextWave - 1];
    if (scene.playerScore >= nextLevel.scoreNeeded) {
        startWave(scene, nextWave); // add next level
    }
}


function updateBasicEnemies(scene, deltaTime) {

    let dt = deltaTime / 1000;
    let moveAmount = scene.enemySpeed * dt;


    // play only one instance of engine1 so not all n amount are playing
    if (!scene.my.sounds.engine1.isPlaying) {
        scene.my.sounds.engine1.play({volume: 0.3, loop: true});
    }

    let touchedEdge = false;
    let level = levels[scene.currentWave - 1]; // get the current level

    //Grab necesarcy score to boost speed from level
    let levelSpeedBoostScore = level.speedBoostScore;

    if (scene.speedUp == false) {
        if (scene.playerScore >= levelSpeedBoostScore) {
            scene.enemySpeed *= 1.5;
            scene.speedUp = true;
        }
    }

    // loop though all enemies, and check if the next movement will hit the edge
    for (let enemy of scene.enemies) {
        let nextX = enemy.x + moveAmount * scene.enemyDirection;

        if (nextX - enemy.displayWidth / 2 <= 0) { // If one enemy touches left wall
            touchedEdge = true; // set to true
        }

        if (nextX + enemy.displayWidth / 2 >= scene.game.config.width) { // if one enemy touches right wall
            touchedEdge = true; // set to true
        }

    }

    if (touchedEdge == true) {// if true
        for (let enemy of scene.enemies) { // move each enemy down along the y axis
            enemy.y += scene.enemyDropAmount;
        }
        scene.enemyDirection *= -1; // change the direction, -1 left, 1 right
    }

    for (let enemy of scene.enemies) {
        enemy.x += moveAmount * scene.enemyDirection;
    }
}

function updatePathEnemies(scene, deltaTime) {
    scene.pathTimer += deltaTime;

    // play only one instance of engine1 so not all n amount are playing
    if (!scene.my.sounds.engine2.isPlaying) {
        scene.my.sounds.engine2.play({volume: 0.3, loop: true});
    }

    // check if spawned is less than limit and if we have to correct time to spawn
    if (scene.pathEnemiesSpawned < scene.pathSpawnLimit && scene.pathTimer >= scene.pathSpawnDelay) {
        let level = levels[scene.currentWave - 1];
        
        if (level.movement == "boss") {
            let bossEnemy = scene.add.follower(scene.curve, 10, 10, "alienParts", "shipBlue_manned.png").setScale(0.6); // add a follower to path
            bossEnemy.isBoss = true;
            bossEnemy.health = level.bossHealth;
            bossEnemy.canShoot = true;

            bossEnemy.visible = true;
            bossEnemy.x = scene.curve.points[0].x;
            bossEnemy.y = scene.curve.points[0].y;
            // start the follow
            bossEnemy.startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 7000 - (scene.currentWave * 500),
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true,
                rotateToPath: true,
                rotationOffset: -90
        });
        // add to array of enemies
        scene.enemies.push(bossEnemy);
        scene.pathEnemiesSpawned++;
        scene.pathTimer = 0;
    } else {
            
            let enemy = scene.add.follower(scene.curve, 10, 10, "alienParts", "shipYellow_manned.png").setScale(0.6); // add a follower to path
            enemy.visible = true;
            enemy.x = scene.curve.points[0].x;
            enemy.y = scene.curve.points[0].y;
            // start the follow
            enemy.startFollow({
                from: 0,
                to: 1,
                delay: 0,
                duration: 7000 - (scene.currentWave * 500),
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true,
                rotateToPath: true,
                rotationOffset: -90
            });
            // add to array of enemies
            scene.enemies.push(enemy);
            scene.pathEnemiesSpawned++;
            scene.pathTimer = 0;
        }
    }
}

function enemyShoot(scene, deltaTime) {
    scene.enemyShootTimer += deltaTime; // calculate timer for next shots
    scene.bossShootTimer += deltaTime;
    
    let playSound = false; // flag to allow for only one play sound instead of many

    // while timer is still less then delay keep returning
    if (scene.enemyShootTimer >= scene.enemyShootDelay) {
        // loop through enemies
        for (let enemy of scene.enemies) {
            if (enemy.canShoot == true && enemy.active) {
                let bullet = scene.add.sprite(enemy.x, enemy.y + 20, "spaceParts", "laserBlue01.png");
                bullet.setFlipY(true);
                scene.enemyBullets.push(bullet);

                if (!playSound) {
                    scene.my.sounds.enemyLaser.play();
                    playSound = true;
                }
            }
        }
        scene.enemyShootTimer = 0;
    }

    if (scene.bossShootTimer >= scene.bossShootDelay) {
        for (let enemy of scene.enemies) {

            if (enemy.isBoss) {
                let bullet = scene.add.sprite(enemy.x, enemy.y + 20, "spaceParts", "laserBlue01.png");
                bullet.isBossBullet = true;
                bullet.setFlipY(true);
                scene.enemyBullets.push(bullet);

                if (!playSound) {
                    scene.my.sounds.enemyLaser.play();
                    playSound = true;
                }
            }
        }
        scene.bossShootTimer = 0;
    }
}

function enemyOnPlayerCollision(scene) {
    if (scene.playerAlive == true) { // check if player is still alive
        //loop through each enemy bullet in scene
        for (let enemy of scene.enemies) {
            if (scene.collides(scene.my.sprite.spaceShip, enemy)) {


                if (scene.time.now - scene.lastHitTime < scene.hitDelay) {
                    return;
                }

                scene.lastHitTime = scene.time.now;
                scene.puff = scene.add.sprite(scene.my.sprite.spaceShip.x, scene.my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");
                scene.my.sounds.playerHit.play({volume: 2});
                
                scene.playerHealth--;
                scene.my.sprite.hearts[scene.playerHealth].setFrame(3);  // change heart in array to black heart

                // when player dies do this
                if (scene.playerHealth <= 0) {
                    scene.playerAlive = false;
                    scene.my.sounds.music.stop();
                    scene.my.sounds.engine1.stop();
                    scene.my.sounds.death2.play({volume: 0.8});
                    scene.my.sounds.deathMusic.play();

                    scene.my.sprite.spaceShip.visible = false;
                    scene.my.sprite.leftWing.visible = false;
                    scene.my.sprite.rightWing.visible = false;

                    scene.checkPlayerStatus(scene.playerAlive);
                }   
            }
        }
    }
}

function bulletOnPlayerCollision(scene) {
    if (scene.playerAlive == true) {// check if player is still alive
        //loop through each enemy bullet in scene
        for (let bullet of scene.enemyBullets) {
            if (scene.collides(scene.my.sprite.spaceShip, bullet)) { // check collision

                if (scene.time.now - scene.lastHitTime < scene.hitDelay) {
                    return;
                }

                scene.lastHitTime = scene.time.now;

                bullet.destroy();
                bullet.isDead = true;
                scene.my.sounds.playerHit.play({volume: 2});
                scene.puff = scene.add.sprite(scene.my.sprite.spaceShip.x, scene.my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");

                scene.playerHealth--;
                scene.my.sprite.hearts[scene.playerHealth].setFrame(3); // change heart in array to black heart
                
                // When player dies do this
                if (scene.playerHealth <= 0) {
                    scene.playerAlive = false;
                    scene.my.sounds.music.stop();
                    scene.my.sounds.engine1.stop();
                    scene.my.sounds.death1.play({volume: 1.0});
                    scene.my.sounds.deathMusic.play();

                    scene.my.sprite.spaceShip.visible = false;
                    scene.my.sprite.leftWing.visible = false;
                    scene.my.sprite.rightWing.visible = false;
                }
            }
        }
    }
}

function bulletOnEnemyCollision(scene) {
    // Bullet and enemy collision check
    for (let bullet of scene.my.sprite.bullet) { // loop through bullets
        for (let enemy of scene.enemies) { // loop through enemies
            if (scene.collides(enemy, bullet)) { // check if they collide

                if (enemy.isBoss == true) {
                    enemy.health--;
                    scene.puff = scene.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                    bullet.y = -1000;
                    bullet.isDead = true;

                    if (enemy.health <= 0) {
                        scene.puff = scene.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                        bullet.y = -1000;

                        enemy.destroy();
                        enemy.isDead = true;

                        scene.playerScore += 25;
                        scene.updateScore();

                        scene.my.sounds.death2.play({volume: 0.8});
                    }
                    break;
                }

                scene.puff = scene.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                bullet.y = -1000;

                enemy.destroy();
                enemy.isDead = true;

                scene.playerScore += 25;
                scene.updateScore();

                scene.my.sounds.death2.play({volume: 0.8});
            }
        }
    }
}

function enemyBulletUpdate(scene, smallDeltaTime) {

    let enemyBulletMoveAmount = scene.enemyBulletSpeed * smallDeltaTime;

    for (let bullet of scene.enemyBullets) {
        bullet.y += enemyBulletMoveAmount;
    }
    
    scene.enemyBullets = scene.enemyBullets.filter((bullet) => {
        if (bullet.y < scene.game.config.height + bullet.displayHeight) {
            return true;
        }
        
        bullet.destroy();
        return false;
    });
}


export {
    spawnEnemies,
    startWave,
    checkWave,
    updateBasicEnemies,
    updatePathEnemies,
    enemyShoot,
    enemyOnPlayerCollision,
    bulletOnPlayerCollision,
    bulletOnEnemyCollision,
    enemyBulletUpdate
};