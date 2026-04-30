class Init extends Phaser.Scene {
    constructor() {
        super("initScene");
    }

     create() {
        this.add.text(175, 400, "GALLERY SHOOTER", {
            fontSize: "40px",
            fill: "#00fd22"
        });

        this.add.text(220, 500, "Press SPACE to Start", {
            fontSize: "24px",
            fill: "#00fd22"
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