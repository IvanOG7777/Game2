import levels from "./Levels.js";
import paths from "./Paths.js";
import {
    startWave,
    checkWave,
    updateBasicEnemies,
    updatePathEnemies,
    enemyShoot,
    enemyOnPlayerCollision,
    bulletOnPlayerCollision,
    bulletOnEnemyCollision
} from "./GameFunctions.js";

class GalleryShooter extends Phaser.Scene {


    curve;

    constructor() {
        super("Main Scene")
        console.log("Constructor");

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];
        this.maxBullets = 5;
        this.playerScore = 0;
        this.playerHealth = 3;

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
        this.playerAlive = true;

        this.enemyDirection = 1;
        this.enemySpeed = 150;
        this.enemyDropAmount = 15;
    }

    preload() {
        this.load.setPath("./assets/"); // loading assets

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets
        this.load.image("enemyShip", "enemyGreen1.png");       // spaceship that runs along the path

        // loading necessary audios
        this.load.audio("laser", "laser5.ogg");
        this.load.audio("enemyLaser", "laserRetro_002.ogg");
        this.load.audio("death1", "spaceTrash4.ogg");
        this.load.audio("death2", "explosionCrunch_000.ogg");
        this.load.audio("engine1", "spaceEngineLow_002.ogg");
        this.load.audio("engine2", "spaceEngineSmall_001.ogg");
        this.load.audio("gameMusic", "the_mountain-game-game-music-508018.mp3");

        //Images for death
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
        my.sprite.spaceShip = this.add.sprite(this.cockpitX, this.cockpitY, "spaceParts", "cockpitRed_4.png");
        let rightWing = my.sprite.rightWing = this.add.sprite(this.wingRightX, this.wingRightY, "spaceParts", "wingRed_4.png");
        let leftWing = my.sprite.leftWing = this.add.sprite(this.wingLeftX, this.wingLeftY, "spaceParts", "wingRed_4.png");

        // Assets changes
        rightWing.flipX = true;
        rightWing.angle = 180;
        leftWing.angle = -180

        // Creating objects of sounds from preload
        my.sounds = {};
        my.sounds.laser = this.sound.add("laser");
        my.sounds.enemyLaser = this.sound.add("enemyLaser");
        my.sounds.death1 = this.sound.add("death1");
        my.sounds.death2 = this.sound.add("death2");
        my.sounds.engine1 = this.sound.add("engine1");
        my.sounds.engine2 = this.sound.add("engine2");
        my.sounds.music = this.sound.add("gameMusic");

        // Resetting then playing sound
        my.sounds.music.stop();
        my.sounds.music.play({loop: true, volume: 0.2});


        //Action Buttons
        this.moveLeft = this.input.keyboard.addKey('A');
        this.moveLeftArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.moveRight = this.input.keyboard.addKey('D');
        this.moveRightArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.shoot = this.input.keyboard.addKey('space');
        this.rKey = this.input.keyboard.addKey('R');

        // reference to store on-screen texts
        my.text.score = this.add.bitmapText(450, 10, "rocketSquare", "Score " + this.playerScore);

        // Get current level by reference and movement name related to level
        let currentLevel = levels[this.currentWave - 1];
        let movementName = currentLevel.movement;

        // As long as current level movement isn't "groupDown"
        if (movementName != "groupDown") {
            // get the movement points and plot on the curve
            this.points = paths[movementName];
            this.curve = new Phaser.Curves.Spline(this.points);

            my.sprite.enemyShip = this.add.follower(this.curve, 10, 10, "enemyShip"); // add a new follower to curve
            my.sprite.enemyShip.visible = false; // keep hidden
        }


        startWave(this, 1);

        this.anims.create({
            key: "puff",
            frames: [
                {key: "whitePuff00"},
                {key: "whitePuff01"},
                {key: "whitePuff02"},
                {key: "whitePuff03"},
            ],
            frameRate: 60,
            repeat: 10,
            hideOnComplete: true
        });

    }

    resetGameStateVariables() {

        this.my.sounds.engine2.stop();
        this.my.sounds.engine1.stop();

        this.my = {sprite: {}, text: {}};

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

        this.resetText = null;
    }

    reset() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            if (this.my?.sounds?.music) {
                this.my.sounds.music.stop();
            }
            this.resetGameStateVariables();
            this.scene.start("initScene");
        }
    }

    checkPlayerStatus(playerStatus) {
        if (this.playerAlive == false) {
            if (!this.resetText) {
                this.resetText = this.add.text(
                    this.game.config.width / 2, 600, "RESET BY PRESSING R", {
                        fontSize: "48px",
                        fill: "#00fd22"
                    }).setOrigin(0.5);
            }
            this.reset();
        }
    }

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.playerScore);
    }

    update(time, deltaTime) {
        if (this.playerAlive == true) {
            let my = this.my;

            // Grab by reference
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
                    shipParts.forEach(part => {
                        part.x -= moveAmount
                    }); // moves the array of ship parts
                }
            }


            // Polling for right movement
            if (this.moveRight.isDown || this.moveRightArrow.isDown) {
                if (rightWing.x + rightWing.displayWidth / 2 + moveAmount <= this.game.config.width) {
                    shipParts.forEach(part => {
                        part.x += moveAmount
                    }); // moves the array of ship parts
                }
            }

            // Space input to shoot
            if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
                if (my.sprite.bullet.length < this.maxBullets) { // if the length of bullets is less than maxSize
                    my.sprite.bullet.push(this.add.sprite(
                        my.sprite.spaceShip.x, my.sprite.spaceShip.y - (my.sprite.spaceShip.displayHeight / 2), "spaceParts", "laserRed01.png") // push new bullet to array and add sprite
                    );
                    this.my.sounds.laser.play({volume: 0.8});
                }
            }

            // move bullet along y-axis
            for (let bullet of my.sprite.bullet) {
                bullet.y -= moveAmount;
            }

            my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight / 2));

            let level = levels[this.currentWave - 1];
            if (level.movement == "groupDown") {
                // update the position of enemies
                updateBasicEnemies(this, deltaTime);
            }

            if (level.movement == "zigzag" || level.movement == "zagzig") {
                updatePathEnemies(this, deltaTime);
            }

            if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup") {
                updateBasicEnemies(this, deltaTime);
                updatePathEnemies(this, deltaTime);
            }

            enemyShoot(this, deltaTime);

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

            bulletOnEnemyCollision(this);

            bulletOnPlayerCollision(this);

            this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.isDead);

            // enemy on player collision check
            enemyOnPlayerCollision(this);

            this.enemies = this.enemies.filter(enemy => !enemy.isDead);

            checkWave(this);
        }

        this.checkPlayerStatus(this.playerAlive);

        if (this.playerAlive == true && (this.boss == false || this.enemies.length == 0)) {
            if (!this.winText) {
                this.resetText = this.add.text(
                    this.game.config.width / 2, 600, "YOU WIN!!!!", {fontSize: "48px", fill: "#00fd22"}).setOrigin(0.5);
            }

            if (!this.resetText) {
                this.resetText = this.add.text(
                    this.game.config.width / 2, 600, "RESET BY PRESSING R", {
                        fontSize: "48px",
                        fill: "#00fd22"
                    }).setOrigin(0.5);
            }

            this.reset();
        }
    }
}

export default GalleryShooter;