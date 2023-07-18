

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }
    preload() {
        this.load.image("boat", "assets/boat.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.image('tiled', "assets/worldtiles.png");
        this.load.tilemapTiledJSON('worldMap','Maps/worldMap.json');
        this.load.tilemapTiledJSON('regionMap', 'Maps/regionMap.json');
    }
    create() {

        this.scene.start('game');


    }
}