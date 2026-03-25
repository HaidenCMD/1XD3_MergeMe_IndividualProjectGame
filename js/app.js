/*
Name: Haiden Clark-McLean-Davis
Student Number: 400650209
Course: COMPSCI 1XD3
Lab: Lab 7.2
File: app.js
Date: March 24, 2026
Due: March 16, 2026 (8 late days used)
Description: JavaScript logic for the Merge Me game.
*/

// Game setup
window.addEventListener('load', function () {

    class Game {
        constructor() {
            this.canvas = document.getElementById('game');
            this.ctx = this.canvas.getContext('2d');
            this.canvas.width = 600;
            this.canvas.height = 600;
            this.score = 0;
            this.merges = 0;
            this.selectedIndex = null;
            this.colors = ["Red", "Orange", "Yellow", "Green", "Cyan", "Blue", "Purple", "Magenta", "Pink"];
            this.board = [null, null, null, null, null, null, null, null, null,];
            this.splashScreen = document.getElementById('splashScreen');
            this.gameScreen = document.getElementById('gameScreen');
            this.resultScreen = document.getElementById('resultScreen');
            this.startButton = document.getElementById('startButton');
            this.reStartButton = document.getElementById('reStartButton');
            this.helpButton = document.getElementById('helpButton');
            this.mainMenuButton = document.getElementById('mainMenuButton');
            this.gameOverText = document.getElementById('gameOverText');
            this.gameTitle = document.getElementById('gameTitle');
            this.splashTitle = document.getElementById('splashTitle');
            this.splashCanvas = document.getElementById('splashCanvas');
            this.splashCtx = this.splashCanvas.getContext('2d');

            this.seconds = 0;
            this.dragging = false;
            this.dragIndex = null;
            this.dragValue = null;
            this.dragSourceValue = null;
            this.dragMouseX = 0;
            this.dragMouseY = 0;
            this.dragOffsetX = 0;
            this.dragOffsetY = 0;
            this.scoreText = document.getElementById('score');
            this.mergesText = document.getElementById('merges');
            this.highscoreText = document.getElementById('highscore');
            this.highscore = parseInt(localStorage.getItem("mergeMeScore")) || 0;
            this.highscoreText.textContent = this.highscore;
            this.minSpawnDelay = 700;
            this.maxSpawnDelay = 1000;
            this.timeText = document.getElementById('time');
            this.timerInterval = null;
            this.currentMaxSpawnDelay = this.maxSpawnDelay;
            this.helpButton = document.getElementById('helpButton');
            this.helpText = document.getElementById('helpText');
            this.spawnTimeout = null;
            this.splashAnimationFrame = null;
            this.splashMerged = false;
            this.splashPause = 0;
            this.splashBoxes = [
                { x: 50, y: 70, size: 36, color: "Red", dx: 1.4 },
                { x: 234, y: 70, size: 36, color: "Red", dx: -1.4 }
            ];

            this.helpButton.addEventListener('click', () => {
                this.helpText.classList.toggle('hidden');
            });
            this.canvas.addEventListener('mousedown', (event) => {
                this.handleMouseDown(event);
            });
            this.canvas.addEventListener('mousemove', (event) => {
                this.handleMouseMove(event);
            });
            document.addEventListener('mouseup', (event) => {
                this.handleMouseUp(event);
            });
            this.startButton.addEventListener('click', () => {
                this.startGame();
            });
            this.reStartButton.addEventListener('click', () => {
                this.startGame();
            });
            this.mainMenuButton.addEventListener('click', () => {
                this.showSplashScreen();
            });


            this.drawSplash();
            this.animateSplash();
        }

        // Show splash screen again
        showSplashScreen() {
            clearTimeout(this.spawnTimeout);
            clearInterval(this.timerInterval);
            this.splashScreen.classList.remove("fadeOut");
            this.splashTitle.classList.remove("hidden");
            this.gameTitle.classList.add("hidden");
            this.gameScreen.classList.add("hidden");
            this.resultScreen.classList.add("hidden");
            this.splashScreen.classList.remove("hidden");
            this.helpButton.classList.remove('hidden');
            this.drawSplash();
            this.animateSplash();
        }

        // Draw splash animation
        drawSplash() {
            this.splashCtx.clearRect(0, 0, this.splashCanvas.width, this.splashCanvas.height);
            this.splashCtx.fillStyle = "white";
            this.splashCtx.fillRect(0, 0, this.splashCanvas.width, this.splashCanvas.height);

            if (!this.splashMerged) {
                for (let i = 0; i < this.splashBoxes.length; i++) {
                    this.splashCtx.fillStyle = this.splashBoxes[i].color;
                    this.splashCtx.fillRect(this.splashBoxes[i].x, this.splashBoxes[i].y, this.splashBoxes[i].size, this.splashBoxes[i].size);
                    this.splashCtx.strokeStyle = "black";
                    this.splashCtx.lineWidth = 2;
                    this.splashCtx.strokeRect(this.splashBoxes[i].x, this.splashBoxes[i].y, this.splashBoxes[i].size, this.splashBoxes[i].size);
                }
            } else {
                this.splashCtx.fillStyle = "Orange";
                this.splashCtx.fillRect(142, 70, 36, 36);
                this.splashCtx.strokeStyle = "black";
                this.splashCtx.lineWidth = 2;
                this.splashCtx.strokeRect(142, 70, 36, 36);
            }
        }

        // Animate splash screen
        animateSplash() {
            if (this.splashScreen.classList.contains("hidden")) {
                return;
            }

            if (!this.splashMerged) {
                this.splashBoxes[0].x += this.splashBoxes[0].dx;
                this.splashBoxes[1].x += this.splashBoxes[1].dx;

                if (this.splashBoxes[0].x + this.splashBoxes[0].size >= this.splashBoxes[1].x) {
                    this.splashMerged = true;
                    this.splashPause = 25;
                }
            } else {
                this.splashPause -= 1;

                if (this.splashPause <= 0) {
                    this.splashMerged = false;
                    this.splashBoxes[0].x = 50;
                    this.splashBoxes[1].x = 234;
                }
            }

            this.drawSplash();

            this.splashAnimationFrame = requestAnimationFrame(() => {
                this.animateSplash();
            });
        }

        // Start / restart the game
        startGame() {
            clearTimeout(this.spawnTimeout);
            clearInterval(this.timerInterval);

            if (this.splashAnimationFrame) {
                cancelAnimationFrame(this.splashAnimationFrame);
            }

            this.seconds = 0;
            this.timeText.textContent = "0s";
            this.currentMaxSpawnDelay = this.maxSpawnDelay;


            this.timerInterval = setInterval(() => {
                this.seconds += 1;
                this.timeText.textContent = this.seconds + "s";
            }, 1000);
            this.scoreText.textContent = 0;
            this.mergesText.textContent = 0;

            
            this.score = 0;
            this.merges = 0;
            this.seconds = 0;
            this.dragging = false;
            this.dragIndex = null;
            this.dragValue = null;
            this.dragSourceValue = null;
            this.currentMaxSpawnDelay = this.maxSpawnDelay;
            this.board = [null, null, null, null, null, null, null, null, null];
            this.helpButton.classList.add('hidden');
            this.resultScreen.classList.add("hidden");
            this.splashScreen.classList.add("fadeOut");

            setTimeout(() => {
                this.splashScreen.classList.add("hidden");
                setTimeout(() => {
                this.splashTitle.classList.add("hidden");
                this.gameTitle.classList.remove("hidden");
                this.gameScreen.classList.remove("hidden");
                this.drawBoard();
                this.periodicSpawn();
                }, 1000);
            }, 400);
        }

        // Draw main game board
        drawBoard() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            const cellWidth = this.canvas.width / 3;
            const cellHeight = this.canvas.height / 3;

            for (let i = 0; i < this.board.length; i++) {
                const row = Math.floor(i / 3);
                const col = i % 3;

                const x = col * cellWidth;
                const y = row * cellHeight;

                if (this.board[i] !== null) {
                    this.ctx.fillStyle = this.colors[this.board[i]];
                    this.ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
                }

                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
            }

            if (this.dragging && this.dragValue !== null) {
                const scale = 1;
                const biggerWidth = cellWidth * scale;
                const biggerHeight = cellHeight * scale;

                const x = this.dragMouseX - this.dragOffsetX - ((biggerWidth - cellWidth) / 2);
                const y = this.dragMouseY - this.dragOffsetY - ((biggerHeight - cellHeight) / 2);

                this.ctx.globalAlpha = 0.9;
                this.ctx.fillStyle = this.colors[this.dragValue];
                this.ctx.fillRect(x, y, biggerWidth, biggerHeight);

                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x, y, biggerWidth, biggerHeight);
                this.ctx.globalAlpha = 1;
            }

        }

        // Start dragging box
        handleMouseDown(event) {
            if (this.gameOver()) {
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const cellWidth = this.canvas.width / 3;
            const cellHeight = this.canvas.height / 3;
            const col = Math.floor(mouseX / cellWidth);
            const row = Math.floor(mouseY / cellHeight);
            if (col < 0 || col > 2 || row < 0 || row > 2) {
                return;
            }

            const index = row * 3 + col;
            if (this.board[index] === null) {
                return;
            }
            this.dragging = true;
            this.dragIndex = index;
            this.dragValue = this.board[index];
            this.dragSourceValue = this.board[index];
            this.dragMouseX = mouseX;
            this.dragMouseY = mouseY;
            const x = col * cellWidth;
            const y = row * cellHeight;
            this.dragOffsetX = mouseX - x;
            this.dragOffsetY = mouseY - y;
            this.drawBoard();
        }

        // Move dragged boxes
        handleMouseMove(event) {
            if (!this.dragging) {
                return;
            }

            const rect = this.canvas.getBoundingClientRect();
            this.dragMouseX = event.clientX - rect.left;
            this.dragMouseY = event.clientY - rect.top;
            this.drawBoard();
        }

        // Drop, merge, or swap boxes
        handleMouseUp(event) {
            if (!this.dragging) {
                return;
            }
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            const cellWidth = this.canvas.width / 3;
            const cellHeight = this.canvas.height / 3;
            const col = Math.floor(mouseX / cellWidth);
            const row = Math.floor(mouseY / cellHeight);
            let targetIndex = null;
            if (!(col < 0 || col > 2 || row < 0 || row > 2)) {
                targetIndex = row * 3 + col;
            }
            if (targetIndex !== null && targetIndex !== this.dragIndex && this.board[targetIndex] !== null && this.board[targetIndex] === this.dragValue) {
                this.board[this.dragIndex] = null;
                this.board[targetIndex] = this.board[targetIndex] + 1;

                if (this.board[targetIndex] >= this.colors.length) {
                    this.board[targetIndex] = this.colors.length - 1;
                }

                this.merges += 1;
                this.score += 10;
            } else if (targetIndex !== null && targetIndex !== this.dragIndex) {
                const temp = this.board[targetIndex];
                this.board[targetIndex] = this.dragSourceValue;
                this.board[this.dragIndex] = temp;
            }

            this.dragging = false;
            this.dragIndex = null;
            this.dragValue = null;
            this.dragSourceValue = null;

            this.scoreText.textContent = this.score;
            this.mergesText.textContent = this.merges;
            if (this.score >= this.highscore) {
                this.highscore = this.score;
                this.highscoreText.textContent = this.highscore;
                localStorage.setItem("mergeMeScore", this.highscore);
            }
            this.drawBoard();
        }


        // Spawn boxes over time and check conditions for game win or game over
        periodicSpawn() {
            const delay = Math.floor(Math.random() * (this.maxSpawnDelay - this.minSpawnDelay + 1)) + this.minSpawnDelay;

            this.spawnTimeout = setTimeout(() => {
                if (this.gameWin()) {
                    if (this.score > this.highscore) {
                        this.highscore = this.score;
                        this.highscoreText.textContent = this.highscore;
                        localStorage.setItem("mergeMeScore", this.highscore);
                    }

                    this.splashTitle.classList.remove("hidden");
                    this.gameTitle.classList.add("hidden");
                    this.gameOverText.textContent = "You win!!";
                    this.drawBoard();
                    this.gameScreen.classList.add("hidden");
                    this.resultScreen.classList.remove("hidden");
                    clearTimeout(this.spawnTimeout);
                    clearInterval(this.timerInterval);
                    return;

                }
                if (this.gameOver()) {
                    if (this.score > this.highscore) {
                        this.highscore = this.score;
                        this.highscoreText.textContent = this.highscore;
                        localStorage.setItem("mergeMeScore", this.highscore);
                    }
                    this.splashTitle.classList.remove("hidden");
                    this.gameTitle.classList.add("hidden");
                    this.gameOverText.textContent = "Game Over!!";
                    this.drawBoard();
                    this.gameScreen.classList.add("hidden");
                    this.resultScreen.classList.remove("hidden");
                    clearTimeout(this.spawnTimeout);
                    clearInterval(this.timerInterval);
                    return;
                }

                this.spawnGreenBox();
                this.drawBoard();
                this.periodicSpawn();
            }, delay);
        }

        // Spawn a new base box in an empty cell, random
        spawnGreenBox() {
            const emptyIndexes = [];

            for (let i = 0; i < this.board.length; i++) {
                if (this.board[i] === null) {
                    emptyIndexes.push(i);
                }
            }

            if (emptyIndexes.length === 0) {
                return;
            }

            const randomIndex = Math.floor(Math.random() * emptyIndexes.length);
            const chosenIndex = emptyIndexes[randomIndex];

            this.board[chosenIndex] = 0;
            console.log(this.board);
        }

        // Check is player at the final color
        gameWin() {
            for (let i = 0; i < this.board.length; i++) {
                if (this.board[i] !== null && this.board[i] >= this.colors.length - 1) {
                    return true;
                }
            }
            return false;
        }

        // Check is board is full and that means game over
        gameOver() {
            for (let i = 0; i < this.board.length; i++) {
                if (this.board[i] === null) {
                    return false;
                }
            }

            return true;
        }

    }
    const game = new Game();
});