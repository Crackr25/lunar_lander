import Phaser from 'phaser';

export default class GuideScene extends Phaser.Scene {
    constructor() {
        super('GuideScene');
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Background
        this.add.rectangle(0, 0, width, height, 0x000022).setOrigin(0, 0);

        // Title
        this.add.text(width / 2, 40, 'HOW TO PLAY', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Controls Section
        let y = 100;
        this.addSection(width / 2, y, 'CONTROLS', [
            'Thrust: UP Arrow or W',
            'Rotate Left: LEFT Arrow or A',
            'Rotate Right: RIGHT Arrow or D'
        ]);

        // Modes Section
        y += 140;
        this.addSection(width / 2, y, 'GAME MODES', [
            'Free Descent: Land on any pad',
            'Precision: Target specific pads',
            'Timed: Land before time runs out',
            'Payload: Heavy lander, harder physics'
        ]);

        // HUD Section
        y += 160;
        this.addSection(width / 2, y, 'HUD & STATS', [
            'Fuel: Keep it above 0!',
            'V. Speed: Must be < 2.0 to land',
            'H. Speed: Must be < 1.0 to land',
            'Angle: Must be near 0° (upright)'
        ]);

        // Back Button
        const backBtn = this.add.text(width / 2, height - 50, 'BACK TO MENU', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#aaaaaa',
            backgroundColor: '#333333',
            padding: { x: 20, y: 10 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => backBtn.setColor('#ffffff'))
            .on('pointerout', () => backBtn.setColor('#aaaaaa'))
            .on('pointerdown', () => this.scene.start('MenuScene'));
    }

    addSection(x, y, title, items) {
        this.add.text(x, y, title, {
            fontSize: '24px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        y += 30;
        items.forEach((item, index) => {
            this.add.text(x, y + (index * 25), item, {
                fontSize: '18px',
                color: '#cccccc'
            }).setOrigin(0.5);
        });
    }
}
