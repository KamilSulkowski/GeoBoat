export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
        this.boatRespawnX = 3150; //Współrzędne respawnu łodzi
        this.boatRespawnY = 1750; //Współrzędne respawnu łodzi
        this.shipDamaged = false; //Zmienna określająca czy statek został zniszczony
        this.shipRepairTime = 10000; //Czas naprawy statku
        this.shipCooldown = 0;//Zmienna do sprawdzania czasu naprawy
        this.boatMaxReverseSpeed = -50 // Maksymalna prędkość cofania łodzi
        this.boatMaxSpeed = 150 // Maksymalna prędkość łodzi
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.currentBoatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.currentMap = null; //Zmienna do przechowywania aktualnej mapy
        this.HP = 3; //Zmienna do przechowywania aktualnej ilości HP
        this.boatCurrentX = 0;
        this.boatCurrentY = 0;
    }
    preload(){
    }

    create(){
    }
    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }
}
