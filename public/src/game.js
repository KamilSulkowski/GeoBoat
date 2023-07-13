
export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }
    Preload(){

    }
    create(){
        // Ustawienie tła na niebieskie
        this.cameras.main.setBackgroundColor('#87CEEB');
        // ustawia wielkość kamery
        this.cameras.main.setBounds(0,0, 800,600);

        // Ustawienie łódki na środek ekranu
        this.boat = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, "boat");
        this.boat2 = this.physics.add.sprite((this.cameras.main.width / 2) + 200, (this.cameras.main.height / 2) + 200, "boat");
        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

    }

    update(time, delta) {
        super.update(time, delta);

        this.moveBoat(this.boat, 10);
        // kamera śledzi gracza
        this.cameras.main.startFollow(this.boat);

    }

    // Funkcja do sterowania łodzią
    moveBoat(){
        const boatSpeed = 50;

        if(this.keys.left?.isDown){
            this.boat.angle -= 1;
        }else if(this.keys.right?.isDown){
            this.boat.angle += 1;
        }else if(this.keys.up?.isDown){
                this.boat.setVelocityY(-boatSpeed);
        }else if(this.keys.down?.isDown){
            this.boat.setVelocityY(boatSpeed);
        } else {
             this.boat.setVelocityX(0);
             this.boat.setVelocityY(0);
         }
    }
}