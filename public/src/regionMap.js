export class RegionMap extends Phaser.Scene {
    constructor() {
        super('regionMap');

    }
    preload(){

    }

    create(){
        //-------REGION MAP----------

        this.regionMap = this.make.tilemap({key: 'regionMap'});
        const tileSetRegion = this.regionMap.addTilesetImage('tiled', 'tiled');
        this.regionMap.createStaticLayer('water', tileSetRegion);
        this.cameras.main.setBounds(0, 0, this.regionMap.widthInPixels, this.regionMap.heightInPixels);

        this.currentMap = 'regionMap';

    }

    update(time, delta) {

    }
}