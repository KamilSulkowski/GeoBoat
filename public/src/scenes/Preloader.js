
export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }
    preload() {
        this.load.spritesheet("boat", "assets/boat.png", {
            frameWidth: 48,
            frameHeight: 32
        });
        this.load.spritesheet("boatAnim", "assets/animation/boatAnimSheet.png", {
            frameWidth: 48,
            frameHeight: 32
        });
        this.load.spritesheet("repairAnim", "assets/animation/hammerSheet.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        
        this.load.image("fullHeart", "assets/fullHeart.png")
        this.load.image("emptyHeart", "assets/emptyHeart.png")
        this.load.image("compassArrow", "assets/compassArrow.png")
        this.load.image("compassHead", "assets/compassHead.png")
        this.load.image("menuCog", "assets/menuCog.png")
        this.load.image("menuBar", "assets/board1.png")
        this.load.image("menuLongBar", "assets/board2.png")
        this.load.image("rankBadge", "assets/rankBadge.png")
        this.load.image("profilePic", "assets/profilePic.png")
        this.load.image("profileBorder", "assets/profileBorder.png")

        this.load.image('worldtiles', "assets/worldtiles.png");
        this.load.image('tiled', "assets/worldtiles.png");

        this.load.tilemapTiledJSON('worldMap','Maps/worldMap.json');
        this.load.tilemapTiledJSON('regionMap', 'Maps/regionMap.json');
        this.load.tilemapTiledJSON('jamajka', 'Maps/jamajkaRegion.json');
        
        this.load.image("PPH", "assets/portPH.png")
        this.load.image("CPH", "assets/collisionPH.png")
        this.load.image("QPH", "assets/quizPH.png")
        this.load.image('QTPH', "assets/quizTalkPH.png");

        this.load.image("roseHall", "assets/roseHall.png")
    }
    create() {

        this.scene.start('worldMap');
        this.scene.run('ui');

    }
}