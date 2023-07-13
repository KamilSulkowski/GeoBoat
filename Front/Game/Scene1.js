class Scene1 extends Phaser.Scene {
    constructor() {
        super("bootGame");
    }
    preload(){
        this.load.image("background", "assets/background.png");
        this.load.image("boat", "assets/boat.png", {
            frameWidth: 128,
            frameHeight: 128
        });
    }

    create() {
        this.add.text(20, 20, "Loading game...", {
            font: "18px Arial", 
            fill: "yellow"
        });

        this.scene.start("playGame");
    }

    update(){

    }
}