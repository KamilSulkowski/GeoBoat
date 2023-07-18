export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');

    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {

        //Pobranie wartości z pliku game.js
        this.worldMapScene = this.scene.get('game');

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

        // Dodaj fizykę do warstw
        this.physics.world.enable([deepwater, ground, extra]);

        // Utwórz kolizję dla warstw
        this.physics.add.collider(this.worldMapScene.boat, deepwater);
        this.physics.add.collider(this.worldMapScene.boat, ground);
        this.physics.add.collider(this.worldMapScene.boat, extra);


        // Set the bounds and center the camera on the boat
        this.cameras.main.setBounds(0, 0, this.worldMap.widthInPixels, this.worldMap.heightInPixels);

        this.cameras.main.startFollow(this.worldMapScene.boat);

    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }


}

