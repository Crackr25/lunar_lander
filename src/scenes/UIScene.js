import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // HUD Elements
        this.fuelBar = this.add.rectangle(20, 20, 200, 20, 0x00ff00).setOrigin(0, 0);
        this.fuelBorder = this.add.rectangle(20, 20, 200, 20).setStrokeStyle(2, 0xffffff).setOrigin(0, 0);
        this.fuelLabel = this.add.text(20, 45, 'FUEL', { fontSize: '14px', color: '#fff' });

        this.statsText = this.add.text(20, 70, '', { fontSize: '14px', color: '#fff' });

        // Listen to GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateHUD', this.updateHUD, this);
        gameScene.events.on('gameOver', this.showGameOver, this);
    }

    updateHUD(data) {
        // Update Fuel
        const fuelPercent = Phaser.Math.Clamp(data.fuel / 100, 0, 1);
        this.fuelBar.width = 200 * fuelPercent;
        if (fuelPercent < 0.3) this.fuelBar.fillColor = 0xff0000;
        else this.fuelBar.fillColor = 0x00ff00;

        // Update Stats
        this.statsText.setText([
            `V. Speed: ${data.vSpeed.toFixed(2)}`,
            `H. Speed: ${data.hSpeed.toFixed(2)}`,
            `Angle: ${(data.angle * 57.29).toFixed(1)}°`,
            `Alt: ${data.altitude.toFixed(0)}`
        ]);
    }

    showGameOver(data) {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        const bg = this.add.rectangle(width / 2, height / 2, 400, 300, 0x000000, 0.8);
        const title = this.add.text(width / 2, height / 2 - 50, data.success ? 'MISSION ACCOMPLISHED' : 'CRASHED', {
            fontSize: '32px',
            color: data.success ? '#00ff00' : '#ff0000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const msg = this.add.text(width / 2, height / 2, data.message, {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const restartBtn = this.add.text(width / 2, height / 2 + 60, 'RESTART', {
            fontSize: '24px',
            color: '#aaaaaa',
            backgroundColor: '#333333',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => restartBtn.setColor('#ffffff'))
            .on('pointerout', () => restartBtn.setColor('#aaaaaa'))
            .on('pointerdown', () => {
                this.scene.stop('GameScene');
                this.scene.start('GameScene'); // Restart game
                this.scene.restart(); // Restart UI
            });

        const menuBtn = this.add.text(width / 2, height / 2 + 110, 'MAIN MENU', {
            fontSize: '20px',
            color: '#aaaaaa'
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
                this.scene.stop();
            });
    }
}
