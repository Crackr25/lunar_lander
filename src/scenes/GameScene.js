import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.gameMode = data.mode || 'FREE';
        this.fuel = 100;
        this.maxFuel = 100;
        this.gravity = 0.5; // Matter.js world gravity y
        this.thrustForce = 0.01; // Reduced from 0.025
        this.rotationSpeed = 0.05; // Rotation speed

        // Landing safety parameters
        this.safeVerticalVelocity = 4.0; // Increased from 2.0
        this.safeHorizontalVelocity = 2.0; // Increased from 1.0
        this.safeAngle = 0.5; // ~28 degrees (Increased from 0.3)

        // Reset state
        this.isGameOver = false;
        this.hasLanded = false;

        console.log('GameScene: init complete', this.gameMode);
    }

    create() {
        console.log('GameScene: create started');
        // Create Starfield Background
        this.createStarfield();

        // Generate Terrain
        this.generateTerrain();

        // Create Lander
        this.createLander();

        // Inputs
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // Collision Events
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach((pair) => {
                const bodyA = pair.bodyA;
                const bodyB = pair.bodyB;

                if (bodyA === this.lander.body || bodyB === this.lander.body) {
                    const otherBody = bodyA === this.lander.body ? bodyB : bodyA;
                    this.handleCollision(otherBody);
                }
            });
        });

        // Camera follow
        this.cameras.main.startFollow(this.lander);
        this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height * 2);

        // World Bounds
        // x, y, width, height, thickness, left, right, top, bottom
        this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height * 2, 64, true, true, true, true);

        // Launch HUD
        this.scene.launch('UIScene');
        console.log('GameScene: create complete');
    }

    createStarfield() {
        const width = this.scale.width;
        const height = this.scale.height * 2; // Cover full terrain height

        // Create multiple layers of stars
        const layers = [
            { count: 200, color: 0xffffff, alpha: 1, size: 2, scrollFactor: 0.1 }, // Distant
            { count: 100, color: 0xaaaaff, alpha: 0.8, size: 3, scrollFactor: 0.2 }, // Mid
            { count: 50, color: 0xffaaaa, alpha: 0.6, size: 4, scrollFactor: 0.5 }   // Close
        ];

        layers.forEach(layer => {
            const graphics = this.add.graphics({ x: 0, y: 0 });
            graphics.fillStyle(layer.color, layer.alpha);

            for (let i = 0; i < layer.count; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                graphics.fillPoint(x, y, layer.size);
            }

            graphics.setScrollFactor(layer.scrollFactor);
        });
    }

    createFallingStar() {
        // Random chance to spawn a falling star
        if (Math.random() > 0.02) return; // 2% chance per frame

        const startX = Math.random() * this.scale.width;
        const startY = Math.random() * (this.scale.height / 2); // Start in upper half
        const endX = startX + (Math.random() * 200 - 100);
        const endY = startY + (Math.random() * 200 + 100);

        const star = this.add.line(0, 0, startX, startY, startX, startY, 0xffffff);
        star.setLineWidth(2);
        star.setScrollFactor(0); // UI layer effect

        this.tweens.add({
            targets: star,
            duration: 500 + Math.random() * 500,
            alpha: { from: 1, to: 0 },
            x: endX - startX, // Move relative
            y: endY - startY,
            onUpdate: () => {
                // Update line end point to create trail effect? 
                // Simplified: just moving the line object for now
                star.geom.x2 = star.geom.x1 + (endX - startX);
                star.geom.y2 = star.geom.y1 + (endY - startY);
            },
            onComplete: () => {
                star.destroy();
            }
        });
    }

    generateTerrain() {
        const width = this.scale.width;
        const height = this.scale.height * 2;
        const groundY = height - 100;

        // Create a jagged line
        const points = [];
        const segments = 20;
        const segmentWidth = width / segments;

        points.push({ x: 0, y: height }); // Bottom Left
        points.push({ x: 0, y: groundY }); // Start of terrain

        let currentX = 0;

        // Define pad locations (flat spots)
        // We'll place 3 pads
        const pads = [
            { index: 5, width: 100, type: 'easy' },
            { index: 10, width: 60, type: 'medium' },
            { index: 15, width: 40, type: 'hard' },
            { index: 8, width: 150, type: 'power' }
        ];

        for (let i = 0; i < segments; i++) {
            currentX += segmentWidth;
            let y = groundY + (Math.random() * 100 - 50);

            // Check if this segment is a pad
            const pad = pads.find(p => p.index === i);
            if (pad) {
                // Flatten this segment for the pad
                y = groundY + (Math.random() * 50 - 25); // Random height for pad
                // Create pad sprite/body
                const padX = currentX - segmentWidth / 2;
                this.createPad(padX, y, pad.width, pad.type);

                // Adjust points to be flat
                points.push({ x: currentX - segmentWidth, y: y });
                points.push({ x: currentX, y: y });
            } else {
                points.push({ x: currentX, y: y });
            }
        }

        points.push({ x: width, y: height }); // Bottom Right

        // Create terrain body
        const terrain = this.add.graphics();
        terrain.fillStyle(0x555555); // Darker gray rock
        terrain.fillPoints(points, true, true);
        terrain.lineStyle(4, 0x888888); // Lighter gray outline
        terrain.strokePoints(points, true, true);

        // Physics for terrain (simplified chain of edges)
        for (let i = 1; i < points.length - 2; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            const cx = (p1.x + p2.x) / 2;
            const cy = (p1.y + p2.y) / 2;
            const dist = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
            const angle = Phaser.Math.Angle.Between(p1.x, p1.y, p2.x, p2.y);

            this.matter.add.rectangle(cx, cy, dist, 2, {
                isStatic: true,
                angle: angle,
                label: 'terrain'
            });
        }
    }
    createPad(x, y, width, type) {
        // 1. Physics Body (Invisible, handles collision)
        // We use a rectangle sensor or static body
        const padHeight = 20; // Slightly thicker for visual platform
        const body = this.matter.add.rectangle(x, y, width, padHeight, {
            isStatic: true,
            label: 'pad_' + type
        });

        // 2. Visual Container
        const container = this.add.container(x, y);

        // 3. Graphics for the platform
        const graphics = this.add.graphics();
        container.add(graphics);

        // Colors
        let mainColor = 0x888888; // Default concrete
        let lightColor = 0xff0000;
        let glowColor = 0x000000;

        if (type === 'easy') { mainColor = 0x444444; lightColor = 0x00ff00; }
        else if (type === 'medium') { mainColor = 0x444444; lightColor = 0xffff00; }
        else if (type === 'hard') { mainColor = 0x222222; lightColor = 0xff0000; }
        else if (type === 'power') { mainColor = 0x222244; lightColor = 0x00ffff; glowColor = 0x00ffff; }

        // Draw Support Legs (Truss structure)
        graphics.lineStyle(2, 0x555555);
        const legSpacing = 20;
        for (let lx = -width / 2 + 10; lx < width / 2; lx += legSpacing) {
            graphics.moveTo(lx, 0);
            graphics.lineTo(lx + 5, 30); // Angled leg
            graphics.moveTo(lx, 0);
            graphics.lineTo(lx - 5, 30);
        }
        graphics.strokePath();

        // Draw Platform Base
        graphics.fillStyle(mainColor);
        graphics.fillRoundedRect(-width / 2, -padHeight / 2, width, padHeight, 5);

        // Draw Top Surface (Metallic/Tech)
        graphics.fillStyle(0xaaaaaa, 0.3); // Shine
        graphics.fillRect(-width / 2, -padHeight / 2, width, 5);

        // Draw Lights/Rim
        if (type === 'power') {
            // Glowing Rim
            graphics.lineStyle(2, lightColor, 1);
            graphics.strokeRoundedRect(-width / 2, -padHeight / 2, width, padHeight, 5);

            // Pulsing Core
            const core = this.add.rectangle(0, 0, width - 20, 5, lightColor, 0.8);
            container.add(core);

            this.tweens.add({
                targets: core,
                alpha: 0.2,
                scaleX: 0.9,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // Outer Glow (using multiple transparent rects or shadow if supported, simple alpha rects here)
            const glow = this.add.graphics();
            glow.fillStyle(glowColor, 0.2);
            glow.fillRoundedRect(-width / 2 - 5, -padHeight / 2 - 5, width + 10, padHeight + 10, 10);
            container.addAt(glow, 0); // Behind everything

            this.tweens.add({
                targets: glow,
                alpha: 0.5,
                duration: 1500,
                yoyo: true,
                repeat: -1
            });

        } else {
            // Standard Landing Lights
            const lightSpacing = width - 20;
            const leftLight = this.add.circle(-lightSpacing / 2, -padHeight / 2, 3, lightColor);
            const rightLight = this.add.circle(lightSpacing / 2, -padHeight / 2, 3, lightColor);
            container.add([leftLight, rightLight]);

            this.tweens.add({
                targets: [leftLight, rightLight],
                alpha: 0.2,
                duration: 500,
                yoyo: true,
                repeat: -1
            });
        }

        // Hard mode movement
        if (type === 'hard') {
            this.tweens.add({
                targets: [body.position, container],
                x: x + 100,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    // Sync physics body if needed, but tweening body.position directly works for Matter
                    // However, container needs separate tween or update
                    // Actually, let's tween a value and update both
                }
            });

            // Re-do tween to sync properly
            // Remove previous tween
            this.tweens.killTweensOf(container);

            // Create a custom object to tween
            const tweenObj = { val: 0 };
            this.tweens.add({
                targets: tweenObj,
                val: 1,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const offsetX = tweenObj.val * 100;
                    this.matter.body.setPosition(body, { x: x + offsetX, y: body.position.y });
                    container.x = x + offsetX;
                }
            });
        }
    }

    createLander() {
        // Spawn at top center
        this.lander = this.matter.add.image(this.scale.width / 2, 100, 'lander', null, {
            shape: {
                type: 'rectangle',
                width: 30,
                height: 40
            },
            label: 'lander'
        });

        this.lander.setFrictionAir(0.01);
        this.lander.setMass(1);

        // Flame sprite (hidden by default)
        this.flame = this.add.image(0, 0, 'engine_flame');
        this.flame.setVisible(false);
    }

    update(time, delta) {
        if (this.isGameOver || this.hasLanded || !this.lander || !this.lander.body) return;

        this.createFallingStar();

        // Update UI
        this.events.emit('updateHUD', {
            fuel: this.fuel,
            vSpeed: this.lander.body.velocity.y,
            hSpeed: this.lander.body.velocity.x,
            angle: this.lander.rotation,
            altitude: (this.scale.height * 2 - 100) - this.lander.y // Approx altitude
        });

        // Controls
        const isThrusting = this.cursors.up.isDown || this.wasd.up.isDown;
        const isLeft = this.cursors.left.isDown || this.wasd.left.isDown;
        const isRight = this.cursors.right.isDown || this.wasd.right.isDown;

        if (isThrusting && this.fuel > 0) {
            // Apply force upwards relative to rotation
            const force = this.thrustForce;
            const angle = this.lander.rotation - Math.PI / 2; // Adjust for sprite orientation (up is -90 deg)

            this.lander.applyForce({
                x: Math.cos(angle) * force,
                y: Math.sin(angle) * force
            });

            this.fuel -= 0.1; // Drain fuel

            // Show flame
            this.flame.setVisible(true);
            this.flame.setPosition(this.lander.x, this.lander.y + 25);
            this.flame.setRotation(this.lander.rotation);

            // Scale flame based on "throttle" (just on/off for now, but could be analog)
            this.flame.setScale(1 + Math.random() * 0.2); // Flicker
        } else {
            this.flame.setVisible(false);
        }

        if (isLeft) {
            this.lander.setAngularVelocity(-this.rotationSpeed);
        } else if (isRight) {
            this.lander.setAngularVelocity(this.rotationSpeed);
        }
    }

    handleCollision(otherBody) {
        if (this.isGameOver || this.hasLanded) return;

        const vSpeed = this.lander.body.velocity.y;
        const hSpeed = Math.abs(this.lander.body.velocity.x);
        const angle = Math.abs(this.lander.rotation); // Normalize?
        // Normalize angle to be between -PI and PI, then check deviation from 0
        let normalizedAngle = angle % (Math.PI * 2);
        if (normalizedAngle > Math.PI) normalizedAngle -= Math.PI * 2;
        normalizedAngle = Math.abs(normalizedAngle);

        // Check if it's a pad
        if (otherBody.label && otherBody.label.startsWith('pad')) {
            // Check landing conditions
            const isSafeV = vSpeed < this.safeVerticalVelocity;
            const isSafeH = hSpeed < this.safeHorizontalVelocity;
            const isSafeAngle = normalizedAngle < this.safeAngle;

            if (isSafeV && isSafeH && isSafeAngle) {
                this.successLanding(otherBody.label);
            } else {
                this.crash(`Too fast or steep! V:${vSpeed.toFixed(1)} H:${hSpeed.toFixed(1)} A:${(normalizedAngle * 57.29).toFixed(1)}°`);
            }
        } else {
            // Terrain or other object
            this.crash("Hit terrain!");
        }
    }

    crash(reason) {
        this.isGameOver = true;
        this.lander.setTint(0xff0000);
        this.flame.setVisible(false);

        // Explosion effect (simple shake and particles)
        this.cameras.main.shake(500, 0.01);

        // Show Fail UI
        this.events.emit('gameOver', { success: false, message: reason });
    }

    successLanding(padType) {
        this.hasLanded = true;
        this.lander.setStatic(true); // Stop physics

        // Show Success UI
        this.events.emit('gameOver', { success: true, message: "Safe Landing!", pad: padType });
    }
}
