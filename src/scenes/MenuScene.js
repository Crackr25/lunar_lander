import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
        console.log('MenuScene: create started');
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        console.log(`MenuScene: Dimensions ${width}x${height}`);

        // Debug background
        this.add.rectangle(0, 0, width, height, 0x000033).setOrigin(0, 0);

        this.add.text(width / 2, height * 0.2, 'LUNAR LANDER', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const modes = [
            { key: 'FREE', text: 'Free Descent Mode' },
            { key: 'PRECISION', text: 'Precision Landing Mode' },
            { key: 'TIMED', text: 'Timed Mode' },
            { key: 'PAYLOAD', text: 'Payload Mode' }
        ];

        let y = height * 0.4;
        modes.forEach(mode => {
            const btn = this.add.text(width / 2, y, mode.text, {
                fontSize: '32px',
                fontFamily: 'Arial',
                color: '#aaaaaa'
            })
                .setOrigin(0.5)
                .setInteractive({ useHandCursor: true })
                .on('pointerover', () => btn.setColor('#ffffff'))
                .on('pointerout', () => btn.setColor('#aaaaaa'))
                .on('pointerdown', () => this.startGame(mode.key));

            y += 60;
        });

        // How to Play Button
        const guideBtn = this.add.text(width / 2, y + 20, 'HOW TO PLAY', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            backgroundColor: '#222222',
            padding: { x: 10, y: 5 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => guideBtn.setColor('#ffffff'))
            .on('pointerout', () => guideBtn.setColor('#aaaaaa'))
            .on('pointerdown', () => this.scene.start('GuideScene'));
    }

    startGame(mode) {
        this.scene.start('GameScene', { mode: mode });
    }

    update() {
        // console.log('MenuScene: update running'); // Commented out to avoid spam, uncomment if needed
    }
}
