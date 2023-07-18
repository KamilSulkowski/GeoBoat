export class RegionMap extends Phaser.Scene {
    constructor() {
        super('regionMap');

    }
    preload(){

    }

    create(){
        //-------REGION MAP----------

        //Pobranie wartości z pliku game.js
        this.regionMapScene = this.scene.get('game');

        this.regionMap = this.make.tilemap({key: 'regionMap'});

        const tileSetRegion = this.regionMap.addTilesetImage('tile', 'tile');
        this.regionMap.createStaticLayer('water', tileSetRegion);
        const island = this.regionMap.createStaticLayer('island', tileSetRegion);
        // Dodaj fizykę do warstw

        this.cameras.main.setBounds(0, 0, this.regionMap.widthInPixels, this.regionMap.heightInPixels);

        this.cameras.main.startFollow(this.regionMapScene.boat);


    }

    update(time, delta) {

    }
}