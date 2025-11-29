import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        console.log('MenuScene: create started');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background (Dark with subtle gradient effect via overlay if needed, or just dark)
        this.add.rectangle(0, 0, width, height, 0x050510).setOrigin(0, 0);

        // Title
        const title = this.add.text(width / 2, height * 0.15, 'LUNAR LANDER', {
            fontSize: '64px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Title Shadow/Glow
        title.setShadow(4, 4, '#00ffff', 10, true, true);

        // Button Helper
        const createButton = (x, y, text, callback, color = 0x333333) => {
            const btnContainer = this.add.container(x, y);

            const btnBg = this.add.graphics();
            btnBg.fillStyle(color, 1);
            btnBg.fillRoundedRect(-150, -30, 300, 60, 15);

            const btnText = this.add.text(0, 0, text, {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            btnContainer.add([btnBg, btnText]);

            btnContainer.setSize(300, 60);
            btnContainer.setInteractive(new Phaser.Geom.Rectangle(-150, -30, 300, 60), Phaser.Geom.Rectangle.Contains);

            btnContainer.on('pointerover', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 100
                });
                btnBg.clear();
                btnBg.fillStyle(0x555555, 1); // Lighter on hover
                btnBg.fillRoundedRect(-150, -30, 300, 60, 15);
                // Glow border
                btnBg.lineStyle(2, 0x00ffff, 1);
                btnBg.strokeRoundedRect(-150, -30, 300, 60, 15);
            });

            btnContainer.on('pointerout', () => {
                this.tweens.add({
                    targets: btnContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100
                });
                btnBg.clear();
                btnBg.fillStyle(color, 1);
                btnBg.fillRoundedRect(-150, -30, 300, 60, 15);
            });

            btnContainer.on('pointerdown', callback);

            return btnContainer;
        };

        const modes = [
            { key: 'FREE', text: 'Free Descent Mode' },
            { key: 'PRECISION', text: 'Precision Landing' },
            { key: 'TIMED', text: 'Timed Mode' },
            { key: 'PAYLOAD', text: 'Payload Mode' }
        ];

        let y = height * 0.35;
        modes.forEach(mode => {
            createButton(width / 2, y, mode.text, () => this.startGame(mode.key));
            y += 80;
        });

        // How to Play Button (Distinct style)
        createButton(width / 2, y + 20, 'HOW TO PLAY', () => this.scene.start('GuideScene'), 0x222244);
    }

    startGame(mode) {
        this.scene.start('GameScene', { mode: mode });
    }

    update() {
        // console.log('MenuScene: update running'); // Commented out to avoid spam, uncomment if needed
    }
}
