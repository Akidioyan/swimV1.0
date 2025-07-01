class SwimmingHeroGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'start'; // start, playing, gameOver
        
        // Game settings
        this.lanes = 3;
        this.laneWidth = this.canvas.width / this.lanes;
        this.gameSpeed = 2;
        this.baseSpeed = 2;
        this.speedMultiplier = 1.0;
        
        // Player
        this.player = {
            x: this.laneWidth * 1.5 - 25, // Start in middle lane
            y: this.canvas.height - 100,
            width: 30,
            height: 50,
            currentLane: 1, // 0, 1, 2
            targetX: this.laneWidth * 1.5 - 25,
            speed: 8
        };
        
        // Game objects
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        
        // Game stats
        this.score = 0;
        this.distance = 0;
        this.shieldActive = false;
        this.shieldTime = 0;
        
        // Spawn timers
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        
        // Animation
        this.animationFrame = 0;
        this.waterOffset = 0;
        
        this.setupEventListeners();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // Mouse click
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.switchLane();
            }
        });
        
        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.switchLane();
                }
            }
        });
        
        // Touch support
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.gameState === 'playing') {
                this.switchLane();
            }
        });
    }
    
    switchLane() {
        this.player.currentLane = (this.player.currentLane + 1) % this.lanes;
        this.player.targetX = this.laneWidth * (this.player.currentLane + 0.5) - this.player.width / 2;
        
        // Add splash effect
        this.addSplash(this.player.x, this.player.y);
    }
    
    addSplash(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x + this.player.width / 2,
                y: y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 30,
                maxLife: 30,
                size: Math.random() * 4 + 2
            });
        }
    }
    
    spawnObstacle() {
        const lane = Math.floor(Math.random() * this.lanes);
        const types = ['rock', 'seaweed', 'jellyfish'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // 计算障碍物在泳道中的位置
        const laneCenter = this.laneWidth * (lane + 0.5);
        
        this.obstacles.push({
            x: laneCenter - 20, // 居中于泳道
            y: -40, // 从屏幕顶部出现
            width: 40,
            height: 40,
            type: type,
            lane: lane
        });
    }
    
    spawnPowerUp() {
        const lane = Math.floor(Math.random() * this.lanes);
        const types = ['snorkel', 'shield'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        // 计算道具在泳道中的位置
        const laneCenter = this.laneWidth * (lane + 0.5);
        
        this.powerUps.push({
            x: laneCenter - 15, // 居中于泳道
            y: -30, // 从屏幕顶部出现
            width: 30,
            height: 30,
            type: type,
            lane: lane,
            collected: false
        });
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.animationFrame++;
        this.waterOffset += this.gameSpeed;
        
        // Update player position
        if (Math.abs(this.player.x - this.player.targetX) > 2) {
            this.player.x += (this.player.targetX - this.player.x) * 0.15;
        }
        
        // Update game speed
        this.gameSpeed = this.baseSpeed * this.speedMultiplier;
        
        // Update score and distance
        this.score += Math.floor(this.gameSpeed);
        this.distance += this.gameSpeed / 10;
        
        // Update shield
        if (this.shieldActive) {
            this.shieldTime--;
            if (this.shieldTime <= 0) {
                this.shieldActive = false;
            }
        }
        
        // Spawn obstacles
        this.obstacleTimer++;
        if (this.obstacleTimer > 120 - Math.min(this.score / 1000, 60)) {
            this.spawnObstacle();
            this.obstacleTimer = 0;
        }
        
        // Spawn power-ups
        this.powerUpTimer++;
        if (this.powerUpTimer > 200) {
            this.spawnPowerUp();
            this.powerUpTimer = 0;
        }
        
        // Update obstacles
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.y += this.gameSpeed;
            
            // 更新障碍物的水平位置，确保它们始终在泳道中央
            const laneCenter = this.laneWidth * (obstacle.lane + 0.5);
            obstacle.x = laneCenter - obstacle.width / 2;
            
            // Check collision with player
            if (this.checkCollision(this.player, obstacle)) {
                if (!this.shieldActive) {
                    this.gameOver();
                    return false;
                } else {
                    // Shield blocks obstacle
                    this.addExplosion(obstacle.x, obstacle.y);
                    return false;
                }
            }
            
            return obstacle.y < this.canvas.height + obstacle.height;
        });
        
        // Update power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += this.gameSpeed;
            
            // 更新道具的水平位置，确保它们始终在泳道中央
            const laneCenter = this.laneWidth * (powerUp.lane + 0.5);
            powerUp.x = laneCenter - powerUp.width / 2;
            
            // Check collection
            if (!powerUp.collected && this.checkCollision(this.player, powerUp)) {
                powerUp.collected = true;
                this.collectPowerUp(powerUp);
                return false;
            }
            
            return powerUp.y < this.canvas.height + powerUp.height;
        });
        
        // Update particles
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vy += 0.2; // gravity
            return particle.life > 0;
        });
        
        // Update UI
        document.getElementById('scoreValue').textContent = Math.floor(this.score);
        document.getElementById('speedValue').textContent = this.speedMultiplier.toFixed(1);
    }
    
    collectPowerUp(powerUp) {
        if (powerUp.type === 'snorkel') {
            this.speedMultiplier = Math.min(this.speedMultiplier + 0.2, 3.0);
            this.score += 100;
        } else if (powerUp.type === 'shield') {
            this.shieldActive = true;
            this.shieldTime = 300; // 5 seconds at 60fps
            this.score += 50;
        }
        
        this.addCollectEffect(powerUp.x, powerUp.y);
    }
    
    addCollectEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 40,
                maxLife: 40,
                size: Math.random() * 3 + 1,
                color: 'gold'
            });
        }
    }
    
    addExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                size: Math.random() * 4 + 2,
                color: 'orange'
            });
        }
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water background
        this.drawWater();
        
        // Draw lane dividers
        this.drawLanes();
        
        // Draw game objects
        this.drawObstacles();
        this.drawPowerUps();
        this.drawPlayer();
        this.drawParticles();
        
        // Draw shield effect
        if (this.shieldActive) {
            this.drawShield();
        }
    }
    
    drawWater() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.5, '#4682B4');
        gradient.addColorStop(1, '#1e3c72');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water waves (横向波浪改为纵向波浪)
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            for (let y = 0; y <= this.canvas.height; y += 10) {
                const x = 100 + i * 70 + Math.sin((y + this.waterOffset * 2) * 0.02) * 10;
                if (y === 0) {
                    this.ctx.moveTo(x, y);
                } else {
                    this.ctx.lineTo(x, y);
                }
            }
            this.ctx.stroke();
        }
    }
    
    drawLanes() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        
        for (let i = 1; i < this.lanes; i++) {
            const x = this.laneWidth * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    drawPlayer() {
        const x = this.player.x;
        const y = this.player.y;
        const w = this.player.width;
        const h = this.player.height;
        
        // 旋转玩家角色，使其朝上游
        this.ctx.save();
        this.ctx.translate(x + w/2, y + h/2);
        this.ctx.rotate(-Math.PI/2); // 旋转90度
        
        // Draw swimmer body (相对于旋转后的坐标系)
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.fillRect(-h/2 + 5, -w/2 + 5, h - 10, w - 10);
        
        // Draw head
        this.ctx.fillStyle = '#FDBCB4';
        this.ctx.beginPath();
        this.ctx.arc(-h/2 + 8, 0, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Draw swimming motion
        const armOffset = Math.sin(this.animationFrame * 0.3) * 5;
        this.ctx.fillStyle = '#FFB6C1';
        this.ctx.fillRect(-h/2 + 15, -w/2 + armOffset, 4, 15);
        this.ctx.fillRect(-h/2 + 15, w/2 - 5 - armOffset, 4, 15);
        
        // Draw goggles
        this.ctx.fillStyle = '#4169E1';
        this.ctx.beginPath();
        this.ctx.arc(-h/2 + 8, 0, 6, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x;
            const y = obstacle.y;
            const w = obstacle.width;
            const h = obstacle.height;
            
            if (obstacle.type === 'rock') {
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(x, y, w, h);
                this.ctx.fillStyle = '#A9A9A9';
                this.ctx.fillRect(x + 5, y + 5, w - 10, h - 10);
            } else if (obstacle.type === 'seaweed') {
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(x + 15, y, 10, h);
                this.ctx.fillRect(x + 5, y + 10, 10, h - 10);
                this.ctx.fillRect(x + 25, y + 5, 10, h - 5);
            } else if (obstacle.type === 'jellyfish') {
                this.ctx.fillStyle = '#FF69B4';
                this.ctx.beginPath();
                this.ctx.arc(x + w/2, y + 15, 15, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Tentacles
                this.ctx.strokeStyle = '#FF69B4';
                this.ctx.lineWidth = 3;
                for (let i = 0; i < 4; i++) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 10 + i * 5, y + 25);
                    this.ctx.lineTo(x + 8 + i * 5, y + h);
                    this.ctx.stroke();
                }
            }
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            const x = powerUp.x;
            const y = powerUp.y;
            const w = powerUp.width;
            const h = powerUp.height;
            
            // Glow effect
            const glowOffset = Math.sin(this.animationFrame * 0.2) * 2;
            this.ctx.shadowColor = powerUp.type === 'snorkel' ? '#00FF00' : '#FFD700';
            this.ctx.shadowBlur = 10 + glowOffset;
            
            if (powerUp.type === 'snorkel') {
                this.ctx.fillStyle = '#00FF00';
                this.ctx.fillRect(x + 5, y, 20, 5);
                this.ctx.fillRect(x + 20, y - 5, 5, 15);
                this.ctx.fillRect(x + 15, y + 15, 10, 10);
            } else if (powerUp.type === 'shield') {
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.arc(x + w/2, y + h/2, 12, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.arc(x + w/2, y + h/2, 8, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            const color = particle.color || 'white';
            
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawShield() {
        const x = this.player.x + this.player.width / 2;
        const y = this.player.y + this.player.height / 2;
        const radius = 35 + Math.sin(this.animationFrame * 0.3) * 3;
        
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.globalAlpha = 0.7;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.globalAlpha = 1;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalDistance').textContent = Math.floor(this.distance);
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    reset() {
        this.gameState = 'start';
        this.score = 0;
        this.distance = 0;
        this.speedMultiplier = 1.0;
        this.gameSpeed = this.baseSpeed;
        this.shieldActive = false;
        this.shieldTime = 0;
        
        this.player.currentLane = 1;
        this.player.x = this.laneWidth * 1.5 - 25;
        this.player.y = this.canvas.height - 100;
        this.player.targetX = this.player.x;
        
        this.obstacles = [];
        this.powerUps = [];
        this.particles = [];
        
        this.obstacleTimer = 0;
        this.powerUpTimer = 0;
        this.animationFrame = 0;
        this.waterOffset = 0;
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Game instance
let game;

function startGame() {
    document.getElementById('startScreen').classList.add('hidden');
    if (!game) {
        game = new SwimmingHeroGame();
    }
    game.gameState = 'playing';
    game.reset();
    game.gameState = 'playing';
}

function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    game.reset();
    game.gameState = 'playing';
}

// Initialize game when page loads
window.addEventListener('load', () => {
    game = new SwimmingHeroGame();
});

