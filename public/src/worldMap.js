
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
        this.inDeepWaterZone = false;
        this.inZoneKey = null; //Zmienna do zapamiętywania klawisza do wchodzenia na region
        this.adrift = 0;    //Zmienna do kolizji odbicia
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.region = null; //Zmienna do zapamiętywania na jakim regionie jest gracz
        this.birdGroup = null; //Zmienna do grupy ptaków
        this.birdTimer = null; //Zmienna do timera ptaków
        this.waves = null; // Group to hold all the waves
        this.maxWaves = 100; // Maximum number of waves allowed on the screen
        this.waveDelay = 2000; // Delay between each wave appearance
        this.lastWaveTime = 0; // Timestamp of the last wave appearance
        this.deepwaterIsClose = false;
        this.seagullSound = null;
        this.windSound = null;
    }

    preload() {
        // Ładowanie zasobów specyficznych dla mapy świata...
    }

    create() {
        //Pobranie wartości z pliku UI.js
        this.uiScene = this.scene.get('ui');
        this.gameScene = this.scene.get('game');

        this.seagullSound = this.sound.add('seagulWorld', {loop: true});
        this.windSound = this.sound.add('windWorld', {loop: true, volume: 0.1 });

        this.playSoundWithRandomDelay(this.windSound, 5, 15);
        this.playSoundWithRandomDelay(this.seagullSound, 5, 15);
        // Ładowanie mapy
        const worldMap = this.make.tilemap({key: 'worldMap'});

        this.tileSetWorld = worldMap.addTilesetImage('tile', 'tiled',16,16);
        this.extra = worldMap.createLayer('extra', this.tileSetWorld);
        this.water = worldMap.createLayer('water', this.tileSetWorld);
        this.ground = worldMap.createLayer('ground', this.tileSetWorld);
        this.deepwater = worldMap.createLayer('deepwater', this.tileSetWorld);

        this.water.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.deepwater.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.ground.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });
        this.extra.setRenderOrder({renderX: 0, renderY: 0, renderWidth: 1920, renderHeight: 1080 });

        this.deepwater.setCollisionByProperty({collides: true});
        this.ground.setCollisionByProperty({collides: true});
        this.extra.setCollisionByProperty({collides: true});

        this.physics.world.setBounds(0, 0, 8000, 4000); // Ustaw granice świata

        this.gameScene.currentMap = 'worldMap';
        this.birdGroup = this.physics.add.group()
        this.waves = this.physics.add.group();

        // ładowanie łódki
        this.boat = this.physics.add.sprite(this.gameScene.boatRespawnX, this.gameScene.boatRespawnY, "boat");
        this.jamajka = this.physics.add.sprite(3150, 1680 , "QPH");
        this.havana = this.physics.add.sprite(1670, 650 , "QPH");
        this.panama = this.physics.add.sprite(3250, 1580 , "QPH");
        // Zmiana obszaru kolizji dla gracza
        this.boat.setPipeline('TextureTintPipeline'); // Enable the Texture Tint Pipeline
        this.boat.body.setSize(28, 22, 0.5, 0.5); // Set the size and offset of the collision body
        this.boat.setOrigin(0.5, 0.5); // Set the origin to the center of the sprite


        // Animacja fali
        this.anims.create({
            key: 'waveAnimation',
            frames: this.anims.generateFrameNumbers('wave', { start: 0, end: 3 }),
            frameRate: 3,
            repeat: -1
        });

        // Animacja ptaka
        this.anims.create({
            key: 'seagullAnimation',
            frames: this.anims.generateFrameNumbers('seagull', { start: 0, end: 2 }),
            frameRate: 6,
            repeat: -1
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

        //wpływanie na obiekt wyświetla się alert czy chce zmienić region po kliknięciu E zmienia się region
        //obiektem aktualnie może być łódka
        this.physics.add.overlap(this.boat, this.jamajka, () => {
            this.inZone = true;
            if (this.inZone === true && !this.text) {
                this.text = this.add.text(this.jamajka.x + 0 ,this.jamajka.y - 50, 'Wciśnij E, żeby wejść na region')
                  .setScale(1.5)
                  .setBackgroundColor('#808080')
                  .setColor('#000000')
                  .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
                this.region = 'jamajka';
            }
        });
        this.physics.add.overlap(this.boat, this.havana, () => {
            this.inZone = true;
            if (this.inZone === true && !this.text2) {
                this.text2 = this.add.text(this.havana.x + 0 ,this.havana.y - 50, 'Wciśnij E, żeby wejść na region')
                  .setScale(1.5)
                  .setBackgroundColor('#808080')
                  .setColor('#000000')
                  .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
                this.region = 'havana';
            }
        });

        this.physics.add.overlap(this.boat, this.panama, () => {
            this.inZone = true;
            if (this.inZone === true && !this.text3) {
                this.text3 = this.add.text(this.panama.x + 0 ,this.panama.y - 50, 'Wciśnij E, żeby wejść na region')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
                this.region = 'panama';
            }
        });


        // Kolizja z obiektem (Odpychanie łodzi od brzegu, aktualnie od łódki drugiej)
        this.boat.setCollideWorldBounds(true);

        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

        this.physics.add.collider(this.boat, this.deepwater, this.handleCollision , null, this);
        this.physics.add.collider(this.boat, this.ground, this.handleCollision , null, this);
        this.physics.add.collider(this.boat, this.extra, this.handleCollision , null, this);
    }

    update(time, delta) {

        super.update(time, delta);
        this.gameScene.timer += delta;
        this.gameScene.shipCooldown += delta;
        this.manageBirds();

        if (this.waves.getLength() < 300) {
            this.createWaves();
        }
        // Cooldown debuffa (Naprawa łodzi w czasie)
        this.shipDebuff()

        if(this.boatSpeed !== 0){
            this.boat.anims.resume();
        }else{
            this.boat.anims.pause();
        }
        // Poruszanie łodzią
        this.moveBoat(this.gameScene.timer);
        this.boatEngine(this.engine, this.gameScene.timer);
        this.gameScene.currentBoatSpeed = this.boatSpeed;
        this.cameras.main.startFollow(this.boat);
        this.gameScene.boatCurrentX = this.boat.x;
        this.gameScene.boatCurrentY = this.boat.y;
        // Sprawdzenie, czy łódka opuściła obszar kolizji
        this.inZone = false;
        if (this.inZone === false && this.physics.overlap(this.boat, this.jamajka) === false) {
            if (this.text) {
                this.text.destroy();
                this.text = null;
                this.inZoneKey.destroy();
            }
        }
        this.inZone = false;
        if (this.inZone === false && this.physics.overlap(this.boat, this.havana) === false) {
            if (this.text2) {
                this.text2.destroy();
                this.text2 = null;
                this.inZoneKey.destroy();
            }
        }
        this.inZone = false;
        if (this.inZone === false && this.physics.overlap(this.boat, this.panama) === false) {
            if (this.text3) {
                this.text3.destroy();
                this.text3 = null;
                this.inZoneKey.destroy();
            }
        }
    }
    handleCollision(){
        if (this.gameScene.timer >= 100) {
            console.log("KOLIZJA");
            this.boatSpeed = this.gameScene.boatMaxSpeed;

            this.adrift = 1;

            // Zmiana życia łodzi, jak ma 0 HP to i tak już jest
            if (this.gameScene.HP > 0) {
                this.uiScene.setHeartState()
            }
            this.gameScene.timer = 0;
        }
    }
    // Funkcje debuffa łodzi
    shipWrecked(){
        console.log("Shipwrecked")
        this.gameScene.shipCooldown = 0;
        this.gameScene.boatMaxSpeed = 0;
    }
    shipDebuff(){
        if(this.gameScene.shipDamaged && this.gameScene.shipCooldown >= this.gameScene.shipRepairTime){
            if(this.gameScene.HP === 3){
                this.gameScene.shipDamaged = false;

            }else{
                console.log("Naprawiono")
                this.gameScene.boatMaxSpeed = 150;
                this.uiScene.recoverHeart();
            }
            this.gameScene.shipCooldown = 0;
        }
    }
    changeMap() {
        console.log("zmiana mapy1: " + this.gameScene.currentMap + " inzone: " + this.inZone);
        switch (this.region) {
            case 'jamajka':
                this.windSound.stop();
                this.seagullSound.stop();
                this.gameScene.boatRespawnX = 1800;
                this.gameScene.boatRespawnY = 1800;
                this.gameScene.currentMap = 'jamajka';
                this.scene.stop('worldMap');
                this.scene.launch('jamajka');
                this.scene.sendToBack('jamajka');
                break;
            case 'havana':
                this.windSound.stop();
                this.seagullSound.stop();
                this.gameScene.boatRespawnX = 1800;
                this.gameScene.boatRespawnY = 1800;
                this.gameScene.currentMap = 'havana';
                this.scene.stop('worldMap');
                this.scene.launch('havana');
                this.scene.sendToBack('havana');
                break;
            case 'panama':
                this.windSound.stop();
                this.seagullSound.stop();
                this.gameScene.boatRespawnX = 1800;
                this.gameScene.boatRespawnY = 1800;
                this.gameScene.currentMap = 'panama';
                this.scene.stop('worldMap');
                this.scene.launch('panama');
                this.scene.sendToBack('panama');
                break;
        }
        console.log("zmiana mapy2: " + this.gameScene.currentMap + " inzone: " + this.inZone);
    }

    moveBoat(){
        // Wektor do sprawdzania rotacji łodzi
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        const changeAngle = 1;
        //const isOnDeepWater = this.physics.overlap(this.boat, this.deepwater);
        // Wyhamowanie przy dryfowaniu (odbiciu od lądu)
        if(this.adrift === 1){
            if(this.gameScene.timer >= 100){
                this.boatSpeed += 10;
                this.gameScene.timer = 0;
            }
            if(this.boatSpeed >= 0){
                this.boatSpeed = 0;
                this.adrift = 0;
            }
        }
        // Obracanie
        if(this.input.keyboard.addKey('A').isDown){
            this.boat.angle -= changeAngle;
        }else if(this.input.keyboard.addKey('D').isDown){
            this.boat.angle += changeAngle;
        }
        if(this.input.keyboard.addKey('W').isDown){
            // Jeżeli łódź się cofa, zatrzymaj ją
            if(this.boatSpeed === -20 && this.gameScene.timer >= 500){
                this.boatSpeed = 0;
                this.gameScene.timer = 0;
            } // Poruszanie łodzi (Rozpędzanie w czasie)
            if(this.boatSpeed <= this.gameScene.boatMaxSpeed){
                if(this.gameScene.timer >= 100){
                    //console.log(this.gameScene.timer)
                    this.boatSpeed += 20;
                    this.boat.setAcceleration(Math.cos(direction) * this.boatSpeed, Math.sin(direction) * this.boatSpeed);
                    this.gameScene.timer = 0;
                }
            }
        }else if(this.input.keyboard.addKey('W').isUp){
            //Utrzymanie prędkości
            this.engine = true;
        }
        if(this.input.keyboard.addKey('S').isDown){
            //Zatrzymywanie/cofanie łodzi
            this.boatStop()
        }else if (this.input.keyboard.addKey('S').isUp) {
            // Zwolniono klawisz "down"
            if (this.boatSpeed < 0 && this.gameScene.timer >= 250) {
                this.boatSpeed += 10;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
                this.gameScene.timer = 0;
            }
        }
    }
    // funkcja do zatrzymywania i cofania łodzi
    boatStop(){
        if (this.boatSpeed > 0) {
            if (this.gameScene.timer >= 100) {
                this.boatSpeed -= 10;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
                this.gameScene.timer = 0;
            }
        }
        if (this.boatSpeed <= 0 && this.gameScene.timer >= 250) {
            this.boatSpeed -= 10;
            this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
            if (this.boatSpeed <= this.gameScene.boatMaxReverseSpeed) {
                this.boatSpeed = this.gameScene.boatMaxReverseSpeed;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
            }
            this.gameScene.timer = 0;
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
    // Function to manage birds
    manageBirds() {
        const maxBirds = 90;

        // Create bird group if not already created
        if (!this.birdGroup) {
            this.birdGroup = this.physics.add.group();
        }

        // Check if the number of birds is less than the maximum limit
        if (this.birdGroup.getLength() < maxBirds) {
            // Randomly spawn a bird at a random position on the map
            const x = Phaser.Math.Between(0, 4000);
            const y = Phaser.Math.Between(0, 4000);

            // Create the bird sprite and add it to the bird groupp
            const bird = this.birdGroup.create(x, y, 'seagull');
            bird.anims.play('seagullAnimation', true);

            // Set a timer to remove the bird after 10 seconds
            this.time.addEvent({
                delay: 10000,
                callback: () => {
                    bird.destroy();
                },
                callbackScope: this,
            });

            // Add random velocity to the bird
            const birdSpeed = Phaser.Math.Between(50, 150);
            bird.setVelocity(Phaser.Math.Between(-birdSpeed, birdSpeed), Phaser.Math.Between(-birdSpeed, birdSpeed));

            // Update bird's rotation based on its velocity (direction of flight)
            bird.rotation = Phaser.Math.Angle.Between(0, 0, bird.body.velocity.x, bird.body.velocity.y) + Math.PI / 2;
        }

        // Update rotation of existing birds
        this.birdGroup.getChildren().forEach(bird => {
            bird.rotation = Phaser.Math.Angle.Between(0, 0, bird.body.velocity.x, bird.body.velocity.y) + Math.PI / 2;
        });
    }

    createWaves() {
        const currentTime = this.time.now;

        // Check if the maximum number of waves is already on the screen
        if (this.waves.getLength() < this.maxWaves && currentTime - this.lastWaveTime >= this.waveDelay) {
            // Randomly spawn a wave at a random position on the deepwater layer
            const waveX = Phaser.Math.Between(0, 4000);
            const waveY = Phaser.Math.Between(0, 4000);

            // Check if the wave is overlapping with the ground layer, if so, skip creating the wave
            if (this.ground.getTileAtWorldXY(waveX, waveY)) {
                return;
            }

            // Create the wave sprite on the deepwater layer
            const wave = this.waves.create(waveX, waveY, 'wave');
            wave.anims.play('waveAnimation', true);

            // Set a timer to remove the wave after 10 seconds
            this.time.addEvent({
                delay: 10000,
                callback: () => {
                    wave.destroy();
                },
                callbackScope: this,
            });

            // Set the wave's velocity to move towards the top right corner of the screen
            const waveSpeed = Phaser.Math.Between(30, 100);
            const waveAngle = Phaser.Math.Angle.Between(waveX, waveY, 4000, 0);
            wave.setVelocity(waveSpeed * Math.cos(waveAngle), waveSpeed * Math.sin(waveAngle));

            this.lastWaveTime = currentTime; // Update the timestamp of the last wave appearance

            // Check for collision with the ground layer
            this.physics.add.collider(wave, this.ground, () => {
                wave.destroy(); // Destroy the wave upon collision with the ground
            });
            // Check for collision with the ship
            this.physics.add.collider(wave, this.boat, () => {
                // Reduce the ship's speed by 10 upon collision with a wave
                this.boatSpeed -= 10;
                wave.destroy();
            });
        }
    }
    playSoundWithRandomDelay(sound, minDelay, maxDelay) {
        const delay = Phaser.Math.Between(minDelay, maxDelay) * 1000; // Zamiana sekund na milisekundy
        setTimeout(() => {
            sound.play();
        }, delay);
    }

}

