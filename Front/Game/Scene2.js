class Scene2 extends Phaser.Scene {
    constructor() {
        super("playGame");
    }
    preload(){
    
    }

    create() {
        this.boat = this.add.image(this.game.config.width/2, this.game.config.height/2, "boat");
        //this.game.physics.enable(boat);
        //this.boat.anchor.set(64, 64);

        //this.boat.setScale(2);
        //this.boat.angle += 1;
        //this.boat.flipY = true;

        this.keys = this.input.keyboard.createCursorKeys();
        //this.boat.setCollidorWorldBounds(true);

        this.add.text(20, 20, "GeoBoat - World", {
            font: "18px Arial", 
            fill: "yellow"
        });
    }

    move(boat, speed){
        boat.y += speed;
        if (boat.y > this.game.config.height){
            this.reset(boat);
        }
    }
    reset(boat){
        boat.y = 0;
        var randomX = Phaser.Math.Between(0, this.game.config.width);
        boat.x = randomX;
    }
    update(){
        this.moveBoat(this.boat, 10);
    }

    moveBoat(){
        // let boatSpeed = 50;

        // if(this.keys.left.isDown){
        //     this.boat.setVelocityX(-boatSpeed);
        // }else if(this.keys.right.isDown){
        //     this.boat.setVelocityX(boatSpeed);
        // }else{
        //     this.boat.setVelocityX(0);
        //     this.boat.setVelocityY(0);
        // }
    }
}