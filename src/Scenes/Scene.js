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

        // init position
        this.cockpitX = 350;
        this.cockpitY = 900;

        this.wingRightX = 396;
        this.wingRightY = 900;

        this.wingLeftX = 304;
        this.wingLeftY = 900;

        this.playerShotX = 350;
        this.playerShotY = 890;
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

        my.text.score = this.add.bitmapText(515, 10,  "rocketSquare", "Score " + this.playerScore);

        this.points = [
            0, 0,
        ];
        this.curve = new Phaser.Curves.Spline(this.points);
        this.graphics = this.add.graphics();

        this.xImages = [];
        this.drawPoints();
        this.drawLine();

        this.mouseDown = this.input.on('pointerdown', (pointer) => {
            this.addPoint({x: pointer.x, y: pointer.y});
            this.drawLine();
        });

        this.isRunning = false;

        my.sprite.enemyShip = this.add.follower(this.curve, 10, 10, "enemyShip");
        my.sprite.enemyShip.visible = false;

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

    update(time, deltaTime) {
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
                        duration: 2000,
                        ease: 'Sine.easeInOut',
                        repeat: -1,
                        yoyo: true,
                        rotateToPath: true,
                        rotationOffset: -90
                    });
            }
        }
    }

    }
}