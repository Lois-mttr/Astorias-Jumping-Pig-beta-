// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    const wrapper = canvas.parentElement;
    canvas.width = wrapper.clientWidth;
    canvas.height = 400;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game Constants
const COLLISION_PADDING = 10; // Padding for more forgiving collision detection

// Game State
let gameState = {
    isRunning: false,
    score: 0,
    highScore: localStorage.getItem('highScore') || 0,
    gameSpeed: 5,
    gravity: 0.6,
    jumpStrength: -12
};

// Player (Pig)
const player = {
    x: 100,
    y: 0,
    width: 50,
    height: 50,
    velocityY: 0,
    isJumping: false,
    
    draw() {
        // Draw a simple pig using shapes and emoji
        ctx.save();
        
        // Pig body (pink circle)
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.arc(this.x + 25, this.y + 25, 25, 0, Math.PI * 2);
        ctx.fill();
        
        // Pig snout (lighter pink oval)
        ctx.fillStyle = '#FFC0CB';
        ctx.beginPath();
        ctx.ellipse(this.x + 25, this.y + 30, 12, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Nostrils
        ctx.fillStyle = '#FF69B4';
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 30, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 30, this.y + 30, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 18, this.y + 20, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 32, this.y + 20, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Ears
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(this.x + 10, this.y + 10, 8, 12, -0.3, 0, Math.PI * 2);
        ctx.ellipse(this.x + 40, this.y + 10, 8, 12, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    },
    
    update() {
        // Apply gravity
        this.velocityY += gameState.gravity;
        this.y += this.velocityY;
        
        // Ground collision
        const groundY = canvas.height - 80 - this.height;
        if (this.y >= groundY) {
            this.y = groundY;
            this.velocityY = 0;
            this.isJumping = false;
        }
    },
    
    jump() {
        if (!this.isJumping && gameState.isRunning) {
            this.velocityY = gameState.jumpStrength;
            this.isJumping = true;
        }
    },
    
    reset() {
        this.y = canvas.height - 80 - this.height;
        this.velocityY = 0;
        this.isJumping = false;
    }
};

// Obstacles
class Obstacle {
    constructor() {
        this.width = 40;
        this.height = 60 + Math.random() * 40;
        this.x = canvas.width;
        this.y = canvas.height - 80 - this.height;
        this.passed = false;
    }
    
    draw() {
        // Draw cactus-like obstacle
        ctx.fillStyle = '#228B22';
        
        // Main trunk
        ctx.fillRect(this.x + 10, this.y, 20, this.height);
        
        // Left arm
        if (this.height > 70) {
            ctx.fillRect(this.x, this.y + 20, 15, 8);
            ctx.fillRect(this.x, this.y + 20, 8, 25);
        }
        
        // Right arm
        if (this.height > 80) {
            ctx.fillRect(this.x + 25, this.y + 30, 15, 8);
            ctx.fillRect(this.x + 32, this.y + 30, 8, 25);
        }
    }
    
    update() {
        this.x -= gameState.gameSpeed;
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    collidesWith(player) {
        return (
            player.x < this.x + this.width - COLLISION_PADDING &&
            player.x + player.width > this.x + COLLISION_PADDING &&
            player.y < this.y + this.height &&
            player.y + player.height > this.y
        );
    }
}

let obstacles = [];
let frameCount = 0;
const obstacleSpawnRate = 100;

// Ground
function drawGround() {
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
    
    // Ground details (grass)
    ctx.fillStyle = '#228B22';
    for (let i = 0; i < canvas.width; i += 20) {
        ctx.fillRect(i, canvas.height - 80, 10, 5);
    }
}

// Clouds - Initialize after canvas is sized
const clouds = [];
function initializeClouds() {
    clouds.length = 0; // Clear existing clouds
    for (let i = 0; i < 5; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * 100 + 20,
            width: 60 + Math.random() * 40,
            speed: 0.5 + Math.random() * 0.5
        });
    }
}
initializeClouds();

function drawClouds() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 25, cloud.y, 25, 0, Math.PI * 2);
        ctx.arc(cloud.x + 50, cloud.y, 20, 0, Math.PI * 2);
        ctx.fill();
        
        cloud.x -= cloud.speed;
        if (cloud.x < -60) {
            cloud.x = canvas.width + 60;
        }
    });
}

// Score Display
function updateScoreDisplay() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('displayHighScore').textContent = gameState.highScore;
}

// Game Loop
function gameLoop() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background elements
    drawClouds();
    drawGround();
    
    if (gameState.isRunning) {
        // Update and draw player
        player.update();
        player.draw();
        
        // Spawn obstacles
        frameCount++;
        if (frameCount % obstacleSpawnRate === 0) {
            obstacles.push(new Obstacle());
        }
        
        // Update and draw obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.update();
            obstacle.draw();
            
            // Check collision
            if (obstacle.collidesWith(player)) {
                gameOver();
            }
            
            // Score point when passing obstacle
            if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
                obstacle.passed = true;
                gameState.score++;
                updateScoreDisplay();
                
                // Increase difficulty
                if (gameState.score % 5 === 0) {
                    gameState.gameSpeed += 0.5;
                }
            }
            
            // Remove off-screen obstacles
            if (obstacle.isOffScreen()) {
                obstacles.splice(i, 1);
            }
        }
    } else {
        // Draw player in idle position
        player.draw();
    }
    
    requestAnimationFrame(gameLoop);
}

// Game Control Functions
function startGame() {
    gameState.isRunning = true;
    gameState.score = 0;
    gameState.gameSpeed = 5;
    obstacles = [];
    frameCount = 0;
    player.reset();
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    updateScoreDisplay();
}

function gameOver() {
    gameState.isRunning = false;
    
    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('highScore', gameState.highScore);
    }
    
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('highScore').textContent = gameState.highScore;
    document.getElementById('gameOver').classList.remove('hidden');
    updateScoreDisplay();
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);

// Jump controls
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (!gameState.isRunning && document.getElementById('startScreen').classList.contains('hidden')) {
            startGame();
        } else {
            player.jump();
        }
    }
});

canvas.addEventListener('click', () => {
    if (!gameState.isRunning && document.getElementById('startScreen').classList.contains('hidden')) {
        startGame();
    } else {
        player.jump();
    }
});

// Touch support for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameState.isRunning && document.getElementById('startScreen').classList.contains('hidden')) {
        startGame();
    } else {
        player.jump();
    }
});

// Initialize
updateScoreDisplay();
player.reset();
gameLoop();
