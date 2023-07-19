import Preloader from "./scenes/Preloader.js";
import Game from './game.js';
import UI from "./scenes/UI.js";
import {WorldMap} from "./worldMap.js";
import {RegionMap} from "./regionMap.js";
import Quiz from "./scenes/Quiz.js";
export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: window.innerWidth, //width mapy - 8000
    height: window.innerHeight,//height mapy - 5248
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
        },
    },
    scene: [Preloader, Game, UI, WorldMap, RegionMap, Quiz],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
});