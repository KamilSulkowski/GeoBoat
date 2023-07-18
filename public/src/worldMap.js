export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');

    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {


        //-------WORLD MAP----------
        this.worldMap = this.make.tilemap({key: 'worldMap'});
        const tileSetWorld = this.worldMap.addTilesetImage('tiled', 'tiled');
        const water = this.worldMap.createStaticLayer('deepwater', tileSetWorld);
        water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        // Set the bounds and center the camera on the boat
        this.cameras.main.setBounds(0, 0, this.worldMap.widthInPixels, this.worldMap.heightInPixels);

        this.currentMap = this.worldMap;

        //  Ustawienie środka kamery na pozycję łodzi
        //this.cameras.main.centerOn(this.boat.x, this.boat.y);

    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }


}

