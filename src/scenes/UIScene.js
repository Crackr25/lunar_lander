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

        // 1. Dark Overlay (Fade in)
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0);
        this.tweens.add({
            targets: overlay,
            alpha: 0.7,
            duration: 500
        });

        // 2. Card Container
        const cardWidth = 400;
        const cardHeight = 300;
        const cardX = width / 2;
        const cardY = height / 2;

        const card = this.add.container(cardX, cardY);
        card.setAlpha(0);
        card.setScale(0.8);

        // Card Background (Rounded Rect)
        const cardBg = this.add.graphics();
        cardBg.fillStyle(0x1a1a1a, 0.95);
        cardBg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);

        // Border (Color based on success)
        const borderColor = data.success ? 0x00ff00 : 0xff0000;
        cardBg.lineStyle(2, borderColor, 1);
        cardBg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 20);

        card.add(cardBg);

        // 3. Text Content
        const titleText = data.success ? 'MISSION ACCOMPLISHED' : 'CRASHED';
        const titleColor = data.success ? '#00ff00' : '#ff0000';

        const title = this.add.text(0, -80, titleText, {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: titleColor,
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add shadow to title
        title.setShadow(2, 2, '#000000', 2, true, true);
        card.add(title);

        const msg = this.add.text(0, -20, data.message, {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#cccccc'
        }).setOrigin(0.5);
        card.add(msg);

        // 4. Buttons (Helper function)
        const createButton = (y, text, callback) => {
            const btnContainer = this.add.container(0, y);

            const btnBg = this.add.graphics();
            btnBg.fillStyle(0x333333, 1);
            btnBg.fillRoundedRect(-100, -20, 200, 40, 10);

            const btnText = this.add.text(0, 0, text, {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnText]);

            // Interaction
            btnContainer.setSize(200, 40);
            btnContainer.setInteractive(new Phaser.Geom.Rectangle(-100, -20, 200, 40), Phaser.Geom.Rectangle.Contains);

            btnContainer.on('pointerover', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
                btnBg.clear();
                btnBg.fillStyle(0x555555, 1);
                btnBg.fillRoundedRect(-100, -20, 200, 40, 10);
            });

            btnContainer.on('pointerout', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
                btnBg.clear();
                btnBg.fillStyle(0x333333, 1);
                btnBg.fillRoundedRect(-100, -20, 200, 40, 10);
            });

            btnContainer.on('pointerdown', callback);

            return btnContainer;
        };

        const restartBtn = createButton(50, 'RESTART', () => {
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
            this.scene.restart();
        });
        card.add(restartBtn);

        const menuBtn = createButton(110, 'MAIN MENU', () => {
            this.scene.stop('GameScene');
            this.scene.start('MenuScene');
            this.scene.stop();
        });
        card.add(menuBtn);

        // Animate Card In
        this.tweens.add({
            targets: card,
            alpha: 1,
            scale: 1,
            y: height / 2, // Ensure it ends up centered
            duration: 500,
            ease: 'Back.out'
        });

        // 5. Space Key Restart
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.stop('GameScene');
            this.scene.start('GameScene');
            this.scene.restart();
        });
    }
}
