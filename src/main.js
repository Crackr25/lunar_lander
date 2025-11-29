import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MenuScene from './scenes/MenuScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import GuideScene from './scenes/GuideScene';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#000000',
    parent: 'app',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0.5 }, // Global gravity, can be adjusted per body
            debug: false
        }
    },
    scene: [BootScene, MenuScene, GameScene, UIScene, GuideScene],
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

console.log('Main.js: Starting execution');

window.addEventListener('DOMContentLoaded', () => {
    console.log(`Main.js: DOMContentLoaded. Window size: ${window.innerWidth}x${window.innerHeight}`);
    const appDiv = document.getElementById('app');
    if (appDiv) {
        console.log('Main.js: Found #app div');
        appDiv.style.border = '2px solid red'; // Visual debug
    } else {
        console.error('Main.js: #app div NOT found');
    }

    // Singleton pattern to prevent multiple instances
    if (!window.game) {
        try {
            console.log('Main.js: Creating Phaser game instance');
            window.game = new Phaser.Game(config);
            console.log('Main.js: Game instance created');
        } catch (error) {
            console.error('Main.js: Error creating game instance:', error);
        }
    } else {
        console.log('Main.js: Game instance already exists');
    }
});
