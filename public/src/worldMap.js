export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');
    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {
        const worldMap = this.make.tilemap({key: 'worldMap'});
        const tileSet = worldMap.addTilesetImage('tiled', 'tiled');


        const water = worldMap.createStaticLayer('deepwater', tileSet);

        water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        // Set the bounds and center the camera on the boat
        this.cameras.main.setBounds(0, 0, worldMap.widthInPixels, worldMap.heightInPixels);
        this.cameras.main.centerOn(this.boat.x, this.boat.y);
    }
}

