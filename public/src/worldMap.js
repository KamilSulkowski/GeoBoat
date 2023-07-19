export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');;
    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {
        //Pobranie wartości z pliku game.js
        this.worldMapScene = this.scene.get('game');
        this.physics.world.enable(this.worldMapScene.boat);


        this.worldMap = this.make.tilemap({key: 'worldMap'});

        const tileSetWorld = this.worldMap.addTilesetImage('tile', 'tile');
        const extra = this.worldMap.createStaticLayer('extra', tileSetWorld);
        const water = this.worldMap.createStaticLayer('water', tileSetWorld);
        const ground = this.worldMap.createStaticLayer('ground', tileSetWorld);
        const deepwater = this.worldMap.createStaticLayer('deepwater', tileSetWorld);


        water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        deepwater.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        ground.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        extra.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });


        this.physics.world.setBounds(0, 0, 8000, 4000); // Ustaw granice świata

        // this.physics.world.gravity.y = 0;
       // this.physics.world.enable([water, ground, deepwater, extra]); // Dodaj fizykę do warstw

        // Ustaw kolizję dla odpowiednich kafelków na warstwach

        // Ustawianie kolizji na podstawie indeksów kafelków
        ground.setCollisionByProperty({collider: true});
        deepwater.setCollisionByProperty({collider: true});
        extra.setCollisionByProperty({collider: true});
        this.physics.add.collider(this.worldMapScene.boat, ground);
        this.physics.add.collider(this.worldMapScene.boat, deepwater);
        this.physics.add.collider(this.worldMapScene.boat, extra);


        this.worldMapScene.boat.setPosition(3150, 1750);
        this.worldMapScene.boat2.setPosition(3150, 1680);
        this.worldMapScene.quiz_test.setPosition(-3150, -1900);

        this.cameras.main.startFollow(this.worldMapScene.boat);

    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }


}

