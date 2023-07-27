export default class Game extends Phaser.Scene {
    constructor() {
        super('game');
        this.boatRespawnX = null; //Współrzędne respawnu łodzi
        this.boatRespawnY = null; //Współrzędne respawnu łodzi
        this.shipDamaged = false; //Zmienna określająca czy statek został zniszczony
        this.shipRepairTime = 10000; //Czas naprawy statku
        this.shipCooldown = 0;//Zmienna do sprawdzania czasu naprawy
        this.boatMaxReverseSpeed = -50 // Maksymalna prędkość cofania łodzi
        this.boatMaxSpeed = 150 // Maksymalna prędkość łodzi
        this.timer = 0;     //Zmienna do przeliczania czasu (używana przy łodzi atm)
        this.currentBoatSpeed = 0; //Zmienna do ustawiania prędkości łódki
        this.currentMap = 'worldmap'; //Zmienna do przechowywania aktualnej mapy
        this.HP = 3; //Zmienna do przechowywania aktualnej ilości HP
    }
    preload(){
    }

    create(data){
        var user = data.userData.find((row) => row.nazwa === data.login);
        this.boatRespawnX = user.lokalizacjaX; //Współrzędne respawnu łodzi
        this.boatRespawnY = user.lokalizacjaY; //Współrzędne respawnu łodzi
        console.log('hp: ', this.HP);
        console.log('x: ', this.boatRespawnX);
        console.log('y: ', this.boatRespawnY);
        this.scene.start('worldMap');
    }
    update(time, delta) {
        super.update(time, delta);
        this.timer += delta;

    }
}
