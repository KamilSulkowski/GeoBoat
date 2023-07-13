import Preloader from "./scenes/Preloader.js";
import Game from './game.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: 1000, //width mapy - 8000
    height: 800,//height mapy - 5248
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        },
    },
    scene: [Preloader, Game],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        zoom: 1
    }
});