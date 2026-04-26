class Init extends Phaser.Scene {
    constructor() {
        super("initScene");
    }

     create() {
        this.add.text(250, 400, "GALLERY SHOOTER", {
            fontSize: "40px",
            fill: "#ffffff"
        });

        this.add.text(230, 500, "Press SPACE to Start", {
            fontSize: "24px",
            fill: "#ffffff"
        });

        this.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            this.scene.start("Main Scene");
        }
    }
};

export default Init;