
export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
        this.boatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.engine = 0;    //Zmienna do sprawdzania stanu rozpędu/hamowania łodzi
    }
    Preload(){

    }

    create(){
        // Ustawienie tła na niebieskie
        this.cameras.main.setBackgroundColor('#87CEEB');
        const bw = this.cameras.main.width; // width main kamery
        const bh = this.cameras.main.height;// height main kamery

        // ustawia wielkość kamery
        this.cameras.main.setBounds(0, 0, 800, 600);

        // Ustawienie łódki na środek ekranu
        this.boat = this.physics.add.sprite(bw * 0.5, bh * 0.5, "boat");
        
        // Druga łódka do testów
        this.boat2 = this.physics.add.sprite((bw * 0.5) + 200, (bh * 0.5) + 200, "boat");
    
        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();
    }

    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

        // Poruszanie łodzią
        this.moveBoat(this.timer);
        this.boatEngine(this.engine, this.timer);

        // kamera śledzi gracza
        this.cameras.main.startFollow(this.boat);

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

        if(this.keys.left?.isDown){
            this.boat.angle -= this.boatSpeed / 2;
        }else if(this.keys.right?.isDown){
            this.boat.angle += this.boatSpeed / 2;
        }
        if(this.keys.up?.isDown){
            // Poruszanie łodzi (Rozpędzanie w czasie)
            if(this.boatSpeed <= 4){
                if(this.timer >= 100){
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
            // Zatrzymywanie łodzi ("zrzucanie kotwicy")
            if(this.boatSpeed > 0){
                if(this.timer >= 100){
                    this.boatSpeed -= 0.25;
                    this.timer = 0;
                    if(this.boatSpeed < 0){
                        this.boatSpeed = 0;
                    }
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