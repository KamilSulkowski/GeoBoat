

export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }
    preload() {
        this.load.spritesheet("boat", "assets/boat.png", {
            frameWidth: 64,
            frameHeight: 32
        });
        this.load.image("fullHeart", "assets/fullHeart.png")
        this.load.image("emptyHeart", "assets/emptyHeart.png")
        this.load.image("compassArrow", "assets/compassArrow.png")
        this.load.image("compassHead", "assets/compassHead.png")
        this.load.image("menuCog", "assets/menuCog.png")
        this.load.image("menuBar", "assets/menuBar.png")
        this.load.image("menuLongBar", "assets/menuLongBar.png")
        this.load.image("rankBadge", "assets/rankBadge.png")
        this.load.image("profilePic", "assets/profilePic.png")
        this.load.spritesheet("boatAnim", "assets/animation/boatAnimSheet.png", {
            frameWidth: 64,
            frameHeight: 32
        });
        this.load.image('tiled', "assets/worldtiles.png");
        this.load.tilemapTiledJSON('worldMap','Maps/worldMap.json');
        this.load.tilemapTiledJSON('regionMap', 'Maps/regionMap.json');
    }
    create() {

        this.scene.start('game');
        this.scene.run('ui');


    }
}