import levels from "./Levels.js";
import paths from "./Paths.js";

class GalleryShooter extends Phaser.Scene {

    graphics;
    curve;
    path;
    constructor() {
        super("Main Scene")
        console.log("Constructor");

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];
        this.maxBullets = 5;
        this.playerScore = 0;

        this.enemyBullets = [];
        this.enemyShootTimer = 0;
        this.enemyShootDelay = 4500;
        this.enemyBulletSpeed = 300;
        this.bossDead = false;

        this.currentWave = 1;
        this.enemies = [];
        this.enemySize;
        this.pathEnemiesSpawned = 0;
        this.pathSpawnDelay = 1000;
        this.pathTimer = 0;
        this.pathSpawnLimit;
        this.pathToUse;
        this.speedUp = false;
        this.boss = null;

        // init ship position
        this.cockpitX = 350;
        this.cockpitY = 800;
        this.wingRightX = 396;
        this.wingRightY = 800;
        this.wingLeftX = 304;
        this.wingLeftY = 800;
        
        //init shot position
        this.playerShotX = 350;
        this.playerShotY = 890;
        this.playerAlive = true;

        this.enemyDirection = 1;
        this.enemySpeed = 150;
        this.enemyDropAmount = 15;
        this.edgeHandled = false;
    }

    preload() {
        this.load.setPath("./assets/"); // loading assets

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets
        this.load.image("enemyShip", "enemyGreen1.png");       // spaceship that runs along the path

        // loading necessary audios
        this.load.audio("laser", "laser5.ogg");
        this.load.audio("death1", "spaceTrash4.ogg");
        this.load.audio("death2", "explosionCrunch_000.ogg");
        this.load.audio("engine1", "spaceEngineLow_002.ogg");
        this.load.audio("engine2", "spaceEngineSmall_001.ogg");

        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // loading score font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {

        let my = this.my;

        // Assets
        let cockpit = my.sprite.spaceShip = this.add.sprite(this.cockpitX, this.cockpitY, "spaceParts", "cockpitRed_4.png");
        let rightWing = my.sprite.rightWing = this.add.sprite(this.wingRightX, this.wingRightY, "spaceParts", "wingRed_4.png");
        let leftWing = my.sprite.leftWing = this.add.sprite(this.wingLeftX, this.wingLeftY, "spaceParts", "wingRed_4.png");

        // Assets changes
        rightWing.flipX = true;
        rightWing.angle = 180;
        leftWing.angle = -180


        //Action Buttons
        this.moveLeft = this.input.keyboard.addKey('A');
        this.moveLeftArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.moveRight = this.input.keyboard.addKey('D');
        this.moveRightArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.shoot = this.input.keyboard.addKey('space');
        this.rKey = this.input.keyboard.addKey('R');

        my.text.score = this.add.bitmapText(450, 10,  "rocketSquare", "Score " + this.playerScore);

        this.zigzagPath = paths.zigzag;
        this.zagzigPath = paths.zagzig;
        this.bossPath = paths.boss;

        let currentLevel = levels[this.currentWave - 1];
        let movementName = currentLevel.movement;

        if (movementName != "groupDown") {
            this.points = paths[movementName];
            this.curve = new Phaser.Curves.Spline(this.points);

            this.graphics = this.add.graphics();

            this.xImages = [];
            this.drawPoints();
            this.drawLine();

            my.sprite.enemyShip = this.add.follower(this.curve, 10, 10, "enemyShip");
            my.sprite.enemyShip.visible = false;
        }

        this.isRunning = false;

        this.startWave(1);

        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,
            repeat: 5,
            hideOnComplete: true
        });

    }

    spawnEnemies(movement, passedRows, passedCols, passedStartX, passedStartY) {
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

                let ship = this.add.sprite(x, y, "enemyShip");
                let index = row * COLS * 1.5;
                console.log(index);
                if (movement == "groupDown") {
                    ship.canShoot = index % 2 == 0;
                }
                ship.x = x;
                ship.y = y;
                this.enemies.push(ship);
            }
        }
    }

    startWave(waveNumber) {
        if (waveNumber > levels.length) {
            this.add.text(250, 450, "YOU WIN", {
                    fontSize: "48px",
                    fill: "#fcfcfc"
                });
                return;
        }

        this.currentWave = waveNumber;

        let level = levels[this.currentWave - 1];

        for (let bullet of this.my.sprite.bullet) {
            bullet.destroy();
        }

        this.my.sprite.bullet = [];

        this.enemyDirection = 1;

        if(level.movement == "groupDown") {
            this.spawnEnemies(level.movement, level.rows, level.cols, level.startX, level.startY);
        }

        if (level.movement == "zigzag" || level.movement == "zagzig") {
            this.pathEnemiesSpawned = 0;
            this.pathSpawnLimit = level.enemyCount;
            this.pathSpawnDelay = 1000;
            this.pathTimer = 0;

            this.points = paths[level.movement];
            this.curve = new Phaser.Curves.Spline(this.points);
        }

        if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup") {
            this.spawnEnemies(level.movement, level.rows, level.cols, level.startX, level.startY);

            this.pathEnemiesSpawned = 0;
            this.pathSpawnLimit = level.enemyCount;
            this.pathSpawnDelay = 1000;
            this.pathTimer = 0;
            
            this.points = paths[level.movement];
            this.curve = new Phaser.Curves.Spline(this.points);
        }

        this.enemySize = this.enemies.length;
    }

    checkWave() {
        let nextWave = this.currentWave + 1; // get enxt wave

        if (nextWave > levels.length) { // check if greater then level count
            return;
        }

        let nextLevel = levels[nextWave - 1]; // get next level

        if (this. playerScore >= nextLevel.scoreNeeded) { // check player score
            this.startWave(nextWave); // add next level
            console.log("Starting next wave");
        }
    }

    updateBasicEnemies(deltaTime) {
        let destoryCount = 0;
        let dt = deltaTime / 1000;
        let moveAmount = this.enemySpeed * dt;
        let touchedEdge = false;
        let level = levels[this.currentWave - 1];
        let levelScore = level.speedBoostScore;

        if (this.speedUp == false) {
            if (this.playerScore >= levelScore) {
                this.enemySpeed *= 2;
                this.speedUp = true;
            }
        }

        for (let enemy of this.enemies) { // loop though all enemies
            enemy.x += moveAmount * this.enemyDirection;

            if (enemy.x - enemy.displayWidth / 2 <= 0) { // If one enemy touches left wall
                touchedEdge = true; // set to true
            }

            if (enemy.x + enemy.displayWidth / 2 >= this.game.config.width) { // if one enemy touches right wall
                touchedEdge = true; // set to true
            }

        }

        if (touchedEdge == true && this.edgeHandled == false) {// if true
            for (let enemy of this.enemies) { // move each enemy down along the y axis
                enemy.y += this.enemyDropAmount;
            }
            this.enemyDirection *= -1; // change the direction, -1 left, 1 right
            this.edgeHandled = true;
        }
        if (touchedEdge == false) {
            this.edgeHandled = false;
        }
    }

    updatePathEnemies(deltaTime) {
        this.pathTimer += deltaTime;

        if (this.pathEnemiesSpawned < this.pathSpawnLimit && this.pathTimer >= this.pathSpawnDelay) {
            let enemy = this.add.follower(this.curve, 10, 10, "enemyShip");
            enemy.canShoot = this.pathEnemiesSpawned % 5 == 0;
            enemy.visible = true;
            enemy.x = this.curve.points[0].x;
            enemy.y = this.curve.points[0].y;
            enemy.startFollow({
            from: 0,
            to: 1,
            delay: 0,
            duration: 7000 - (this.currentWave * 500),
            ease: 'Sine.easeInOut',
            repeat: -1,
            yoyo: true,
            rotateToPath: true,
            rotationOffset: -90
        });
        this.enemies.push(enemy);
        this.pathEnemiesSpawned++;
        this.pathTimer = 0;
    }
}

    enemyShoot(deltaTime) {
        this.enemyShootTimer += deltaTime;

        if (this.enemyShootTimer < this.enemyShootDelay) {
            return;
        }

        for (let enemy of this.enemies) {
            if (enemy.canShoot == true && enemy.active) {
                let bullet = this.add.sprite(enemy.x, enemy.y + 20, "spaceParts", "laserBlue01.png");
                bullet.setFlipY(true);
                this.enemyBullets.push(bullet);   
            }
        }

        this.enemyShootTimer = 0;
    }

    resetGameStateVariables() {
        this.my = { sprite: {}, text: {} };

        this.my.sprite.bullet = [];
        this.enemyBullets = [];
        this.enemies = [];

        this.playerScore = 0;
        this.currentWave = 1;
        this.playerAlive = true;

        this.enemyShootTimer = 0;
        this.pathEnemiesSpawned = 0;
        this.pathTimer = 0;
        this.pathSpawnLimit = 0;

        this.speedUp = false;
        this.enemyDirection = 1;
        this.enemySpeed = 150;
        this.edgeHandled = false;

        this.resetText = null;
        this.gameOverText = null;
    } 

    reset() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.resetGameStateVariables();
            this.scene.start("initScene");
        }
    }

    update(time, deltaTime) {
        if (this.playerAlive == true) {
        let my = this.my;

        // Graph by reference
        let cockpit = my.sprite.spaceShip;
        let leftWing = my.sprite.leftWing;
        let rightWing = my.sprite.rightWing;

        // make ship part array
        let shipParts = [cockpit, leftWing, rightWing];

        let speed = 475; // Movement speed in pixels
        let dt = deltaTime / 1000; // turning DT (in ms) into seconds

        let moveAmount = speed * dt; // appropriate movement speed using delta time

        // Polling for left movement
        if (this.moveLeft.isDown || this.moveLeftArrow.isDown) {
            if (leftWing.x - leftWing.displayWidth / 2 - moveAmount >= 0) {
                shipParts.forEach(part => {part.x -= moveAmount}); // moves the array of ship parts
            }
        };

        // Polling for right movement
        if (this.moveRight.isDown || this.moveRightArrow.isDown) {
            if (rightWing.x + rightWing.displayWidth / 2 + moveAmount <= this.game.config.width) {
                shipParts.forEach(part => {part.x += moveAmount}); // moves the array of ship parts
            }
        }

        // Space input to shoot 
        if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
            if (my.sprite.bullet.length < this.maxBullets) { // if the length of bullets is less than maxSize
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.spaceShip.x, my.sprite.spaceShip.y-(my.sprite.spaceShip.displayHeight/2), "spaceParts", "laserRed01.png") // push new bullet to array and add sprite
                );
                this.sound.play("laser");   
            }
        }

        // move bullet along y axis
        for (let bullet of my.sprite.bullet) {
            bullet.y -= moveAmount;
        }

        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        let level = levels[this.currentWave - 1];
        if (level.movement == "groupDown") {
            // update the position of enemies
            this.updateBasicEnemies(deltaTime);
        }

        if (level.movement == "zigzag" || level.movement == "zagzig") {
            this.updatePathEnemies(deltaTime);
        }

        if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup") {
            this.updateBasicEnemies(deltaTime);
            this.updatePathEnemies(deltaTime);
        }

        this.enemyShoot(deltaTime);

        let enemyMoveAmount = this.enemyBulletSpeed * dt;

        for (let bullet of this.enemyBullets) {
            bullet.y += enemyMoveAmount;
        }

        this.enemyBullets = this.enemyBullets.filter((bullet) => {
            if (bullet.y < this.game.config.height + bullet.displayHeight) {
            return true;
        }

        bullet.destroy();
        return false;
    });

        // Bullet and enemy collision check
        for (let bullet of my.sprite.bullet) { // loop through bullets
            for(let enemy of this.enemies) { // loop through enemies
                if (this.collides(enemy, bullet)) { // check if they collide
                    this.puff = this.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                    bullet.y = -100;

                    enemy.destroy();
                    enemy.isDead = true;

                    this.playerScore += 25;
                    this.updateScore();

                    this.sound.play("death2");
                }
            }
        }

        for (let bullet of this.enemyBullets) {
            if (this.collides(my.sprite.spaceShip, bullet)) {
                bullet.destroy();
                bullet.isDead = true;
                
                this.puff = this.add.sprite( my.sprite.spaceShip.x, my.sprite.spaceShip.y, "whitePuff03" ).setScale(0.25).play("puff");
                
                this.playerAlive = false;
                this.sound.play("death1");
                
                my.sprite.spaceShip.visible = false;
                my.sprite.leftWing.visible = false;
                my.sprite.rightWing.visible = false;
            
                this.add.text(250, 450, "GAME OVER", {
                    fontSize: "48px",
                    fill: "#ff0000"
        });
    }
}

this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.isDead);

        // enemy on player collision check
        for(let enemy of this.enemies) {
            if (this.collides(my.sprite.spaceShip, enemy)) {
                this.puff = this.add.sprite(my.sprite.spaceShip.x, my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");
                this.playerAlive = false;
                this.sound.play("death1");

                my.sprite.spaceShip.visible = false;
                my.sprite.leftWing.visible = false;
                my.sprite.rightWing.visible = false;

                let text = this.add.text(this.game.config.width / 2, this.game.config.height / 2, "GAME OVER", { fontSize: "48px", fill: "#ff0000" });
                text.setOrigin(0.5);
            }
        }
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);

        this.checkWave();
    }
    
    if (this.playerAlive == false) {
        
        if (!this.resetText) {
            this.resetText = this.add.text(
            this.game.config.width / 2, 600, "RESET BY PRESSING R",{ fontSize: "48px", fill: "#00fd22" } ).setOrigin(0.5);
        }
        this.reset();
    }

    if (this.playerAlive == true && (this.boss == false || this.enemies.length == 0)) {
        if (!this.winText) {
            this.resetText = this.add.text(
            this.game.config.width / 2, 600, "YOU WIN!!!!",{ fontSize: "48px", fill: "#00fd22" } ).setOrigin(0.5);
        }

        if (!this.resetText) {
            this.resetText = this.add.text(
            this.game.config.width / 2, 600, "RESET BY PRESSING R",{ fontSize: "48px", fill: "#00fd22" } ).setOrigin(0.5);
        }

        this.reset();
    }
}

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.playerScore);
    }
}

export default GalleryShooter;