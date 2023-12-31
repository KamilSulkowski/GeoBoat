export class Panama extends Phaser.Scene {
    constructor() {
        super('panama');
        this.tileSetWorld = null;
        this.water = null;
        this.ground = null;
        this.boat = null; // Przypisujemy łódź do właściwości klasy
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
        this.inZone = false;//Flaga kolizji
        this.inZoneKey = null; //Zmienna do zapamiętywania klawisza do wchodzenia na region
        this.adrift = 0;    //Zmienna do kolizji odbicia
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.birdGroup = null; //Zmienna do grupy ptaków
        this.birdTimer = null; //Zmienna do timera ptaków
        this.waves = null; // Group to hold all the waves
        this.maxWaves = 50; // Maximum number of waves allowed on the screen
        this.waveDelay = 2000; // Delay between each wave appearance
        this.lastWaveTime = 0; // Timestamp of the last wave appearance
        this.regionFlag = "Panama";
        this.seagullSound = null;
    }
    preload(){

    }
    create() {
        this.gameScene = this.scene.get('game');
        this.gameScene.currentMap = 'panama';
        //Pobranie wartości z pliku UI.js
        this.uiScene = this.scene.get('ui');

        this.seagullSound = this.sound.add('seagulRegion', {loop: true, volume: 0.1});
        this.seagullSound.play();

        const panama = this.make.tilemap({key: 'panama'});

        this.tileSetWorld = panama.addTilesetImage('tile', 'tiled',16,16);
        this.water = panama.createLayer('water', this.tileSetWorld);
        this.ground = panama.createLayer('ground', this.tileSetWorld);
        this.tileHouseBig = panama.addTilesetImage('housebig', 'housebig',16,16);
        this.tileTower = panama.addTilesetImage('tower', 'tower',16,16);
        this.tilePalm = panama.addTilesetImage('palm', 'palm',16,16);
        this.tileHouse = panama.addTilesetImage('house_scaled', 'house_scaled',16,16);
        panama.createLayer('housebig', this.tileHouseBig);
        panama.createLayer('tower', this.tileTower);
        panama.createLayer('palm', this.tilePalm);
        panama.createLayer('house_scaled', this.tileHouse);



        this.ground.setCollisionByProperty({collides: true});

        // Dodaj fizykę do warstw

        this.cameras.main.setBounds(0, 0, 2000, 2000);

        this.gameScene.currentMap = 'panama';
        this.birdGroup = this.physics.add.group()
        this.waves = this.physics.add.group();

        this.boat = this.physics.add.sprite(3150, 1750, "boat");
        this.port = this.physics.add.sprite(125, 940 , "PPH");
        this.cityPort = this.physics.add.sprite(520, 580, "QPH");
        this.backToWorld = this.physics.add.sprite(1900, 1900, "backToWorld");
        this.pirateTeacher = this.physics.add.sprite(80, 850, "pirateTeacher");

        // Zmiana obszaru kolizji dla npca naukowego
        this.pirateTeacher.setPipeline('TextureTintPipeline'); // Enable the Texture Tint Pipeline
        this.pirateTeacher.body.setSize(300, 140, 0.5, 0.5); // Set the size and offset of the collision body
        this.pirateTeacher.setOrigin(0.5, 0.5); // Set the origin to the center of the sprite
        // Zmiana obszaru kolizji dla gracza
        this.boat.setOrigin(0.5, 0.5); // Set the origin to the center of the sprite
        this.boat.setPipeline('TextureTintPipeline'); // Enable the Texture Tint Pipeline
        this.boat.body.setSize(28, 22, 0.5, 0.5); // Set the size and offset of the collision body

        //Animacja strzałki
        this.anims.create({
            key: 'backToWorldAnimation',
            frames: this.anims.generateFrameNumbers('backToWorld', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.backToWorld.play('backToWorldAnimation');
        // Animacja łódki gracza
        this.boat.play('boatAnimation');
        this.boat.anims.pause();

        //wpływanie na obiekt wyświetla się alert czy chce zmienić region po kliknięciu E zmienia się region
        //obiektem aktualnie może być łódka

        //Wpływanie na quizy, alert
        this.physics.add.overlap(this.boat, this.cityPort, () => {
            this.inZone = true;
            if (this.inZone === true && !this.quizText) {
                this.quizText = this.add.text(this.cityPort.x + 0 ,this.cityPort.y - 50, 'Wciśnij E, żeby przejść do quizu.')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E');
                this.inZoneKey.on('down', () => { this.uiScene.toggleQuiz(2)});
            }
        });

        this.physics.add.overlap(this.boat, this.backToWorld, () => {
            this.inZone = true;
            if (this.inZone === true && !this.backToWorldText) {
                this.backToWorldText = this.add.text(this.backToWorld.x - 400 ,this.backToWorld.y - 50, 'Wciśnij E, żeby przejść na mapę świata.')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {this.changeMap()});
            }
        });

        this.physics.add.overlap(this.boat, this.pirateTeacher, () => {
            this.inZone = true;
            if (this.inZone === true && !this.learnText) {
                this.learnText = this.add.text(this.pirateTeacher.x + 0 ,this.pirateTeacher.y - 50, 'Wciśnij E, żeby dowiedzieć się czegoś o tym miejscu.')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E');
                this.inZoneKey.on('down', () => { this.uiScene.toggleLearning(this.regionFlag)});
            }
        });
        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

        // Kolizja z obiektem (Odpychanie łodzi od brzegu, aktualnie od łódki drugiej)
        this.physics.add.collider(this.boat, this.ground, this.handleCollision , null, this);
        this.physics.add.collider(this.boat, this.stones, this.handleCollision , null, this);

        this.physics.world.setBounds(0, 0, 2000, 2000, true, true, true, true);
        this.physics.add.existing(this.boat);
        this.boat.body.setCollideWorldBounds(true);
    }

    update(time, delta) {
        super.update(time, delta);
        this.gameScene.timer += delta;
        this.gameScene.shipCooldown += delta;
        this.manageBirds();
        if (this.waves.getLength() < 100) {
            this.createWaves();
        }

        //Wyświetlanie nazwy i poziomu gracza
        if (this.uiScene.userData) {
            this.uiScene.user = this.uiScene.userData.find((row) => row.nazwa === this.uiScene.userName);
            this.uiScene.userText.setText(this.uiScene.userName);
            this.uiScene.expText.setText('Level ' + this.uiScene.user.poziom);
        }

        // Cooldown debuffa (Naprawa łodzi w czasie)
        this.shipDebuff()
        // Zmiana strzałki kompasu w zależności od pozycji łodzi
        // if(this.uiScene){
        //     this.uiScene.setCompassArrowAngle(this.boat.angle - 90);
        // }
        if(this.gameScene.currentBoatSpeed !== 0){
            this.boat.anims.resume();
        }else{
            this.boat.anims.pause();
        }
        // Poruszanie łodzią
        this.moveBoat(this.gameScene.timer);
        this.boatEngine(this.engine, this.gameScene.timer);
        this.gameScene.currentBoatSpeed = this.boatSpeed;
        this.cameras.main.startFollow(this.boat);
        // Sprawdzenie, czy łódka opuściła obszar kolizji
        this.inZone = false;

        if (!this.inZone && !this.physics.overlap(this.boat, this.cityPort)) {
            if (this.quizText) {
                this.quizText.destroy();
                this.quizText = null;
                this.inZoneKey.destroy();
            }
        }
        if (!this.inZone && !this.physics.overlap(this.boat, this.backToWorld)) {
            if (this.backToWorldText) {
                this.backToWorldText.destroy();
                this.backToWorldText = null;
                this.inZoneKey.destroy();
            }
        }
        if (!this.inZone && !this.physics.overlap(this.boat, this.pirateTeacher)) {
            if (this.learnText) {
                this.learnText.destroy();
                this.learnText = null;
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
        switch (this.gameScene.currentMap) {
            case 'panama':
                this.seagullSound.stop();
                this.gameScene.boatRespawnX = 3150;
                this.gameScene.boatRespawnY = 1750;
                this.gameScene.currentMap = 'worldMap';
                this.scene.stop('panama');
                this.scene.launch('worldMap');
                this.scene.sendToBack('worldMap');
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
    deepWaterHandleCollision() {
        console.log("deepwater");

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
            const x = Phaser.Math.Between(0, this.physics.world.bounds.width);
            const y = Phaser.Math.Between(0, this.physics.world.bounds.height);

            // Create the bird sprite and add it to the bird group
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
            const waveX = Phaser.Math.Between(0, 2000);
            const waveY = Phaser.Math.Between(0, 2000);

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
            const waveAngle = Phaser.Math.Angle.Between(waveX, waveY, 2000, 0);
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
}