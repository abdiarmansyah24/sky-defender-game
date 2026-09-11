/**
 * ===================================================================
 * SKY DEFENDER — NEON SPACE BATTLE
 * Top-Down Arcade Space Shooter Engine (Vanilla JS + HTML5 Canvas)
 * ===================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM ELEMENTS & CANVAS INITIALIZATION
    const container = document.getElementById('gameContainer');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // HUD Elements
    const gameHud = document.getElementById('gameHud');
    const hudScore = document.getElementById('hudScore');
    const hudHighScore = document.getElementById('hudHighScore');
    const hudWaveBadge = document.getElementById('hudWaveBadge');
    const hudComboTag = document.getElementById('hudComboTag');
    const comboMultiplier = document.getElementById('comboMultiplier');
    const hpBarFill = document.getElementById('hpBarFill');
    const activePowerupsList = document.getElementById('activePowerups');
    const soundToggleBtn = document.getElementById('soundToggleBtn');

    // Boss HUD
    const bossHpContainer = document.getElementById('bossHpContainer');
    const bossHpPct = document.getElementById('bossHpPct');
    const bossHpFill = document.getElementById('bossHpFill');

    // Overlays & Modals
    const mainMenuScreen = document.getElementById('mainMenuScreen');
    const gameOverScreen = document.getElementById('gameOverScreen');
    const bossWarningOverlay = document.getElementById('bossWarningOverlay');
    const waveTransitionOverlay = document.getElementById('waveTransitionOverlay');
    const waveAnnouncementTitle = document.getElementById('waveAnnouncementTitle');
    const howToPlayModal = document.getElementById('howToPlayModal');
    const highScoreModal = document.getElementById('highScoreModal');

    // Buttons
    const startGameBtn = document.getElementById('startGameBtn');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    const highScoreBtn = document.getElementById('highScoreBtn');
    const closeHowToBtn = document.getElementById('closeHowToBtn');
    const closeHighScoreBtn = document.getElementById('closeHighScoreBtn');
    const resetScoreBtn = document.getElementById('resetScoreBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const backToMenuBtn = document.getElementById('backToMenuBtn');

    // Final Stats
    const finalScoreVal = document.getElementById('finalScoreVal');
    const finalHighScoreVal = document.getElementById('finalHighScoreVal');
    const finalWaveVal = document.getElementById('finalWaveVal');
    const finalEnemiesVal = document.getElementById('finalEnemiesVal');
    const menuHighDisplay = document.getElementById('menuHighDisplay');
    const modalHighScoreVal = document.getElementById('modalHighScoreVal');

    // Touch Controls
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const fireBtn = document.getElementById('fireBtn');

    // Canvas Sizing
    let width = 0;
    let height = 0;

    function resizeCanvas() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // WEB AUDIO API SOUND SYNTHESIZER
    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        }

        playLaser() {
            if (this.muted || !this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(800, this.ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.12);
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.12);
            } catch (e) {}
        }

        playHit() {
            if (this.muted || !this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(300, this.ctx.currentTime);
                osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.08);
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(this.ctx.currentTime + 0.08);
            } catch (e) {}
        }

        playExplosion() {
            if (this.muted || !this.ctx) return;
            try {
                const bufferSize = this.ctx.sampleRate * 0.3;
                const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

                const noise = this.ctx.createBufferSource();
                noise.buffer = buffer;

                const filter = this.ctx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, this.ctx.currentTime);
                filter.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(this.ctx.destination);

                noise.start();
                noise.stop(this.ctx.currentTime + 0.3);
            } catch (e) {}
        }

        playPowerup() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.setValueAtTime(600, now + 0.08);
                osc.frequency.setValueAtTime(900, now + 0.16);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.25);
            } catch (e) {}
        }

        playBossWarning() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(180, now);
                osc.frequency.linearRampToValueAtTime(360, now + 0.4);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.4);
            } catch (e) {}
        }

        playGameOver() {
            if (this.muted || !this.ctx) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.6);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start();
                osc.stop(now + 0.6);
            } catch (e) {}
        }
    }

    const sound = new SoundEngine();

    soundToggleBtn.addEventListener('click', () => {
        sound.init();
        sound.muted = !sound.muted;
        soundToggleBtn.textContent = sound.muted ? '🔇' : '🔊';
    });

    // GAME ENGINE STATE VARIABLES
    const STATES = { MENU: 0, PLAYING: 1, WAVE_TRANSITION: 2, GAME_OVER: 3 };
    let gameState = STATES.MENU;

    let score = 0;
    let highScore = parseInt(localStorage.getItem('sky_defender_highscore') || '0', 10);
    let wave = 1;
    let enemiesDestroyed = 0;
    let comboCount = 0;
    let comboTimer = 0;

    let screenShakeTime = 0;
    let screenShakeIntensity = 0;

    let player = null;
    let bullets = [];
    let enemyBullets = [];
    let enemies = [];
    let boss = null;
    let powerups = [];
    let particles = [];
    let floatingTexts = [];
    let stars = [];

    const keys = { up: false, down: false, left: false, right: false, fire: false };

    function initStarfield() {
        stars = [];
        for (let i = 0; i < 70; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    initStarfield();

    // PLAYER CLASS
    class Player {
        constructor() {
            this.width = 44;
            this.height = 52;
            this.x = width / 2;
            this.y = height - 100;
            this.speed = 6.5;
            this.maxHp = 100;
            this.hp = 100;

            this.rapidFireTimer = 0;
            this.shieldTimer = 0;
            this.doubleLaserTimer = 0;
            this.scoreBoostTimer = 0;

            this.lastShootTime = 0;
            this.shootInterval = 180;
        }

        update(dt) {
            let dx = 0; let dy = 0;
            if (keys.left) dx -= 1;
            if (keys.right) dx += 1;
            if (keys.up) dy -= 1;
            if (keys.down) dy += 1;

            if (dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

            this.x += dx * this.speed;
            this.y += dy * this.speed;

            this.x = Math.max(this.width / 2, Math.min(width - this.width / 2, this.x));
            this.y = Math.max(this.height / 2 + 60, Math.min(height - this.height / 2 - 20, this.y));

            if (this.rapidFireTimer > 0) this.rapidFireTimer -= dt;
            if (this.shieldTimer > 0) this.shieldTimer -= dt;
            if (this.doubleLaserTimer > 0) this.doubleLaserTimer -= dt;
            if (this.scoreBoostTimer > 0) this.scoreBoostTimer -= dt;

            const currentInterval = this.rapidFireTimer > 0 ? 90 : this.shootInterval;
            const now = Date.now();
            if (keys.fire && now - this.lastShootTime >= currentInterval) {
                this.shoot();
                this.lastShootTime = now;
            }

            if (Math.random() < 0.7) {
                particles.push(new Particle(
                    this.x + (Math.random() * 8 - 4),
                    this.y + this.height / 2,
                    (Math.random() - 0.5) * 1.5,
                    Math.random() * 3 + 2,
                    Math.random() * 3 + 2,
                    this.rapidFireTimer > 0 ? '#facc15' : '#00f0ff',
                    25
                ));
            }
        }

        shoot() {
            sound.playLaser();
            if (this.doubleLaserTimer > 0) {
                bullets.push(new Bullet(this.x - 14, this.y - 15, -12, true));
                bullets.push(new Bullet(this.x + 14, this.y - 15, -12, true));
            } else {
                bullets.push(new Bullet(this.x, this.y - 20, -14, true));
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);

            if (this.shieldTimer > 0) {
                ctx.beginPath();
                ctx.arc(0, 0, this.width * 0.85, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
                ctx.fill();
                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 15;
                ctx.stroke();
            }

            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 12;

            ctx.beginPath();
            ctx.moveTo(0, -this.height / 2);
            ctx.lineTo(this.width / 2, this.height / 2 - 6);
            ctx.lineTo(this.width / 4, this.height / 2);
            ctx.lineTo(0, this.height / 3);
            ctx.lineTo(-this.width / 4, this.height / 2);
            ctx.lineTo(-this.width / 2, this.height / 2 - 6);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            grad.addColorStop(0, '#00f0ff');
            grad.addColorStop(0.5, '#3b82f6');
            grad.addColorStop(1, '#0b132b');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(0, -6, 6, 12, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 15;
            ctx.fill();

            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(-this.width / 2, -6, 3, 12);
            ctx.fillRect(this.width / 2 - 3, -6, 3, 12);

            ctx.restore();
        }

        takeDamage(amount) {
            if (this.shieldTimer > 0) return;
            this.hp -= amount;
            sound.playHit();
            triggerScreenShake(8, 200);

            if (this.hp <= 0) {
                this.hp = 0;
                createExplosion(this.x, this.y, 40, '#00f0ff');
            }
        }
    }

    // BULLET CLASS
    class Bullet {
        constructor(x, y, vy, isPlayer = true, vx = 0, color = null) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.isPlayer = isPlayer;
            this.radius = isPlayer ? 4 : 5;
            this.color = color || (isPlayer ? '#00f0ff' : '#ef4444');
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
                this.markedForDeletion = true;
            }
        }

        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.restore();
        }
    }

    // ENEMY CLASS
    class Enemy {
        constructor(type) {
            this.type = type;
            this.x = Math.random() * (width - 80) + 40;
            this.y = -40;
            this.markedForDeletion = false;
            this.lastShoot = Date.now();

            if (type === 'SCOUT') {
                this.width = 28; this.height = 28;
                this.speed = Math.random() * 1.5 + 3.0;
                this.hp = 15; this.maxHp = 15;
                this.scoreVal = 100;
                this.color = '#00f0ff';
                this.sineOffset = Math.random() * Math.PI * 2;
            } else if (type === 'FIGHTER') {
                this.width = 38; this.height = 38;
                this.speed = Math.random() * 0.8 + 2.0;
                this.hp = 35; this.maxHp = 35;
                this.scoreVal = 250;
                this.color = '#a855f7';
            } else {
                this.width = 54; this.height = 54;
                this.speed = Math.random() * 0.4 + 1.2;
                this.hp = 90; this.maxHp = 90;
                this.scoreVal = 500;
                this.color = '#ef4444';
            }
        }

        update() {
            this.y += this.speed;

            if (this.type === 'SCOUT') {
                this.x += Math.sin(this.y * 0.04 + this.sineOffset) * 2;
            }

            const now = Date.now();
            if (this.type === 'FIGHTER' && now - this.lastShoot > 1800) {
                this.lastShoot = now;
                if (this.y > 0 && this.y < height - 150) {
                    enemyBullets.push(new Bullet(this.x, this.y + this.height / 2, 6, false, 0, '#a855f7'));
                }
            }

            if (this.type === 'TANK' && now - this.lastShoot > 2200) {
                this.lastShoot = now;
                if (this.y > 0 && this.y < height - 200) {
                    enemyBullets.push(new Bullet(this.x, this.y + this.height / 2, 5, false, -1.8, '#ef4444'));
                    enemyBullets.push(new Bullet(this.x, this.y + this.height / 2, 5.5, false, 0, '#ef4444'));
                    enemyBullets.push(new Bullet(this.x, this.y + this.height / 2, 5, false, 1.8, '#ef4444'));
                }
            }

            if (this.y > height + 50) this.markedForDeletion = true;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;

            if (this.type === 'SCOUT') {
                ctx.beginPath();
                ctx.moveTo(0, this.height / 2);
                ctx.lineTo(this.width / 2, -this.height / 2);
                ctx.lineTo(0, -this.height / 4);
                ctx.lineTo(-this.width / 2, -this.height / 2);
                ctx.closePath();
                ctx.fillStyle = '#00f0ff';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            } else if (this.type === 'FIGHTER') {
                ctx.beginPath();
                ctx.moveTo(0, this.height / 2);
                ctx.lineTo(this.width / 2, 0);
                ctx.lineTo(0, -this.height / 2);
                ctx.lineTo(-this.width / 2, 0);
                ctx.closePath();
                ctx.fillStyle = '#a855f7';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ef4444';
                ctx.fill();
                ctx.strokeStyle = '#facc15';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();
        }

        takeDamage(amount) {
            this.hp -= amount;
            sound.playHit();
            if (this.hp <= 0) {
                this.markedForDeletion = true;
                onEnemyKilled(this);
            }
        }
    }

    // BOSS CLASS
    class Boss {
        constructor() {
            this.width = 110;
            this.height = 90;
            this.x = width / 2;
            this.y = -100;
            this.targetY = 110;
            this.maxHp = 1000 + wave * 350;
            this.hp = this.maxHp;
            this.speedX = 3;
            this.lastAttack = Date.now();
            this.attackPattern = 0;
            this.color = '#facc15';
        }

        update() {
            if (this.y < this.targetY) {
                this.y += 1.5;
                return;
            }

            this.x += this.speedX;
            if (this.x < this.width / 2 + 20 || this.x > width - this.width / 2 - 20) {
                this.speedX *= -1;
            }

            const now = Date.now();
            if (now - this.lastAttack > 1600) {
                this.lastAttack = now;
                this.attackPattern = (this.attackPattern + 1) % 3;

                if (this.attackPattern === 0) {
                    for (let i = -2; i <= 2; i++) {
                        enemyBullets.push(new Bullet(this.x, this.y + this.height / 2, 5, false, i * 1.5, '#facc15'));
                    }
                } else if (this.attackPattern === 1 && player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.hypot(dx, dy) || 1;
                    const vx = (dx / dist) * 6;
                    const vy = (dy / dist) * 6;
                    enemyBullets.push(new Bullet(this.x - 20, this.y + 20, vy, false, vx, '#ef4444'));
                    enemyBullets.push(new Bullet(this.x + 20, this.y + 20, vy, false, vx, '#ef4444'));
                } else {
                    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
                        const vx = Math.cos(angle) * 4.5;
                        const vy = Math.sin(angle) * 4.5;
                        enemyBullets.push(new Bullet(this.x, this.y, vy, false, vx, '#a855f7'));
                    }
                }
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 20;

            ctx.beginPath();
            ctx.moveTo(0, this.height / 2);
            ctx.lineTo(this.width / 2, 10);
            ctx.lineTo(this.width / 2 - 15, -this.height / 2);
            ctx.lineTo(-this.width / 2 + 15, -this.height / 2);
            ctx.lineTo(-this.width / 2, 10);
            ctx.closePath();

            const grad = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
            grad.addColorStop(0, '#facc15');
            grad.addColorStop(0.5, '#ef4444');
            grad.addColorStop(1, '#0b132b');
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.5;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(0, 0, 16, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 25;
            ctx.fill();

            ctx.restore();
        }

        takeDamage(amount) {
            this.hp -= amount;
            sound.playHit();
            triggerScreenShake(4, 100);

            if (this.hp <= 0) {
                this.hp = 0;
                onBossDefeated();
            }
        }
    }

    // POWERUP CLASS
    class PowerUp {
        constructor(x, y, type) {
            this.x = x;
            this.y = y;
            this.type = type;
            this.radius = 16;
            this.speedY = 1.8;
            this.rotation = 0;
            this.markedForDeletion = false;

            const map = {
                RAPID: { label: '⚡', color: '#facc15' },
                SHIELD: { label: '🛡️', color: '#00f0ff' },
                DOUBLE: { label: '💥', color: '#a855f7' },
                HEALTH: { label: '❤️', color: '#22c55e' },
                BOOST: { label: '⭐', color: '#3b82f6' }
            };

            this.info = map[type] || map.RAPID;
        }

        update() {
            this.y += this.speedY;
            this.rotation += 0.04;
            if (this.y > height + 40) this.markedForDeletion = true;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);

            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.lineTo(this.radius, 0);
            ctx.lineTo(0, this.radius);
            ctx.lineTo(-this.radius, 0);
            ctx.closePath();

            ctx.fillStyle = 'rgba(11, 19, 43, 0.85)';
            ctx.fill();
            ctx.strokeStyle = this.info.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = this.info.color;
            ctx.shadowBlur = 15;
            ctx.stroke();

            ctx.rotate(-this.rotation);
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.info.label, 0, 0);

            ctx.restore();
        }
    }

    // PARTICLE CLASS
    class Particle {
        constructor(x, y, vx, vy, radius, color, maxLife = 30) {
            this.x = x; this.y = y; this.vx = vx; this.vy = vy;
            this.radius = radius; this.color = color;
            this.life = 0; this.maxLife = maxLife;
            this.markedForDeletion = false;
        }

        update() {
            this.x += this.vx; this.y += this.vy; this.life++;
            if (this.life >= this.maxLife) this.markedForDeletion = true;
        }

        draw() {
            const alpha = 1 - (this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
        }
    }

    // FLOATING TEXT CLASS
    class FloatingText {
        constructor(x, y, text, color = '#ffffff') {
            this.x = x; this.y = y; this.text = text; this.color = color;
            this.life = 0; this.maxLife = 40; this.markedForDeletion = false;
        }

        update() {
            this.y -= 1.2; this.life++;
            if (this.life >= this.maxLife) this.markedForDeletion = true;
        }

        draw() {
            const alpha = 1 - (this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 14px Orbitron, sans-serif';
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.textAlign = 'center';
            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }

    // HELPER FUNCTIONS & GAME EVENTS
    function createExplosion(x, y, count = 25, color = '#facc15') {
        sound.playExplosion();
        triggerScreenShake(10, 250);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const size = Math.random() * 4 + 1.5;
            particles.push(new Particle(x, y, vx, vy, size, color, Math.random() * 20 + 20));
        }
    }

    function triggerScreenShake(intensity, duration) {
        screenShakeIntensity = intensity;
        screenShakeTime = duration;
    }

    function spawnPowerUp(x, y) {
        const types = ['RAPID', 'SHIELD', 'DOUBLE', 'HEALTH', 'BOOST'];
        const chosen = types[Math.floor(Math.random() * types.length)];
        powerups.push(new PowerUp(x, y, chosen));
    }

    function onEnemyKilled(enemy) {
        enemiesDestroyed++;
        comboCount++;
        comboTimer = Date.now();
        const pts = enemy.scoreVal * (player.scoreBoostTimer > 0 ? 2 : 1);
        score += pts;

        floatingTexts.push(new FloatingText(enemy.x, enemy.y, `+${pts}`, '#00f0ff'));
        createExplosion(enemy.x, enemy.y, 18, enemy.color);

        if (Math.random() < 0.22) spawnPowerUp(enemy.x, enemy.y);
        updateHud();
    }

    function onBossDefeated() {
        enemiesDestroyed++;
        score += 2500 * wave;
        createExplosion(boss.x, boss.y, 70, '#facc15');
        floatingTexts.push(new FloatingText(boss.x, boss.y, `+${2500 * wave} BOSS DEFEATED!`, '#facc15'));

        spawnPowerUp(boss.x - 30, boss.y);
        spawnPowerUp(boss.x + 30, boss.y);

        boss = null;
        bossHpContainer.classList.add('hidden');

        setTimeout(() => advanceWave(), 2000);
    }

    function updateHud() {
        hudScore.textContent = String(score).padStart(6, '0');
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('sky_defender_highscore', highScore);
        }
        hudHighScore.textContent = String(highScore).padStart(6, '0');

        if (player) {
            const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
            hpBarFill.style.width = `${hpPct}%`;
            if (hpPct <= 30) hpBarFill.classList.add('low');
            else hpBarFill.classList.remove('low');

            activePowerupsList.innerHTML = '';
            if (player.rapidFireTimer > 0) activePowerupsList.innerHTML += '<div class="pu-icon-badge" title="Rapid Fire">⚡</div>';
            if (player.shieldTimer > 0) activePowerupsList.innerHTML += '<div class="pu-icon-badge" title="Shield">🛡️</div>';
            if (player.doubleLaserTimer > 0) activePowerupsList.innerHTML += '<div class="pu-icon-badge" title="Double Laser">💥</div>';
            if (player.scoreBoostTimer > 0) activePowerupsList.innerHTML += '<div class="pu-icon-badge" title="2x Score">⭐</div>';
        }

        if (comboCount >= 3) {
            hudComboTag.classList.remove('hidden');
            comboMultiplier.textContent = `x${Math.min(5, Math.floor(comboCount / 2))}`;
        } else {
            hudComboTag.classList.add('hidden');
        }
    }

    let enemiesToSpawn = [];
    let spawnTimer = 0;

    function startNewGame() {
        score = 0; wave = 1; enemiesDestroyed = 0; comboCount = 0;
        bullets = []; enemyBullets = []; enemies = []; boss = null; powerups = []; particles = []; floatingTexts = [];

        player = new Player();
        gameState = STATES.PLAYING;

        mainMenuScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        gameHud.classList.remove('hidden');

        setupWave(wave);
    }

    function setupWave(w) {
        hudWaveBadge.textContent = `WAVE ${String(w).padStart(2, '0')}`;
        waveAnnouncementTitle.textContent = `WAVE ${String(w).padStart(2, '0')}`;
        waveTransitionOverlay.classList.remove('hidden');

        setTimeout(() => waveTransitionOverlay.classList.add('hidden'), 1800);

        enemiesToSpawn = [];
        const totalScouts = 5 + w * 3;
        const totalFighters = Math.max(0, (w - 1) * 2);
        const totalTanks = Math.max(0, (w - 3) * 1);

        for (let i = 0; i < totalScouts; i++) enemiesToSpawn.push('SCOUT');
        for (let i = 0; i < totalFighters; i++) enemiesToSpawn.push('FIGHTER');
        for (let i = 0; i < totalTanks; i++) enemiesToSpawn.push('TANK');

        enemiesToSpawn.sort(() => Math.random() - 0.5);
    }

    function advanceWave() {
        wave++;
        setupWave(wave);
    }

    function checkWaveProgress() {
        if (wave % 4 === 0 && !boss && enemiesToSpawn.length === 0 && enemies.length === 0) {
            spawnBoss();
            return;
        }

        if (enemiesToSpawn.length > 0 && !boss) {
            spawnTimer++;
            if (spawnTimer > 45) {
                spawnTimer = 0;
                const type = enemiesToSpawn.pop();
                enemies.push(new Enemy(type));
            }
        }

        if (enemiesToSpawn.length === 0 && enemies.length === 0 && !boss && gameState === STATES.PLAYING) {
            advanceWave();
        }
    }

    function spawnBoss() {
        sound.playBossWarning();
        bossWarningOverlay.classList.remove('hidden');

        setTimeout(() => {
            bossWarningOverlay.classList.add('hidden');
            boss = new Boss();
            bossHpContainer.classList.remove('hidden');
            updateBossHpBar();
        }, 2000);
    }

    function updateBossHpBar() {
        if (!boss) return;
        const pct = Math.max(0, (boss.hp / boss.maxHp) * 100);
        bossHpFill.style.width = `${pct}%`;
        bossHpPct.textContent = `${Math.ceil(pct)}%`;
    }

    function triggerGameOver() {
        gameState = STATES.GAME_OVER;
        sound.playGameOver();

        gameHud.classList.add('hidden');
        bossHpContainer.classList.add('hidden');

        finalScoreVal.textContent = String(score).padStart(6, '0');
        finalHighScoreVal.textContent = String(highScore).padStart(6, '0');
        finalWaveVal.textContent = `WAVE ${String(wave).padStart(2, '0')}`;
        finalEnemiesVal.textContent = String(enemiesDestroyed);

        gameOverScreen.classList.remove('hidden');
    }

    // INPUT HANDLERS
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = true;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = true;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
        if (e.code === 'Space') { keys.fire = true; sound.init(); }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'KeyW' || e.code === 'ArrowUp') keys.up = false;
        if (e.code === 'KeyS' || e.code === 'ArrowDown') keys.down = false;
        if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
        if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
        if (e.code === 'Space') keys.fire = false;
    });

    function setupTouchBtn(btn, keyProp) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); sound.init(); keys[keyProp] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); keys[keyProp] = false; });
        btn.addEventListener('mousedown', () => { sound.init(); keys[keyProp] = true; });
        btn.addEventListener('mouseup', () => { keys[keyProp] = false; });
    }

    setupTouchBtn(btnUp, 'up');
    setupTouchBtn(btnDown, 'down');
    setupTouchBtn(btnLeft, 'left');
    setupTouchBtn(btnRight, 'right');
    setupTouchBtn(fireBtn, 'fire');

    // MOUSE & TOUCH POINTER DRAG CONTROL FOR DESKTOP AND MOBILE
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let playerStartX = 0;
    let playerStartY = 0;

    function getCanvasCoords(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    function handlePointerStart(clientX, clientY) {
        if (gameState !== STATES.PLAYING || !player) return;
        sound.init();
        isDragging = true;
        keys.fire = true;

        const coords = getCanvasCoords(clientX, clientY);
        dragStartX = coords.x;
        dragStartY = coords.y;
        playerStartX = player.x;
        playerStartY = player.y;
    }

    function handlePointerMove(clientX, clientY) {
        if (!isDragging || !player || gameState !== STATES.PLAYING) return;
        const coords = getCanvasCoords(clientX, clientY);
        
        // Relative delta drag movement for silky smooth control
        const deltaX = coords.x - dragStartX;
        const deltaY = coords.y - dragStartY;

        player.x = playerStartX + deltaX;
        player.y = playerStartY + deltaY;

        // Clamp inside canvas bounds
        player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
        player.y = Math.max(player.height / 2 + 50, Math.min(canvas.height - player.height / 2 - 10, player.y));
    }

    function handlePointerEnd() {
        isDragging = false;
        keys.fire = false;
    }

    // Touch Events
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
            handlePointerStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    canvas.addEventListener('touchend', handlePointerEnd, { passive: true });

    // Mouse Events for PC Dragging
    canvas.addEventListener('mousedown', (e) => {
        handlePointerStart(e.clientX, e.clientY);
    });

    canvas.addEventListener('mousemove', (e) => {
        handlePointerMove(e.clientX, e.clientY);
    });

    window.addEventListener('mouseup', handlePointerEnd);


    startGameBtn.addEventListener('click', () => { sound.init(); startNewGame(); });
    playAgainBtn.addEventListener('click', () => { sound.init(); startNewGame(); });
    backToMenuBtn.addEventListener('click', () => {
        sound.init(); gameState = STATES.MENU;
        gameOverScreen.classList.add('hidden');
        mainMenuScreen.classList.remove('hidden');
        menuHighDisplay.textContent = String(highScore).padStart(6, '0');
    });

    howToPlayBtn.addEventListener('click', () => { sound.init(); howToPlayModal.classList.remove('hidden'); });
    closeHowToBtn.addEventListener('click', () => { howToPlayModal.classList.add('hidden'); });

    highScoreBtn.addEventListener('click', () => {
        sound.init();
        modalHighScoreVal.textContent = String(highScore).padStart(6, '0');
        highScoreModal.classList.remove('hidden');
    });
    closeHighScoreBtn.addEventListener('click', () => { highScoreModal.classList.add('hidden'); });

    resetScoreBtn.addEventListener('click', () => {
        if (confirm('Yakin ingin mereset High Score?')) {
            highScore = 0;
            localStorage.setItem('sky_defender_highscore', '0');
            modalHighScoreVal.textContent = '000000';
            menuHighDisplay.textContent = '000000';
            hudHighScore.textContent = '000000';
        }
    });

    menuHighDisplay.textContent = String(highScore).padStart(6, '0');

    // MAIN GAME LOOP
    let lastFrameTime = performance.now();

    function gameLoop(now) {
        const dt = Math.min(50, now - lastFrameTime);
        lastFrameTime = now;

        if (comboCount > 0 && Date.now() - comboTimer > 2500) {
            comboCount = 0;
            updateHud();
        }

        ctx.clearRect(0, 0, width, height);
        ctx.save();

        if (screenShakeTime > 0) {
            screenShakeTime -= dt;
            const dx = (Math.random() - 0.5) * screenShakeIntensity;
            const dy = (Math.random() - 0.5) * screenShakeIntensity;
            ctx.translate(dx, dy);
        }

        ctx.fillStyle = '#ffffff';
        stars.forEach(star => {
            star.y += star.speed;
            if (star.y > height) star.y = 0;
            ctx.globalAlpha = star.opacity;
            ctx.fillRect(star.x, star.y, star.size, star.size);
        });
        ctx.globalAlpha = 1;

        if (gameState === STATES.PLAYING) {
            checkWaveProgress();

            if (player) {
                player.update(dt);
                player.draw();
            }

            bullets.forEach(bullet => { bullet.update(); bullet.draw(); });

            enemyBullets.forEach(bullet => {
                bullet.update(); bullet.draw();
                if (player && !bullet.markedForDeletion) {
                    const dist = Math.hypot(bullet.x - player.x, bullet.y - player.y);
                    if (dist < player.width / 2 + bullet.radius) {
                        bullet.markedForDeletion = true;
                        player.takeDamage(12);
                        updateHud();
                        if (player.hp <= 0) triggerGameOver();
                    }
                }
            });

            enemies.forEach(enemy => {
                enemy.update(); enemy.draw();
                if (player && !enemy.markedForDeletion) {
                    const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
                    if (dist < (enemy.width + player.width) / 2.2) {
                        enemy.markedForDeletion = true;
                        player.takeDamage(25);
                        createExplosion(enemy.x, enemy.y, 20, enemy.color);
                        updateHud();
                        if (player.hp <= 0) triggerGameOver();
                    }
                }

                bullets.forEach(bullet => {
                    if (!bullet.markedForDeletion && !enemy.markedForDeletion) {
                        const dist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
                        if (dist < enemy.width / 2 + bullet.radius) {
                            bullet.markedForDeletion = true;
                            enemy.takeDamage(25);
                        }
                    }
                });
            });

            if (boss) {
                boss.update(); boss.draw(); updateBossHpBar();
                bullets.forEach(bullet => {
                    if (!bullet.markedForDeletion) {
                        const dist = Math.hypot(bullet.x - boss.x, bullet.y - boss.y);
                        if (dist < boss.width / 2 + bullet.radius) {
                            bullet.markedForDeletion = true;
                            boss.takeDamage(25);
                        }
                    }
                });

                if (player) {
                    const dist = Math.hypot(boss.x - player.x, boss.y - player.y);
                    if (dist < (boss.width + player.width) / 2) {
                        player.takeDamage(40);
                        updateHud();
                        if (player.hp <= 0) triggerGameOver();
                    }
                }
            }

            powerups.forEach(pu => {
                pu.update(); pu.draw();
                if (player && !pu.markedForDeletion) {
                    const dist = Math.hypot(pu.x - player.x, pu.y - player.y);
                    if (dist < player.width / 2 + pu.radius) {
                        pu.markedForDeletion = true;
                        sound.playPowerup();
                        if (pu.type === 'RAPID') player.rapidFireTimer = 10000;
                        if (pu.type === 'SHIELD') player.shieldTimer = 8000;
                        if (pu.type === 'DOUBLE') player.doubleLaserTimer = 10000;
                        if (pu.type === 'HEALTH') player.hp = Math.min(player.maxHp, player.hp + 35);
                        if (pu.type === 'BOOST') player.scoreBoostTimer = 12000;

                        floatingTexts.push(new FloatingText(pu.x, pu.y, `${pu.type} ACTIVATED!`, pu.info.color));
                        updateHud();
                    }
                }
            });

            particles.forEach(p => { p.update(); p.draw(); });
            floatingTexts.forEach(ft => { ft.update(); ft.draw(); });

            bullets = bullets.filter(b => !b.markedForDeletion);
            enemyBullets = enemyBullets.filter(eb => !eb.markedForDeletion);
            enemies = enemies.filter(e => !e.markedForDeletion);
            powerups = powerups.filter(p => !p.markedForDeletion);
            particles = particles.filter(p => !p.markedForDeletion);
            floatingTexts = floatingTexts.filter(ft => !ft.markedForDeletion);
        }

        ctx.restore();
        requestAnimationFrame(gameLoop);
    }

    requestAnimationFrame(gameLoop);
});
