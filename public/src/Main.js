import Preloader from "./scenes/Preloader.js";
import Game from './game.js';
import {Regions} from "./regions.js";
import {WorldMap} from "./worldMap.js";

export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: window.innerWidth, //width mapy - 8000
    height: window.innerHeight,//height mapy - 5248
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        },
    },
    scene: [Preloader, Game, Regions, WorldMap],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
});