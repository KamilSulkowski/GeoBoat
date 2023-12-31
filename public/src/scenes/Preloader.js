
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
        this.load.spritesheet("pirateAnim", "assets/animation/piratSheet.png", {
            frameWidth: 256,
            frameHeight: 256
        });
        this.load.spritesheet("mapAnim", "assets/animation/scrollMapSheetDoUpdatea.png", {
            frameWidth: 1880,
            frameHeight: 940
        });
        this.load.spritesheet("buttonAnim", "assets/animation/buttonSheet.png", {
            frameWidth: 94,
            frameHeight: 32
        });
        this.load.spritesheet('backToWorld', "assets/arrow-Sheet.png", {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.spritesheet('pirateTeacher', "assets/animation/pirateTeacherSheet.png", {
            frameWidth: 16,
            frameHeight: 32
        });
        this.load.spritesheet('seagull', "assets/seagull-Sheet.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.spritesheet('wave', "assets/waves.png", {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.spritesheet('scrollLvl', "assets/scroll2-Sheet.png", {
            frameWidth: 255,
            frameHeight: 384
            });

        this.load.image("modalBackground", "assets/modalBcg.png");
        this.load.image("modalBackgroundBig", "assets/modalBcgBig.png");
        this.load.image("scrollMap", "assets/scrollMap.png");
        this.load.image("scrollMapUI", "assets/globe.png");
        this.load.image("pirate", "assets/pirat.png");
        this.load.image("fullHeart", "assets/fullHeart.png");
        this.load.image("emptyHeart", "assets/emptyHeart.png");
        this.load.image("compassArrow", "assets/compassArrow.png");
        this.load.image("compassHead", "assets/compassHead.png");
        this.load.image("menuCog", "assets/menuCog.png");
        this.load.image("menuBar", "assets/board1.png");
        this.load.image("menuLongBar", "assets/board2.png");
        this.load.image("rankBadge", "assets/rankBadge.png");
        this.load.image("profilePic", "assets/profilePic.png");
        this.load.image("profileBorder", "assets/profileBorder.png");
        this.load.image("scrollMenuMovement", "assets/scrollMenuMovement.png");
        this.load.image("scrollMenuInputs", "assets/scrollMenuInputs.png");
        this.load.image("scrollMenuMiddle", "assets/scrollMenuMiddle.png");
        this.load.image("tadeuszProfil", "assets/tadeuszpiratlvl100profilPic.png");
        this.load.image("tadeuszMiniProfil", "assets/tadeuszpiratlvl100Profil.png");
        this.load.image('geoboatLogo', "assets/geoboat.png");
        this.load.image('backgroundImage', "assets/background.png");

        this.load.image('tiled', "assets/worldtiles.png");
        this.load.image('house_scaled', "assets/house_scaled.png");
        this.load.image('housebig', "assets/housebig.png");
        this.load.image('palm', "assets/palm.png");
        this.load.image('tower', "assets/tower.png");

        this.load.tilemapTiledJSON('worldMap','Maps/worldMap.json');
        this.load.tilemapTiledJSON('jamajka', 'Maps/jamajka.json');
        this.load.tilemapTiledJSON('havana', 'Maps/havana.json');
        this.load.tilemapTiledJSON('panama', 'Maps/panama.json');

        this.load.image("PPH", "assets/dock.png")
        this.load.image("CPH", "assets/collisionPH.png")
        this.load.image("QPH", "assets/dock2.png")
        this.load.image('QTPH', "assets/quizTalkPH.png");
        this.load.image('FPH', "assets/finPH.png");

        this.load.image("roseHall", "assets/roseHall.png");
        this.load.image("logoPanama", "assets/logoPanama.png");
        this.load.image("panamaViejo", "assets/panamaViejo.png");

        //MUSIC
        this.load.audio('seagulWorld', 'assets/music/MountainPeak.wav');
        this.load.audio('seagulRegion', 'assets/music/Seagulls-sound.mp3');
        this.load.audio('windWorld', 'assets/music/WindDeep.wav');
        this.load.audio('lvlup', 'assets/music/lvlup.wav');
        this.load.audio('hit', 'assets/music/hit.wav');
        this.load.audio('background', 'assets/music/background.wav');
    }
    create() {
        this.scene.start('login');
    }
}