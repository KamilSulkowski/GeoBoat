import {setWynik, setOdp, zablokujPytanie, odblokujPytanie} from './data_access/data_access.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
        this.boat = null;   //Łódka gracza
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.boatMaxSpeed = 4 // Maksymalna prędkość łodzi
        this.boatMaxReverseSpeed = -0.5 // Maksymalna prędkość cofania łodzi
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
        this.inZone = false;//Flaga kolizji
        this.text = null;   //Tekst wyświetlany po wjechaniu w inny obiekt (Port)
        this.adrift = 0;    //Zmienna do kolizji odbicia
        this.currentMap = null; //Zmienna do zapamiętywania na jakiej mapie jest gracz
        this.shipCooldown = 0;//Zmienna do sprawdzania czasu naprawy
        this.shipRepairTime = 10000 //Zmienna czasu naprawy 10000 = 10s
        this.shipDamaged = false;//Flaga stanu statku (naprawa/sprawny)
    }
    preload(){
        this.load.json('regiony', '../json_files/regiony.json');
        this.load.json('kategorie', '../json_files/kategorie.json');
        this.load.json('pytania', '../json_files/pytania.json');
        this.load.json('odpowiedzi', '../json_files/odpowiedzi.json');
        this.load.json('odpowiedz_uzytkownika', '../json_files/odpowiedz_uzytkownika.json');
        this.load.json('uzytkownicy', '../json_files/uzytkownicy.json');
        this.load.json('wynik', '../json_files/wynik.json');
    }

    create(){
        // Dane z bazy do użytku
        const regiony = this.cache.json.get('regiony');
        const kategorie = this.cache.json.get('kategorie');
        const pytania = this.cache.json.get('pytania');
        const odpowiedzi = this.cache.json.get('odpowiedzi');
        const uzytkownicy = this.cache.json.get('uzytkownicy');
        let odpowiedz_uzytkownika = this.cache.json.get('odpowiedz_uzytkownika');
        let wynik = this.cache.json.get('wynik');

        //Pobranie wartości z pliku UI.js
        this.uiScene = this.scene.get('ui');

        const cw = this.cameras.main.width; // width main kamery
        const ch = this.cameras.main.height;// height main kamery

        // Dodanie łódek (Łódź gracza i inne do testów)
        this.boat = this.physics.add.sprite(cw * 0.5, ch * 0.5, "boat");
        this.boat2 = this.physics.add.sprite((cw * 0.5) + 50, (ch * 0.5) , "boat");
        this.boat_collider = this.physics.add.sprite((cw * 0.5) + -100, (ch * 0.5), "boat");



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
                const keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
                keyE.on('down', () => {
                    this.changeMap();
                });
            }
        });

        // Kolizja z obiektem (Odpychanie łodzi od brzegu, aktualnie od łódki drugiej)
        //this.boat.setCollideWorldBounds(true);
        this.physics.add.collider(this.boat, this.boat_collider, this.handleCollision, null, this);

        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

        // Poprawka: Ustawienie środka kamery na pozycję łodzi
        this.cameras.main.centerOn(this.boat.x, this.boat.y);

        this.scene.launch('regionMap');
        this.scene.sendToBack('regionMap');
        this.currentMap = 'regionMap';

        // Przykładowe wypisania
        // this.add.text(200, 200, kategorie[0].nazwa, { fontFamily: 'Arial', fontSize: 24, color: '#000000' });
        // this.add.text(400, 400, parseInt(odpowiedz_uzytkownika[0].czasOdpowiedzi) + 1);
    }

    //Funckja zmiany mapy po kliknięciu przycisku E
    changeMap(){
        console.log("zmiana mapy1: " + this.currentMap + " inzone: " + this.inZone);
        if (this.currentMap === 'worldMap') {
            this.currentMap = 'regionMap';
            this.scene.launch('regionMap');
            this.scene.sendToBack('regionMap');
            this.scene.stop('worldMap');
        } else if (this.currentMap === 'regionMap') {
            this.currentMap = 'worldMap';
            this.scene.launch('worldMap');
            this.scene.sendToBack('worldMap');
            this.scene.stop('regionMap');
        }
        console.log("zmiana mapy2: " + this.currentMap + " inzone: " + this.inZone);
    }


    // Funkcja kolizji, odbicie od lądu
    handleCollision(){
        console.log("KOLIZJA");
        this.boatSpeed = -1;
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
                this.boatMaxSpeed = 4;
                this.uiScene.recoverHeart();
            }
            this.shipCooldown = 0;
        }
    }
    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;
        this.shipCooldown += delta;
        // Cooldown debuffa (Naprawa łodzi w czasie)
        this.shipDebuff()

        // Zmiana strzałki kompasu w zależności od pozycji łodzi
        if(this.uiScene){
            this.uiScene.setCompassArrowAngle(this.boat.angle - 90);
        }
        // Poruszanie łodzią
        this.moveBoat(this.timer);
        this.boatEngine(this.engine, this.timer);
        // Podążanie kamery
        this.cameras.main.startFollow(this.boat);

        // Sprawdzenie, czy łódka opuściła obszar kolizji
        this.inZone = false;
        if (!this.inZone && !this.physics.overlap(this.boat, this.boat2)) {
            if (this.text) {
                this.text.destroy();
                this.text = null;
            }
        }
        // Koordynaty środka kamery
        //console.log(this.cameras.main.midPoint)
    }

    // Funkcja do sterowania łodzią
    moveBoat(){
        // Wektor do sprawdzania rotacji łodzi
        const direction = new Phaser.Math.Vector2(0, 0);
        direction.setToPolar(this.boat.rotation, 1);
        const dx = direction.x; //Kierunek rotacji x
        const dy = direction.y; //Kierunek rotacji y
        // Wyhamowanie przy dryfowaniu (odbiciu od lądu)
        if(this.adrift === 1 && this.boatSpeed <= 0){
            if(this.timer >= 100){
                this.boatSpeed += 0.1;
                this.timer = 0;
            }
            if(this.boatSpeed >= 0.001){
                this.boatSpeed = 0;
                this.adrift = 0;
            }
        }
        // Obracanie
        if(this.keys.left?.isDown){
            this.boat.angle -= this.boatSpeed / 2;
        }else if(this.keys.right?.isDown){
            this.boat.angle += this.boatSpeed / 2;
        }
        if(this.keys.up?.isDown){
            // Jeżeli łódź się cofa, zatrzymaj ją
            if(this.boatSpeed === -0.25 && this.timer >= 500){
                this.boatSpeed = 0;
                this.timer = 0;
            } // Poruszanie łodzi (Rozpędzanie w czasie)
            if(this.boatSpeed <= this.boatMaxSpeed){
                if(this.timer >= 100){
                    console.log(this.timer)
                    this.boatSpeed += 0.1;
                    this.boat.y -= this.boatSpeed *dy;
                    this.boat.x -= this.boatSpeed *dx;
                    this.timer = 0;

                    console.log(this.boatSpeed)
                }
            }
        }else if(this.keys.up?.isUp){
            //Utrzymanie prędkości
            this.engine = true;
        }
        if(this.keys.down?.isDown){
            //Zatrzymywanie/cofanie
            this.boatStop()
        }
    }
    // funkcja do zatrzymywania i cofania łodzi
    boatStop(){
        if(this.boatSpeed > 0){
            if(this.timer >= 100){
                this.boatSpeed -= 0.25;
                this.timer = 0;
            }// cofanie
        }else if(this.boatSpeed < 0){
            this.boatSpeed = this.boatMaxReverseSpeed;
            this.adrift = 1;
            console.log(this.boatSpeed)
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
            this.boat.y -= this.boatSpeed *dy;
            this.boat.x -= this.boatSpeed *dx;
        }
    }

}
