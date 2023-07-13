
export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
    }
    Preload(){

    }
    create(){
        // Ustawienie tła na niebieskie
        this.cameras.main.setBackgroundColor('#87CEEB');

        // Ustawienie łódki na środek ekranu
        this.boat = this.physics.add.sprite(this.cameras.main.width / 2, this.cameras.main.height / 2, "boat");
        
        // Zmienna do ustawienia sterowania
        this.keys = this.input.keyboard.createCursorKeys();

    }

    update(time, delta) {
        super.update(time, delta);
        this.moveBoat(this.boat, 10);
    }

    // Funkcja do sterowania łodzią
    moveBoat(){
        const boatSpeed = 50;

        if(this.keys.left?.isDown){
            this.boat.angle += 1;
        }else if(this.keys.right?.isDown){
            this.boat.angle -= 1;
        }else if(this.keys.up?.isDown){
                this.boat.setVelocityY(boatSpeed);
        }else if(this.keys.down?.isDown){
            this.boat.setVelocityY(-boatSpeed);}
        // }else{
        //     this.boat.setVelocityX(0);
        //     this.boat.setVelocityY(0);
        // }
    }
}