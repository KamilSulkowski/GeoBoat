
export class RegionMap extends Phaser.Scene {
    constructor() {
        super('regionMap');
        this.tileSetWorld = null;
        this.water = null;
        this.ground = null;
        this.boat = null; // Przypisujemy łódź do właściwości klasy
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
        this.inZone = false;//Flaga kolizji
        this.inZoneKey = null; //Zmienna do zapamiętywania klawisza do wchodzenia na region
        this.text = null;   //Tekst wyświetlany po wjechaniu w inny obiekt (Port)
        this.adrift = 0;    //Zmienna do kolizji odbicia
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
    }

    preload() {

    }

    create() {
        //Pobranie wartości z pliku UI.js
        this.uiScene = this.scene.get('ui');
        this.gameScene = this.scene.get('game');
        this.regionMap = this.make.tilemap({key: 'regionMap'});

        this.tileSetWorld = this.regionMap.addTilesetImage('tile', 'tiled', 16, 16);
        this.water = this.regionMap.createStaticLayer('woda', this.tileSetWorld);
        this.ground = this.regionMap.createStaticLayer('ground', this.tileSetWorld);

        this.ground.setCollisionByProperty({collides: true});


        const debugGraphics = this.add.graphics().setAlpha(0.75);
        this.ground.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles,
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });


        // Dodaj fizykę do warstw

        this.cameras.main.setBounds(0, 0, 2000, 2000);

        this.gameScene.currentMap = 'regionMap';

        this.boat = this.physics.add.sprite(500, 500, "boat");
        this.boat2 = this.physics.add.sprite(600, 600, "PPH");
        this.quiz_test = this.physics.add.sprite(500, 500, "QPH");
        // Zmiana obszaru kolizji dla gracza
        this.boat.setOrigin(0.5, 0.5); // Set the origin to the center of the sprite
        this.boat.setPipeline('TextureTintPipeline'); // Enable the Texture Tint Pipeline
        this.boat.body.setSize(28, 22, 0.5, 0.5); // Set the size and offset of the collision body

        // Animacja łódki gracza
        this.anims.create({
            key: 'boatAnimation',
            frames: this.anims.generateFrameNumbers('boatAnim', {start: 0, end: 3}),
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
                this.text = this.add.text(this.boat2.x + 0, this.boat2.y - 50, 'Czy chcesz wejść na region ?')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('E')
                this.inZoneKey.on('down', () => {
                    this.changeMap()
                });
            }
        });
        //Wpływanie na quizy, alert
        this.physics.add.overlap(this.boat, this.quiz_test, () => {
            this.inZone = true;
            if (this.inZone === true && !this.quizText) {
                this.quizText = this.add.text(this.quiz_test.x + 0, this.quiz_test.y - 50, 'Wciśnij Q, żeby przejść do quizu.')
                    .setScale(1.5)
                    .setBackgroundColor('#808080')
                    .setColor('#000000')
                    .setStyle({fontFamily: "Arial"});
                this.inZoneKey = this.input.keyboard.addKey('Q');
                this.inZoneKey.on('down', () => {
                    this.uiScene.toggleQuiz()
                });
            }
        });

        // Animacja łódki gracza
        this.anims.create({
            key: 'boatAnimation',
            frames: this.anims.generateFrameNumbers('boatAnim', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });
        this.boat.play('boatAnimation');
        this.boat.anims.pause();


        this.physics.add.collider(this.boat, this.ground, this.handleCollision, null, this);

        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.boat, this.ground);

    }

    update(time, delta) {
        super.update(time, delta);
        this.gameScene.timer += delta;
        this.gameScene.shipCooldown += delta;
        // Cooldown debuffa (Naprawa łodzi w czasie)
        this.shipDebuff()
        // Zmiana strzałki kompasu w zależności od pozycji łodzi
        if (this.uiScene) {
            this.uiScene.setCompassArrowAngle(this.boat.angle - 90);
        }
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
        if (this.inZone === false && this.physics.overlap(this.boat, this.boat2) === false) {
            if (this.text) {
                this.text.destroy();
                this.text = null;
                this.inZoneKey.destroy();
            }
        }

        if (!this.inZone && !this.physics.overlap(this.boat, this.quiz_test)) {
            if (this.quizText) {
                this.quizText.destroy();
                this.quizText = null;
                this.inZoneKey.destroy();
            }
        }
    }

    handleCollision() {
        if (this.gameScene.timer >= 100) {
            console.log("KOLIZJA");
            this.boat.setTint(0xff0000);
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
    shipWrecked() {
        console.log("Shipwrecked")
        this.gameScene.shipCooldown = 0;
        this.gameScene.boatMaxSpeed = 0;
    }

    shipDebuff() {
        if (this.gameScene.shipDamaged && this.gameScene.shipCooldown >= this.gameScene.shipRepairTime) {
            if (this.gameScene.HP === 3) {
                this.gameScene.shipDamaged = false;

            } else {
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
            case 'regionMap':
                this.gameScene.boatRespawnX = 3100;
                this.gameScene.boatRespawnY = 1750;
                this.gameScene.currentMap = 'worldMap';
                this.scene.stop('regionMap');
                this.scene.launch('worldMap');
                this.scene.sendToBack('worldMap');
                break;
        }
        console.log("zmiana mapy2: " + this.gameScene.currentMap + " inzone: " + this.inZone);
    }

    moveBoat() {
        // Wektor do sprawdzania rotacji łodzi
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        const changeAngle = 1;
        //const isOnDeepWater = this.physics.overlap(this.boat, this.deepwater);
        // Wyhamowanie przy dryfowaniu (odbiciu od lądu)
        if (this.adrift === 1) {
            if (this.gameScene.timer >= 100) {
                this.boatSpeed += 10;
                this.gameScene.timer = 0;
            }
            if (this.boatSpeed >= 0) {
                this.boatSpeed = 0;
                this.adrift = 0;
            }
        }
        // Obracanie
        if (this.keys.left?.isDown) {
            this.boat.angle -= changeAngle;
        } else if (this.keys.right?.isDown) {
            this.boat.angle += changeAngle;
        }
        if (this.keys.up?.isDown) {
            // Jeżeli łódź się cofa, zatrzymaj ją
            if (this.boatSpeed === -20 && this.gameScene.timer >= 500) {
                this.boatSpeed = 0;
                this.gameScene.timer = 0;
            } // Poruszanie łodzi (Rozpędzanie w czasie)
            if (this.boatSpeed <= this.gameScene.boatMaxSpeed) {
                if (this.gameScene.timer >= 100) {
                    //console.log(this.gameScene.timer)
                    this.boatSpeed += 20;
                    this.boat.setAcceleration(Math.cos(direction) * this.boatSpeed, Math.sin(direction) * this.boatSpeed);
                    this.gameScene.timer = 0;
                }
            }
        } else if (this.keys.up?.isUp) {
            //Utrzymanie prędkości
            this.engine = true;
        }
        if (this.keys.down?.isDown) {
            //Zatrzymywanie/cofanie łodzi
            this.boatStop()
        } else if (this.keys.down?.isUp) {
            // Zwolniono klawisz "down"
            if (this.boatSpeed < 0 && this.gameScene.timer >= 250) {
                this.boatSpeed += 10;
                this.boat.setVelocity(this.boatSpeed, this.boatSpeed);
                this.gameScene.timer = 0;
            }
        }

        // if (isOnDeepWater) {
        //     this.gameScene.boatMaxReverseSpeed = -20;
        //     this.gameScene.boatMaxSpeed = 50;
        // }

    }

    // funkcja do zatrzymywania i cofania łodzi
    boatStop() {
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
    boatEngine(engine, timer) {
        // Wektor do sprawdzania rotacji łódki
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        if (engine = 1) {
            this.boat.setVelocity(-this.boatSpeed * dx, -this.boatSpeed * dy);
        }
    }

    deepWaterHandleCollision() {
        console.log("deepwater");

    }
}