import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        console.log('BootScene: preload started');
        // Load SVG assets
        this.load.svg('lander', '/assets/lander.svg', { width: 40, height: 40 });
        this.load.svg('engine_flame', '/assets/engine_flame.svg', { width: 20, height: 40 });
        this.load.svg('landing_pad', '/assets/landing_pad.svg', { width: 60, height: 10 });
        this.load.svg('landing_pad', '/assets/landing_pad.svg', { width: 60, height: 10 });

        // We will generate terrain procedurally, but could load a texture here if needed

        this.load.on('complete', () => {
            console.log('BootScene: Asset loading complete');
        });

        this.load.on('loaderror', (file) => {
            console.error('BootScene: Asset load error:', file.key, file.src);
        });
    }

    create() {
        console.log('BootScene: create started');
        this.scene.start('MenuScene');
    }
}
