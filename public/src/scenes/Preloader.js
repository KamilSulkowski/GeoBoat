import {WorldMap} from "../worldMap.js";


export default class Preloader extends Phaser.Scene {

    constructor() {
        super('preloader');
    }
    preload() {
        this.load.spritesheet("boat", "assets/boat.png", {
            frameWidth: 64,
            frameHeight: 32
        });
        this.load.spritesheet("boatAnim", "assets/animation/boatAnimSheet.png", {
            frameWidth: 64,
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
        this.load.image('tiled', "assets/worldtiles.png");

        this.load.image('fixWrench', "assets/fixWrench.png");
        this.load.image('tile', "assets/worldtiles.png");

        this.load.tilemapTiledJSON('worldMap','Maps/worldMap.json');
        this.load.tilemapTiledJSON('regionMap', 'Maps/regionMap.json');

        this.load.image("PPH", "assets/portPH.png")
        this.load.image("CPH", "assets/collisionPH.png")
        this.load.image("QPH", "assets/quizPH.png")
        this.load.image('QTPH', "assets/quizTalkPH.png");
    }
    create() {

        this.scene.start('game');
        this.scene.run('ui');

    }
}