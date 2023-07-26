
import Preloader from "./scenes/Preloader.js";
import Game from './game.js';
import UI from "./scenes/UI.js";
import {WorldMap} from "./worldMap.js";
import {Jamajka} from "./jamajka.js";
import {Havana} from "./havana.js";
import {Panama} from "./panama.js";
import {Login} from "./login.js";
//import Wrap from '../../node_modules/phaser3-rex-plugins/plugins/text/wrap.js';
//import { Wrap } from "phaser3-rex-plugins";
export default new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'app',
    width: window.innerWidth, //width mapy - 8000
    height: window.innerHeight,//height mapy - 5248
    backgroundColor: '#00bfff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            pixelArt: true,
            debug: true
        },
    },
    scene: [Preloader, Login, Game, UI, WorldMap, Jamajka, Havana, Panama],
    dom: {
        createContainer: true
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    render: {
        antialias: true,
    }
});