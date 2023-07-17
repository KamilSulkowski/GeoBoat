export class Regions extends Phaser.Scene {
    constructor() {
        super('regions');
    }
    create() {
        const regionMap = this.make.tilemap({key: 'regionMap'});
        const tileSet = regionMap.addTilesetImage('tiled', 'tiled');

        regionMap.createStaticLayer('water', tileSet);

        this.cameras.main.setBounds(0, 0, regionMap.widthInPixels, regionMap.heightInPixels);
        this.cameras.main.centerOn(this.boat.x, this.boat.y);
    }
}