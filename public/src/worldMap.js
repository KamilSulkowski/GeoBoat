export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');

    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {

        this.worldMap = this.make.tilemap({key: 'worldMap'});
        const tileSetWorld = this.worldMap.addTilesetImage('tile', 'tile');
        const water = this.worldMap.createStaticLayer('water', tileSetWorld);
        const deepwater = this.worldMap.createStaticLayer('deepwater', tileSetWorld);
        const ground = this.worldMap.createStaticLayer('ground', tileSetWorld);
        const extra = this.worldMap.createStaticLayer('extra', tileSetWorld);

        water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        deepwater.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        ground.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        extra.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });

        console.log(water);
        // Set the bounds and center the camera on the boat
        this.cameras.main.setBounds(0, 0, this.worldMap.widthInPixels, this.worldMap.heightInPixels);
    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }


}

