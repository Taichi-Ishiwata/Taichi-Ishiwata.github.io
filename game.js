"use strict";
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }
    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }
}
class Ball {
    constructor(x, y, radius = 10) {
        this.position = new Vector2(x, y);
        this.velocity = new Vector2(4, -4);
        this.radius = radius;
        this.color = '#fff';
    }
    update() {
        this.position = this.position.add(this.velocity);
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    bounceX() {
        this.velocity.x = -this.velocity.x;
    }
    bounceY() {
        this.velocity.y = -this.velocity.y;
    }
}
class Paddle {
    constructor(x, y, width = 100, height = 15) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.speed = 8;
        this.color = '#00ff00';
    }
    moveLeft() {
        this.position.x -= this.speed;
    }
    moveRight() {
        this.position.x += this.speed;
    }
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }
}
class Brick {
    constructor(x, y, width = 75, height = 20) {
        this.position = new Vector2(x, y);
        this.width = width;
        this.height = height;
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        this.destroyed = false;
    }
    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
            ctx.strokeStyle = '#333';
            ctx.strokeRect(this.position.x, this.position.y, this.width, this.height);
        }
    }
    getBounds() {
        return {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height
        };
    }
    destroy() {
        this.destroyed = true;
    }
}
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.gameRunning = false;
        this.keys = {};
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height - 50);
        this.paddle = new Paddle(this.canvas.width / 2 - 50, this.canvas.height - 30);
        this.bricks = this.createBricks();
        this.setupEventListeners();
        this.gameLoop();
    }
    createBricks() {
        const bricks = [];
        const rows = 6;
        const cols = 10;
        const brickWidth = 75;
        const brickHeight = 20;
        const padding = 5;
        const offsetTop = 60;
        const offsetLeft = (this.canvas.width - (cols * (brickWidth + padding) - padding)) / 2;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = offsetLeft + col * (brickWidth + padding);
                const y = offsetTop + row * (brickHeight + padding);
                bricks.push(new Brick(x, y, brickWidth, brickHeight));
            }
        }
        return bricks;
    }
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleGame();
            }
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
    }
    toggleGame() {
        this.gameRunning = !this.gameRunning;
    }
    handleInput() {
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.paddle.moveLeft();
            if (this.paddle.position.x < 0) {
                this.paddle.position.x = 0;
            }
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.paddle.moveRight();
            if (this.paddle.position.x + this.paddle.width > this.canvas.width) {
                this.paddle.position.x = this.canvas.width - this.paddle.width;
            }
        }
    }
    checkCollisions() {
        if (this.ball.position.x - this.ball.radius <= 0 ||
            this.ball.position.x + this.ball.radius >= this.canvas.width) {
            this.ball.bounceX();
        }
        if (this.ball.position.y - this.ball.radius <= 0) {
            this.ball.bounceY();
        }
        if (this.ball.position.y + this.ball.radius >= this.canvas.height) {
            this.resetGame();
            return;
        }
        const paddleBounds = this.paddle.getBounds();
        if (this.ball.position.x >= paddleBounds.x &&
            this.ball.position.x <= paddleBounds.x + paddleBounds.width &&
            this.ball.position.y + this.ball.radius >= paddleBounds.y &&
            this.ball.position.y - this.ball.radius <= paddleBounds.y + paddleBounds.height) {
            const hitPos = (this.ball.position.x - (paddleBounds.x + paddleBounds.width / 2)) / (paddleBounds.width / 2);
            this.ball.velocity.x = hitPos * 5;
            this.ball.bounceY();
        }
        for (const brick of this.bricks) {
            if (!brick.destroyed) {
                const brickBounds = brick.getBounds();
                if (this.ball.position.x + this.ball.radius >= brickBounds.x &&
                    this.ball.position.x - this.ball.radius <= brickBounds.x + brickBounds.width &&
                    this.ball.position.y + this.ball.radius >= brickBounds.y &&
                    this.ball.position.y - this.ball.radius <= brickBounds.y + brickBounds.height) {
                    brick.destroy();
                    this.score += 10;
                    this.updateScore();
                    this.ball.bounceY();
                    if (this.bricks.every(b => b.destroyed)) {
                        this.winGame();
                    }
                    break;
                }
            }
        }
    }
    update() {
        if (!this.gameRunning)
            return;
        this.handleInput();
        this.ball.update();
        this.checkCollisions();
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.draw(this.ctx);
        this.paddle.draw(this.ctx);
        for (const brick of this.bricks) {
            brick.draw(this.ctx);
        }
        if (!this.gameRunning) {
            this.drawPauseMessage();
        }
    }
    drawPauseMessage() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('スペースキーでゲーム開始', this.canvas.width / 2, this.canvas.height / 2);
    }
    updateScore() {
        const scoreElement = document.getElementById('score');
        if (scoreElement) {
            scoreElement.textContent = `Score: ${this.score}`;
        }
    }
    resetGame() {
        this.ball = new Ball(this.canvas.width / 2, this.canvas.height - 50);
        this.paddle = new Paddle(this.canvas.width / 2 - 50, this.canvas.height - 30);
        this.bricks = this.createBricks();
        this.score = 0;
        this.updateScore();
        this.gameRunning = false;
    }
    winGame() {
        this.gameRunning = false;
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('ゲームクリア！', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '18px Arial';
        this.ctx.fillText('スペースキーで再スタート', this.canvas.width / 2, this.canvas.height / 2 + 40);
        setTimeout(() => this.resetGame(), 3000);
    }
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}
window.addEventListener('DOMContentLoaded', () => {
    new Game('gameCanvas');
});
