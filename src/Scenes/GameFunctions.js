import levels from "./Levels.js";
import paths from "./Paths.js";


function spawnEnemies(scene, movement, passedRows, passedCols, passedStartX, passedStartY) {
    let ROWS = passedRows;
    let COLS = passedCols;
    let startX = passedStartX;
    let startY = passedStartY;
    let spacingX = 120;
    let spacingY = 100;

    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            let x = startX + (col * spacingX);
            let y = startY + (row * spacingY);

            let ship = scene.add.sprite(x, y, "enemyShip");
            let index = row * COLS * 1.5;

            if (movement == "groupDown") {
                ship.canShoot = index % 2 == 0;
            }

            ship.x = x;
            ship.y = y;
            scene.enemies.push(ship);
        }
    }
}

function startWave(scene, waveNumber) {

    if (waveNumber > levels.length) {
        scene.add.text(250, 450, "YOU WIN", {
            fontSize: "48px",
            fill: "#fcfcfc"
        });
        return;
    }

    scene.currentWave = waveNumber;

    let level = levels[scene.currentWave - 1];

    for (let bullet of scene.my.sprite.bullet) {
        bullet.destroy();
    }

    scene.my.sprite.bullet = [];

    scene.enemyDirection = 1;

    if (level.movement == "groupDown") {
        spawnEnemies(scene, level.movement, level.rows, level.cols, level.startX, level.startY);
    }

    if (level.movement == "zigzag" || level.movement == "zagzig") {
        scene.pathEnemiesSpawned = 0;
        scene.pathSpawnLimit = level.enemyCount;
        scene.pathSpawnDelay = 1000;
        scene.pathTimer = 0;

        scene.points = paths[level.movement];
        scene.curve = new Phaser.Curves.Spline(scene.points);
    }

    if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup") {
        spawnEnemies(scene, level.movement, level.rows, level.cols, level.startX, level.startY);

        scene.pathEnemiesSpawned = 0;
        scene.pathSpawnLimit = level.enemyCount;
        scene.pathSpawnDelay = 1000;
        scene.pathTimer = 0;

        scene.points = paths[level.movement];
        scene.curve = new Phaser.Curves.Spline(scene.points);
    }

    scene.enemySize = scene.enemies.length;
}

function checkWave(scene) {
    let nextWave = scene.currentWave + 1; // get next wave

    if (nextWave > levels.length) { // check if greater then level count
        return;
    }

    let nextLevel = levels[nextWave - 1]; // get next level

    if (scene.playerScore >= nextLevel.scoreNeeded) { // check player score
        startWave(scene, nextWave); // add next level
    }
}


function updateBasicEnemies(scene, deltaTime) {

    let dt = deltaTime / 1000;
    let moveAmount = scene.enemySpeed * dt;

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

    if (!scene.my.sounds.engine2.isPlaying) {
        scene.my.sounds.engine2.play({volume: 0.3, loop: true});
    }

    if (scene.pathEnemiesSpawned < scene.pathSpawnLimit && scene.pathTimer >= scene.pathSpawnDelay) {
        let enemy = scene.add.follower(scene.curve, 10, 10, "enemyShip");
        enemy.visible = true;
        enemy.x = scene.curve.points[0].x;
        enemy.y = scene.curve.points[0].y;
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
        scene.enemies.push(enemy);
        scene.pathEnemiesSpawned++;
        scene.pathTimer = 0;
    }
}

function enemyShoot(scene, deltaTime) {
    scene.enemyShootTimer += deltaTime;
    let playSound = false;

    if (scene.enemyShootTimer < scene.enemyShootDelay) {
        return;
    }

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

function enemyOnPlayerCollision(scene) {
    for (let enemy of scene.enemies) {
        if (scene.collides(scene.my.sprite.spaceShip, enemy)) {
            scene.puff = scene.add.sprite(scene.my.sprite.spaceShip.x, scene.my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");
            scene.playerAlive = false;
            scene.my.sounds.death2.play({volume: 0.8});

            scene.my.sprite.spaceShip.visible = false;
            scene.my.sprite.leftWing.visible = false;
            scene.my.sprite.rightWing.visible = false;

            scene.checkPlayerStatus(scene.playerAlive);
            let text = scene.add.text(scene.game.config.width / 2, scene.game.config.height / 2, "GAME OVER died to enemy collision", {
                fontSize: "48px",
                fill: "#ff0000"
            });
            text.setOrigin(0.5);
        }
    }
}

function bulletOnPlayerCollision(scene) {
    for (let bullet of scene.enemyBullets) {
        if (scene.collides(scene.my.sprite.spaceShip, bullet)) {
            bullet.destroy();
            bullet.isDead = true;

            scene.puff = scene.add.sprite(scene.my.sprite.spaceShip.x, scene.my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");

            scene.playerAlive = false;
            scene.my.sounds.death1.play({volume: 1.0});

            scene.my.sprite.spaceShip.visible = false;
            scene.my.sprite.leftWing.visible = false;
            scene.my.sprite.rightWing.visible = false;

            scene.add.text(250, 450, "GAME OVER died to laser", {fontSize: "48px", fill: "#ff0000"});
        }
    }
}

function bulletOnEnemyCollision(scene) {
    // Bullet and enemy collision check
    for (let bullet of scene.my.sprite.bullet) { // loop through bullets
        for (let enemy of scene.enemies) { // loop through enemies
            if (scene.collides(enemy, bullet)) { // check if they collide
                scene.puff = scene.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                bullet.y = -100;

                enemy.destroy();
                enemy.isDead = true;

                scene.playerScore += 25;
                scene.updateScore();

                scene.my.sounds.death2.play({volume: 0.8});
            }
        }
    }
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
    bulletOnEnemyCollision
};