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
    bulletOnEnemyCollision,enemyBulletUpdate
} from "./GameFunctions.js";

class GalleryShooter extends Phaser.Scene {


    curve;

    constructor() {
        super("Main Scene")

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];
        this.maxBullets = 7;
        this.playerScore = 0;
        this.playerHealth = 5;
        this.gameWon = false;
        this.hitDelay = 3500;
        this.lastHit = 0;

        this.infiniteMode = false;
        this.highScore = 0;

        this.enemyBullets = [];
        this.enemyShootTimer = 0;
        this.bossShootTimer = 0;
        this.bossShootDelay = 725;
        this.enemyShootDelay = 3500;
        this.enemyBulletSpeed = 350;
        this.bossDead = false;
        this.gameEnd = false;

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
        this.enemySpeed = 200;
        this.enemyDropAmount = 20;
    }

    preload() {
        this.load.setPath("./assets/"); // loading assets

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets
        this.load.atlasXML("alienParts", "spritesheet_spaceships.png", "spritesheet_spaceships.xml"); // alien sheets

        // loading necessary audios
        this.load.audio("laser", "laser5.ogg");
        this.load.audio("enemyLaser", "laserRetro_002.ogg");
        this.load.audio("death1", "spaceTrash4.ogg");
        this.load.audio("death2", "explosionCrunch_000.ogg");
        this.load.audio("engine1", "spaceEngineLow_002.ogg");
        this.load.audio("engine2", "spaceEngineSmall_001.ogg");
        this.load.audio("gameMusic", "the_mountain-game-game-music-508018.mp3");
        this.load.audio("deathMusic", "freesound_community-080047_lose_funny_retro_video-game-80925.mp3");
        this.load.audio("playerHit", "explosionCrunch_004.ogg");
        this.load.audio("winSound", "floraphonic-you-win-sequence-2-183949.mp3");
    

        this.load.spritesheet("hearts", "lifebar_16x16.png", {frameWidth: 16, frameHeight: 16});

        this.load.image("background", "405-0.png");

        //Images for death
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // loading score font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    init(data) {
        this.infiniteMode = data.infiniteMode || false;
    }

    create() {

        let my = this.my;

        this.background = this.add.tileSprite(0,0, this.game.config.width,this.game.config.height, "background").setOrigin(0,0);

        
        this.highScore = Number(localStorage.getItem("highScore")) || 0;

        my.text.highScore = this.add.bitmapText(
            300,
            850,
            "rocketSquare",
            "High Score " + this.highScore
        );

        // Assets for spaceship
        my.sprite.spaceShip = this.add.sprite(this.cockpitX, this.cockpitY, "spaceParts", "cockpitRed_4.png");
        let rightWing = my.sprite.rightWing = this.add.sprite(this.wingRightX, this.wingRightY, "spaceParts", "wingRed_4.png");
        let leftWing = my.sprite.leftWing = this.add.sprite(this.wingLeftX, this.wingLeftY, "spaceParts", "wingRed_4.png");

        this.my.sprite.hearts = [];
        
        for (let i = 0; i < this.playerHealth; i++) {
            //positioning of hearts        x          y
            let heart = this.add.sprite(30 + i * 60, 50, "hearts", 0);
            heart.setScale(3);
            this.my.sprite.hearts.push(heart);
        }

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
        my.sounds.deathMusic = this.sound.add("deathMusic");
        my.sounds.playerHit = this.sound.add("playerHit");
        my.sounds.winSound = this.sound.add("winSound");

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

            my.sprite.enemyShip = this.add.follower(this.curve, 10, 10, "alienParts", "shipYellow_manned.png"); // add a new follower to curve
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

    //Reseting game variables
    resetGameStateVariables() {

        this.my.sounds.engine2.stop();
        this.my.sounds.engine1.stop();

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];
        this.enemyBullets = [];
        this.enemies = [];

        this.playerScore = 0;
        this.playerHealth = 5;
        this.currentWave = 1;
        this.playerAlive = true;

        this.enemyShootTimer = 0;
        this.pathEnemiesSpawned = 0;
        this.pathTimer = 0;
        this.pathSpawnLimit = 0;

        this.speedUp = false;
        this.enemyDirection = 1;
        this.enemySpeed = 150;

        this.gameWon = false;
        this.gameEnd = false;
        this.bossShootTimer = 0;
        
        this.gameWonText = null;
        this.resetText = null;
    }

    // function used to reset
    reset() {
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            if (this.my?.sounds?.music) {
                this.my.sounds.music.stop();
            }
            this.resetGameStateVariables();
            this.scene.start("initScene");
        }
    }

    // Checking player status and showing game win/lose texts
    checkPlayerStatus(playerStatus) {
        if (this.gameWon) {
            if (!this.gameWonText) {
                this.gameWonText = this.add.text (
                    this.game.config.width / 2, 500,  "GAME WON", {
                        fontSize: "48px",
                        fill: "#00fd22"
                    }).setOrigin(0.5);
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

        if (!this.playerAlive) {
            if (!this.gameWonText) {
                this.gameWonText = this.add.text (
                    this.game.config.width / 2, 500,  "GAME OVER", {
                        fontSize: "48px",
                        fill: "#ff0000"
                    }).setOrigin(0.5);
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

    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth / 2 + b.displayWidth / 2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight / 2 + b.displayHeight / 2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.playerScore);

        if (this.playerScore > this.highScore) {
            this.highScore = this.playerScore;
            localStorage.setItem("highScore", this.highScore);
            my.text.highScore.setText("High " + this.highScore);
        }
    }

    update(time, deltaTime) {
        if (this.playerAlive == true && !this.gameEnd) {

            this.background.tilePositionY -= 1;

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
                if (bullet.y <= 0) {
                    bullet.destroy();
                    bullet.isDead = true;
                    continue;
                }
                bullet.y -= moveAmount;
            }

            my.sprite.bullet = my.sprite.bullet.filter((bullet) => {
                if (bullet.isDead) {
                    return false
                }
                return bullet.y > -(bullet.displayHeight / 2)
            });

            let level = levels[this.currentWave - 1];
            if (level.movement == "groupDown") {
                // update the position of enemies
                updateBasicEnemies(this, deltaTime);
            }

            if (level.movement == "zigzag" || level.movement == "zagzig") {
                updatePathEnemies(this, deltaTime);
            }

            if (level.movement == "zigzagANDGroup" || level.movement == "zagzigANDGroup" || level.movement == "boss") {
                updateBasicEnemies(this, deltaTime);
                updatePathEnemies(this, deltaTime);
            }

            enemyShoot(this, deltaTime);

            enemyBulletUpdate(this, dt);

            bulletOnEnemyCollision(this);

            this.enemyBullets = this.enemyBullets.filter(bullet => !bullet.isDead);

            bulletOnPlayerCollision(this);

            // enemy on player collision check
            enemyOnPlayerCollision(this);

            this.enemies = this.enemies.filter(enemy => !enemy.isDead);

            checkWave(this);
        }

        this.checkPlayerStatus(this.playerAlive);
    }
}

export default GalleryShooter;