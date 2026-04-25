class GalleryShooter extends Phaser.Scene {

    constructor() {
        super("Main Scene")
        console.log("Constructor");

        this.my = {sprite: {}};

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
        console.log("Set the path for images to ./assets");

        this.load.atlasXML("spaceParts", "sheet.png", "sheet.xml"); // loading xml sheets
        console.log("Loaded atlas from XML");
    }

    create() {
        console.log("Create function")

        let my = this.my;

        // Assets
        let cockpit = my.sprite.spaceShip = this.add.sprite(this.cockpitX, this.cockpitY, "spaceParts", "cockpitRed_4.png");
        let rightWing = my.sprite.rightWing = this.add.sprite(this.wingRightX, this.wingRightY, "spaceParts", "wingRed_4.png");
        let leftWing = my.sprite.leftWing = this.add.sprite(this.wingLeftX, this.wingLeftY, "spaceParts", "wingRed_4.png");
        let playerShot = my.sprite.PlayerShot = this.add.sprite(this.cockpitX, this.cockpitY, "spaceParts", "laserRed01.png");

        // Assets changes
        rightWing.flipX = true
        playerShot.visible = false;
        rightWing.angle = 180;
        leftWing.angle = -180


        //Action Buttons
        this.moveLeft = this.input.keyboard.addKey('A');
        this.moveLeftArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.moveRight = this.input.keyboard.addKey('D');
        this.moveRightArrow = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.shoot = this.input.keyboard.addKey('space');

        // Event handler for shooting
        this.shoot.on('down', ()=> {
            if (!playerShot.visible) {
            playerShot.visible = true;
            playerShot.x = cockpit.x;
            playerShot.y = cockpit.y;
            }
        });
    }

    update(time, deltaTime) {
        let my = this.my;

        // Graph by reference
        let cockpit = my.sprite.spaceShip;
        let leftWing = my.sprite.leftWing;
        let rightWing = my.sprite.rightWing;
        let playerShot = my.sprite.PlayerShot;

        // make ship part array
        let shipParts = [cockpit, leftWing, rightWing];

        let speed = 475; // Movement speed in pixels
        let seconds = deltaTime / 1000; // turning DT (in ms) into seconds

        let moveAmount = speed * seconds; // appropriate movement speed using delta time

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

        // Polling checker to see if shot is still in bounds
        if (playerShot.visible == true) {
            console.log("Shot y:", playerShot.y);
            playerShot.y -= moveAmount; // move position while still visible
            if (playerShot.y <= 0) { // if shot hits 0 or goes below it
                playerShot.visible = false; // reset the visibility
            }
        }

    }
}