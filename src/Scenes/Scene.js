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

        this.currentWave = 1;
        this.enemies = [];
        this.boss = null;

        // init ship position
        this.cockpitX = 350;
        this.cockpitY = 900;
        this.wingRightX = 396;
        this.wingRightY = 900;
        this.wingLeftX = 304;
        this.wingLeftY = 900;
        
        //init shot position
        this.playerShotX = 350;
        this.playerShotY = 890;
        this.playerAlive = true;

        this.enemyDirection = 1;
        this.enemyDropAmount = 10;
        this.enemySpeed = 150;
        this.enemyDropAmount = 15;
    }

    preload() {
        this.load.setPath("./assets/"); // loading assets

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets
        this.load.image("x-mark", "numeralX.png");             // x marks the spot
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

        this.startWave(3);

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

    drawPoints() {
        for (let point of this.curve.points) {
            this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
        }
    }

    clearPoints() {
        this.curve.points = [];
        this.graphics.clear();
        for (let img of this.xImages) {
            img.destroy();
        }
    }

    addPoint(point) {
        this.curve.addPoint(point);
        this.xImages.push(this.add.image(point.x, point.y, "x-mark"));
    }

    // Draws the spline
    drawLine() {
        this.graphics.clear();
        this.graphics.lineStyle(2, 0xffffff, 1);
        let amountOfPoints = this.curve.points.length;
        let curveSmoothness = amountOfPoints * 50;
        console.log(curveSmoothness);
        this.curve.draw(this.graphics, curveSmoothness);
    }

    spawnEnemies(movement, passedRows, passedCols) {
        let ROWS = passedRows;
        let COLS = passedCols;
        let startX = 100;
        let startY = -240;
        let spacingX = 120;
        let spacingY = 100;

        for (let enemy of this.enemies) {
            enemy.destroy();
        }

        this.enemies = [];

        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                let x = startX + (col * spacingX);
                let y = startY + (row * spacingY);

                let ship = this.add.sprite(x, y, "enemyShip");
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

        for (let enemy of this.enemies) {
            enemy.destroy();
        }

        for (let bullet of this.my.sprite.bullet) {
            bullet.destroy();
        }

        this.my.sprite.bullet = [];
        this.enemies = [];

        this.enemyDirection = 1;

        if(level.movement == "groupDown") {
            this.spawnEnemies(level.movement, level.rows, level.cols);
        }
    }

    updateBasicEnemies(deltaTime) {
        let destoryCount = 0;
        let dt = deltaTime / 1000;
        let moveAmount = this.enemySpeed * dt;
        let touchedEdge = false;

        for (let enemy of this.enemies) {
            enemy.x += moveAmount * this.enemyDirection;

            if (enemy.x - enemy.displayWidth / 2 <= 0) { //moveing left
                touchedEdge = true;
            }

            if (enemy.x + enemy.displayWidth / 2 >= this.game.config.width) {
                touchedEdge = true;
            }

        }

        if (touchedEdge == true) {
            for (let enemy of this.enemies) {
                enemy.y += this.enemyDropAmount;
            }
            this.enemyDirection *= -1;
        }
        console.log(destoryCount);
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

        if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.spaceShip.x, my.sprite.spaceShip.y-(my.sprite.spaceShip.displayHeight/2), "spaceParts", "laserRed01.png")
                );
                this.sound.play("laser");   
            }
        }

        for (let bullet of my.sprite.bullet) {
            bullet.y -= moveAmount;
        }

        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            console.log("Run mode");
            if (this.isRunning == true) {
                my.sprite.enemyShip.stopFollow();
                my.sprite.enemyShip.visible = false;
                this.isRunning = false;
            } else {
                if (this.curve.points.length > 0) {
                    this.isRunning = true;
                    my.sprite.enemyShip.visible = true;
                    my.sprite.enemyShip.x = this.curve.points[0].x;
                    my.sprite.enemyShip.y = this.curve.points[0].y;
                    my.sprite.enemyShip.startFollow({
                        from: 0,
                        to: 1,
                        delay: 0,
                        duration: 3500,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: true,
                        rotationOffset: -90
                    });
                }
            }
        }
        this.updateBasicEnemies(deltaTime);

        for (let bullet of my.sprite.bullet) {
            for(let enemy of this.enemies) {
                if (this.collides(enemy, bullet)) {
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

        for(let enemy of this.enemies) {
            if (this.collides(my.sprite.spaceShip, enemy)) {
                this.puff = this.add.sprite(my.sprite.spaceShip.x, my.sprite.spaceShip.y, "whitePuff03").setScale(0.25).play("puff");
                this.playerAlive = false;
                this.sound.play("death1");

                my.sprite.spaceShip.visible = false;
                my.sprite.leftWing.visible = false;
                my.sprite.rightWing.visible = false;

                this.add.text(250, 450, "GAME OVER", {
                    fontSize: "48px",
                    fill: "#fcfcfc"
                });
            }
        }

        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
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