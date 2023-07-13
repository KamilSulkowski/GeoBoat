
import Preloader from "./Preloader.js";
import Game from './game.js';

export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        },
    },
    scene: [Preloader, Game],
    scale: {
        zoom: 1
    }
});