class GalleryShooter extends Phaser.Scene {

    constructor() {
        super("Main Scene")
        console.log("Constructor");

        this.my = {sprite: {}};

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
        console.log("Preloading assets and images");
        this.load.setPath("./assets/"); // loading assets

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets

        // loaduing necessary audios
        this.load.audio("laser", "laser5");
        this.load.audio("death1", "spaceTrash4");
        this.load.audio("death2", "explosionCrunch_000");
        this.load.audio("engine1", "spaceEngineLow_002");
        this.load.audio("engine2", "spaceEngineSmall_001");

        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        console.log("Create function")

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
            }
        }

        for (let bullet of my.sprite.bullet) {
            bullet.y -= moveAmount;
        }

        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

    }
}