export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }
    preload() {
        this.load.image("boat", "assets/boat.png", {
            frameWidth: 64,
            frameHeight: 64
        });
    }
    create() {
        this.scene.start('game');
    }
}