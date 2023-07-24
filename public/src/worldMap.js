
export class WorldMap extends Phaser.Scene {
    constructor() {
        super('worldMap');
        this.tileSetWorld = null;
        this.water = null;
        this.ground = null;
        this.deepwater = null;
        this.extra = null;
        this.boat = null; // Przypisujemy łódź do właściwości klasy
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
        this.inZone = false;//Flaga kolizji
        this.inZoneKey = null; //Zmienna do zapamiętywania klawisza do wchodzenia na region
        this.text = null;   //Tekst wyświetlany po wjechaniu w inny obiekt (Port)
        this.adrift = 0;    //Zmienna do kolizji odbicia
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.boatMaxSpeed = 150 // Maksymalna prędkość łodzi
        this.boatMaxReverseSpeed = -50 // Maksymalna prędkość cofania łodzi
        this.currentMap = null; //Zmienna do zapamiętywania na jakiej mapie jest gracz
        this.region = null; //Zmienna do zapamiętywania na jakim regionie jest gracz
        this.shipCooldown = 0;//Zmienna do sprawdzania czasu naprawy
        this.shipRepairTime = 10000 //Zmienna czasu naprawy 10000 = 10s
        this.shipDamaged = false;//Flaga stanu statku (naprawa/sprawny)
        this.boatRespawnX = 3150; //Współrzędne respawnu łodzi
        this.boatRespawnY = 1750; //Współrzędne respawnu łodzi
    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {
        //Pobranie wartości z pliku UI.js
        this.uiScene = this.scene.get('ui');

        // Ładowanie mapy
        const worldMap = this.make.tilemap({key: 'worldMap'});

        this.tileSetWorld = worldMap.addTilesetImage('tile', 'tiled',16,16);
        this.extra = worldMap.createStaticLayer('extra', this.tileSetWorld);
        this.water = worldMap.createStaticLayer('water', this.tileSetWorld);
        this.ground = worldMap.createStaticLayer('ground', this.tileSetWorld);
        this.deepwater = worldMap.createStaticLayer('deepwater', this.tileSetWorld);

        this.water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.deepwater.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.ground.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.extra.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });

        this.deepwater.setCollisionByProperty({collides: true});
        this.ground.setCollisionByProperty({collides: true});
        this.extra.setCollisionByProperty({collides: true});

        this.physics.world.setBounds(0, 0, 8000, 4000); // Ustaw granice świata

        // const debugGraphics = this.add.graphics().setAlpha(0.25);
        // this.ground.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
        // this.deepwater.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
        // this.extra.renderDebug(debugGraphics, {
        //     tileColor: null, // Color of non-colliding tiles,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        // });
        this.currentMap = 'worldMap';


        // ładowanie łódki
        this.boat = this.physics.add.sprite(this.boatRespawnX, this.boatRespawnY, "boat");
        this.boat2 = this.physics.add.sprite(3150, 1680 , "PPH");
        this.boat3 = this.physics.add.sprite(2600, 900 , "PPH");
        // Zmiana obszaru kolizji dla gracza
        this.boat.setPipeline('TextureTintPipeline'); // Enable the Texture Tint Pipeline
        this.boat.body.setSize(28, 22, 0.5, 0.5); // Set the size and offset of the collision body
        this.boat.setOrigin(0.5, 0.5); // Set the origin to the center of the sprite

        // Animacja łódki gracza
        this.anims.create({
            key: 'boatAnimation',
            frames: this.anims.generateFrameNumbers('boatAnim', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.boat.play('boatAnimation');
        this.boat.anims.pause();

        //wpływanie na obiekt wyświetla się alert czy chce zmienić region po kliknięciu E zmienia się region
        //obiektem aktualnie może być łódka
        this.physics.add.overlap(this.boat, this.boat2, () => {
            this.inZone = true;
            if (this.inZone === true && !this.text) {
                this.text = this.add.text(this.boat2.x + 0 ,this.boat2.y - 50, 'Czy chcesz wejść na region ?')
                  .setScale(1.5)
                  .setBackgroundColor('#808080')
                  .setColor('#000000')
                  .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
                this.region = 'Kuba';
            }
        });
        this.physics.add.overlap(this.boat, this.boat3, () => {
            this.inZone = true;
            if (this.inZone === true && !this.text2) {
                this.text2 = this.add.text(this.boat3.x + 0 ,this.boat3.y - 50, 'Czy chcesz wejść na region ?')
                  .setScale(1.5)
                  .setBackgroundColor('#808080')
                  .setColor('#000000')
                  .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
                this.region = 'jamajka';
            }
        });

        // Animacja łódki gracza
        this.anims.create({
            key: 'boatAnimation',
            frames: this.anims.generateFrameNumbers('boatAnim', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.boat.play('boatAnimation');
        this.boat.anims.pause();

        // Kolizja z obiektem (Odpychanie łodzi od brzegu, aktualnie od łódki drugiej)
        this.boat.setCollideWorldBounds(true);

        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();


        this.physics.add.collider(this.boat, this.ground, this.handleCollision , null, this);
        this.physics.add.collider(this.boat, this.deepwater, this.handleCollision , null, this);
        this.physics.add.collider(this.boat, this.extra, this.handleCollision , null, this);
    }

    update(time, delta) {
        // BEGGIN - HUGO
        // this.cameras.main.startFollow(this.boat);
        // if(this.keys.left?.isDown){
        //     this.boat.setVelocity(-speed, 0)
        // }else if(this.keys.right?.isDown){
        //     this.boat.setVelocity(speed, 0)
        // }
        // if(this.keys.up?.isDown){
        //     this.boat.setVelocity(0, -speed)
        // }else if(this.keys.up?.isUp){
        // }
        // if(this.keys.down?.isDown){
        //     this.boat.setVelocity(0, speed)
        // }
        // END - HUGO

        super.update(time, delta);
        this.timer += delta;
        this.shipCooldown += delta;
        // Cooldown debuffa (Naprawa łodzi w czasie)
        this.shipDebuff()
        // Zmiana strzałki kompasu w zależności od pozycji łodzi
        if(this.uiScene){
            this.uiScene.setCompassArrowAngle(this.boat.angle - 90);
        }
        if(this.boatSpeed != 0){
            this.boat.anims.resume();
        }else{
            this.boat.anims.pause();
        }
        // Poruszanie łodzią
        this.moveBoat(this.timer);
        this.boatEngine(this.engine, this.timer);
        this.cameras.main.startFollow(this.boat);
        // Sprawdzenie, czy łódka opuściła obszar kolizji
        this.inZone = false;
        if (this.inZone === false && this.physics.overlap(this.boat, this.boat2) === false) {
            if (this.text) {
                this.text.destroy();
                this.text = null;
                this.inZoneKey.destroy();
            }
        }
        this.inZone = false;
        if (this.inZone === false && this.physics.overlap(this.boat, this.boat3) === false) {
            if (this.text2) {
                this.text2.destroy();
                this.text2 = null;
                this.inZoneKey.destroy();
            }
        }

    }
    handleCollision(){
        console.log("KOLIZJA");
        this.boatSpeed = this.boatMaxReverseSpeed;
        this.adrift = 1;

        // Zmiana życia łodzi, jak ma 0 HP to i tak już jest
        if(this.uiScene.HP > 0){
            this.uiScene.setHeartState()
        }
    }
    // Funkcje debuffa łodzi
    shipWrecked(){
        console.log("Shipwrecked")
        this.shipCooldown = 0;
        this.boatMaxSpeed = 0;
    }
    shipDebuff(){
        if(this.shipDamaged && this.shipCooldown >= this.shipRepairTime){
            if(this.uiScene.HP === 3){
                this.shipDamaged = false;

            }else{
                console.log("Naprawiono")
                this.boatMaxSpeed = 150;
                this.uiScene.recoverHeart();
            }
            this.shipCooldown = 0;
        }
    }
    changeMap() {
        console.log("zmiana mapy1: " + this.currentMap + " inzone: " + this.inZone);
        switch (this.region) {
            case 'Kuba':
                this.currentMap = 'regionMap';
                this.scene.stop('worldMap');
                this.scene.launch('regionMap');
                this.scene.sendToBack('regionMap');
                break;
            case 'jamajka':
                this.currentMap = 'jamajka';
                this.scene.stop('worldMap');
                this.scene.launch('jamajka');
                this.scene.sendToBack('jamajka');
                break;
        }
        console.log("zmiana mapy2: " + this.currentMap + " inzone: " + this.inZone);
    }

    moveBoat(){
        // Wektor do sprawdzania rotacji łodzi
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        const changeAngle = 0.5;
        // Wyhamowanie przy dryfowaniu (odbiciu od lądu)
        if(this.adrift === 1){
            if(this.timer >= 100){
                this.boatSpeed += 5;
                this.timer = 0;
            }
            if(this.boatSpeed >= 0){
                this.boatSpeed = 0;
                this.adrift = 0;
            }
        }
        // Obracanie
        if(this.keys.left?.isDown){
            this.boat.angle -= changeAngle;
        }else if(this.keys.right?.isDown){
            this.boat.angle += changeAngle;
        }
        if(this.keys.up?.isDown){
            // Jeżeli łódź się cofa, zatrzymaj ją
            if(this.boatSpeed === -20 && this.timer >= 500){
                this.boatSpeed = 0;
                this.timer = 0;
            } // Poruszanie łodzi (Rozpędzanie w czasie)
            if(this.boatSpeed <= this.boatMaxSpeed){
                if(this.timer >= 100){
                    //console.log(this.timer)
                    this.boatSpeed += 10;
                    this.boat.setAcceleration(Math.cos(direction) * this.boatSpeed, Math.sin(direction) * this.boatSpeed);
                    this.timer = 0;
                }
            }
        }else if(this.keys.up?.isUp){
            //Utrzymanie prędkości
            this.engine = true;
        }
        if(this.keys.down?.isDown){
            //Zatrzymywanie/cofanie łodzi
            this.boatStop()
        }else if (this.keys.down?.isUp) {
            // Zwolniono klawisz "down"
            if (this.boatSpeed < 0 && this.timer >= 250) {
                this.boatSpeed += 10;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
                this.timer = 0;
            }
        }
    }
    // funkcja do zatrzymywania i cofania łodzi
    boatStop(){
        if(this.boatSpeed > 0 && this.timer >= 250){
                this.boatSpeed -= 10;
                this.timer = 0;
                // cofanie
        }
        if(this.boatSpeed <= 0 && this.timer >= 250){
            this.boatSpeed -= 10;
            this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
            if (this.boatSpeed <= this.boatMaxReverseSpeed){
                this.boatSpeed = this.boatMaxReverseSpeed;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
            }
            this.timer = 0;
        }

    }
    // funkcja do utrzymywania prędkości łodzi
    boatEngine(engine, timer){
        // Wektor do sprawdzania rotacji łódki
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        if (engine = 1){
            this.boat.setVelocity(-this.boatSpeed *dx, -this.boatSpeed *dy);
        }
    }
}

