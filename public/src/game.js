export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.boatMaxSpeed = 4 // Maksymalna prędkość łodzi
        this.boatMaxReverseSpeed = -0.5 // Maksymalna prędkość cofania łodzi
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
        this.inZone = false;//Flaga kolizji
        this.text = null;   //Tekst wyświetlany po wjechaniu w inny obiekt (Port)
        this.adrift = 0;    //Zmienna do kolizji odbicia

    }
    preload(){
        this.load.json('regiony', '../json_files/regiony.json');
        this.load.json('kategorie', '../json_files/kategorie.json');
    }

    create(){
        // Ustawienie tła na niebieskie
        this.cameras.main.setBackgroundColor('#87CEEB');
        const bw = this.cameras.main.width; // width main kamery
        const bh = this.cameras.main.height;// height main kamery

        // Dodanie łódek (Łódź gracza i inne do testów)
        this.boat = this.physics.add.sprite(bw * 0.5, bh * 0.5, "boat");
        this.boat2 = this.physics.add.sprite((bw * 0.5) + 200, (bh * 0.5) + 200, "boat");
        this.boat_collider = this.physics.add.sprite((bw * 0.5) + -100, (bh * 0.5), "boat");
        
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
            }
        });
        
        // Kolizja z obiektem (Odpychanie łodzi od brzegu, aktualnie od łódki drugiej)
        this.boat.setCollideWorldBounds(true);
        this.physics.add.collider(this.boat, this.boat_collider, this.handleCollision, null, this);
    
        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

        // Ustawienie granic kamery na obszar gry
        // Poprawka: Użyj pełnych wymiarów mapy, a nie wartości stałych
        this.cameras.main.setBounds(0, 0, 8000, 5248);

        // Poprawka: Ustawienie środka kamery na pozycję łodzi
        this.cameras.main.centerOn(this.boat.x, this.boat.y);

        // Przykładowy zapis danych
        const dane = {
            nazwa: 'Polska'
        };
        fetch('/data/region/insert', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dane)
        })
            .then(response => {
                if (response.ok) {
                    console.log('Dane zapisane pomyślnie');
                } else {
                    console.error('Error:', response.statusText);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // Przykładowe wypisanie kategorii
        const kategorie = this.cache.json.get('kategorie');
        this.add.text(200, 200, kategorie[0].nazwa, { fontFamily: 'Arial', fontSize: 24, color: '#000000' });

        //Przykładowe wypisanie regionu
        const regiony = this.cache.json.get('regiony');
        this.add.text(400, 400, regiony[0].nazwa, { fontFamily: 'Arial', fontSize: 24, color: '#000000' });
    }
    // Funkcja kolizji, odbicie od lądu
    handleCollision(){
        console.log("KOLIZJA");
        this.boatSpeed = -1;
        this.adrift = 1;
    }
    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

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
            if(this.boatSpeed <= 4){
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
                // Cofanie
                if(this.boatSpeed < 0){
                    this.boatSpeed = this.boatMaxReverseSpeed;
                    console.log(this.boatSpeed)
                }
            }
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