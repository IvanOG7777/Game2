class Init extends Phaser.Scene {
    constructor() {
        super("initScene");

        this.my = {text: {}}
    }

    preload() {
        this.load.setPath("./assets/"); // loading assets
        // loading score font
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {

        this.my.text.initText = this.add.bitmapText(130, 100, "rocketSquare", "GALLERY SHOOTER", 40);

        this.add.text(150, 400, "Press SPACE to start Levels", {fontSize: "24px", fill: "#00fd22"});

        this.add.text(170, 500, "Press I for infinite mode", {fontSize: "24px", fill: "#00fd22"});

        this.my.text.createdBy = this.add.bitmapText(10, 600, "rocketSquare", "Created By: Ivan Argueta", 40);

        this.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        this.iKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.I
        );
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("Main Scene", {infiniteMode: false});
        }

        if (Phaser.Input.Keyboard.JustDown(this.iKey)) {
            this.scene.start("Main Scene", {infiniteMode: true});
        }
    }
}

export default Init;