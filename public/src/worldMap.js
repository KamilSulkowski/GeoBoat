export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');
        this.tileSetWorld = null;
        this.water = null;
        this.ground = null;
        this.deepwater = null;
        this.extra = null;
    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {
        //Pobranie wartości z pliku game.js
        this.worldMapScene = this.scene.get('game');
        this.worldMap = this.make.tilemap({key: 'worldMap', tileWidth: 16, tileHeight: 16});

        this.tileSetWorld = this.worldMap.addTilesetImage('tile', 'tile',16,16);
        this.extra = this.worldMap.createStaticLayer('extra', this.tileSetWorld,0,0);
        this.water = this.worldMap.createStaticLayer('water', this.tileSetWorld,0,0);
        this.ground = this.worldMap.createStaticLayer('ground', this.tileSetWorld,0,0);
        this.deepwater = this.worldMap.createStaticLayer('deepwater', this.tileSetWorld,0,0);
        this.physics.world.enable([this.worldMapScene.boat, this.ground, this.deepwater, this.extra]);

        this.worldMap.setCollisionBetween(6,6, true, 'ground');
        this.worldMap.setCollisionBetween(38,38, true, 'deepwater');
        this.worldMap.setCollisionBetween(54,56, true, 'extra');

        this.water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.deepwater.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.ground.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.extra.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });


        this.physics.world.setBounds(0, 0, 8000, 4000); // Ustaw granice świata

        // this.physics.world.gravity.y = 0;
       // this.physics.world.enable([water, ground, deepwater, extra]); // Dodaj fizykę do warstw

        // Ustaw kolizję dla odpowiednich kafelków na warstwach

        // Ustawianie kolizji na podstawie indeksów kafelków
        this.ground.setCollisionByProperty({collider: true});
        this.deepwater.setCollisionByProperty({collider: true});
        this.extra.setCollisionByProperty({collider: true});
        this.physics.add.collider(this.worldMapScene.boat, this.ground, null, null, this);
        this.physics.add.collider(this.worldMapScene.boat, this.deepwater, null, null, this);
        this.physics.add.collider(this.worldMapScene.boat, this.extra, null, null, this);

        this.worldMapScene.boat.setPosition(3150, 1750);
        this.worldMapScene.boat2.setPosition(3150, 1680);
        this.worldMapScene.quiz_test.setPosition(3150, 1900);

        this.cameras.main.startFollow(this.worldMapScene.boat);

    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;
        this.physics.world.collide(this.worldMapScene.boat, this.ground, this.handleGroundCollision, null, this);
        this.physics.world.collide(this.worldMapScene.boat, this.deepwater, this.handleDeepWaterCollision, null, this);
        this.physics.world.collide(this.worldMapScene.boat, this.extra, this.handleExtraCollision, null, this);
    }

    handleGroundCollision(boat, ground) {
        console.log("Collision with ground");
    }

    handleDeepWaterCollision(boat, deepwater) {
        console.log("Collision with deep water");
    }

    handleExtraCollision(boat, extra) {
        console.log("Collision with extra");
    }
}

