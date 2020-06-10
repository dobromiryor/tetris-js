// Tetris canvas
const cvs = document.getElementById('tetris');
const ctx = cvs.getContext('2d');
// Next piece canvas
const nextCvs = document.getElementById('next-piece');
const nextCtx = nextCvs.getContext('2d');

const scoreElement = document.getElementById('score');
const clearsElement = document.getElementById('clears');
const levelElement = document.getElementById('level');
const startMessage = document.getElementById('start-message');
const tetrisMessage = document.getElementById('tetris-message');
const endMessage = document.getElementById('end-message');
const resetMessage = document.getElementById('reset-message');
const soundSymbol = document.getElementById('sound');
const highScoreElement = document.getElementById('high-score');

// Tetrominoes
const PIECE = [Z, S, T, O, L, I, J];

// Canvas row
const ROW = 20;

// Canvas column
const COL = COLUMN = 10;

// Size of square
const SQ = squareSize = 20;

// Next tetromino canvas row
const NROW = 4;

// Next tetromino canvas column
const NCOL = COLUMN = 4;

// Next tetromino size of square
const NSQ = squareSize = 20;

// Empty square
const VACANT = 'rgb(155, 170, 131)';

// Filled square
const FILLED = 'rgb(66, 73, 55)';

// Score
let score = 0;

// High score
let highScore = localStorage.getItem('highscore') == null ? 
    0 : localStorage.getItem('highscore');

// Clears
let clears = 0;

// Level
let level = 1;

// Game state
let running = false;

// Soft/Hard drop y coordinate
let dropY = 0;

// Sound
let muted = false;

// Draw a square
function drawSquare(x, y, color){
    ctx.fillStyle = color;
    ctx.clearRect(x*SQ, y*SQ, SQ, SQ);
    ctx.fillRect((x*SQ)+1, (y*SQ)+1, SQ-2, SQ-2)
    ctx.clearRect((x*SQ)+2, (y*SQ)+2, SQ-4, SQ-4)
    ctx.fillRect((x*SQ)+4, (y*SQ)+4, SQ-8, SQ-8)
}

// Create the board
let board = [];
for(r = 0; r < ROW; r++){
    board[r] = [];
    for(c = 0; c < COL; c++){
        board[r][c] = VACANT;
    }
}

// Draw the board
function drawBoard(){  
    for(r = 0; r < ROW; r++){
        for(c = 0; c < COL; c++){
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();

// Draw a square for next tetromino
function drawNextSquare(x, y, color){
    nextCtx.fillStyle = color;
    nextCtx.clearRect(x*SQ, y*SQ, SQ, SQ);
    nextCtx.fillRect((x*SQ)+1, (y*SQ)+1, SQ-2, SQ-2)
    nextCtx.clearRect((x*SQ)+2, (y*SQ)+2, SQ-4, SQ-4)
    nextCtx.fillRect((x*SQ)+4, (y*SQ)+4, SQ-8, SQ-8)
}

// Create the board for the next tetromino
let nextBoard = [];
for(r = 0; r < NROW; r++){
    nextBoard[r] = [];
    for(c = 0; c < NCOL; c++){
        nextBoard = VACANT;
    }
}

// Draw the board for the next tetromino
function drawNextBoard(){  
    for(r = 0; r < NROW; r++){
        for(c = 0; c < NCOL; c++){
            drawNextSquare(c, r, nextBoard);
        }
    }
}
drawNextBoard();

// Generate random piece
function randomPiece(){
    let r = randomN = Math.floor(Math.random() * PIECE.length) // 0 -> 6
    return new Piece( PIECE[r], PIECE[r]);
}
let p = randomPiece();
let nextPiece = randomPiece();

// The Object Piece
function Piece(tetromino){
    this.tetromino = tetromino;
    this.color = FILLED;

    this.tetrominoN = 0 // starts from first pattern
    this.activeTetromino = this.tetromino[this.tetrominoN];

    // piece position
    this.x = 3;
    this.y = -2;
}

// Fill function

Piece.prototype.fill = function(color){
    for(r = 0; r < p.activeTetromino.length; r++){
        for(c = 0; c < p.activeTetromino.length; c++){
            // draw only ocupied squares
            if(p.activeTetromino[r][c]){
                drawSquare(this.x + c, this.y + r, color)
            }
        }
    }
}

// Fill next piece 
Piece.prototype.fillNext = function(color){
    for(r = 0; r < 3; r++){
        for(c = 0; c < 4; c++){
            // undraw old, draw new squares
            if(!nextPiece.activeTetromino[r][c]){
                drawNextSquare(0 + c, 0 + r, VACANT)
            } else {
                drawNextSquare(0 + c, 0 + r, FILLED)
            }
        }
    }
}

// Draw the piece to the board
Piece.prototype.draw = function(){
    this.fill(this.color);
    this.fillNext(this.color);
}

// Remove the piece from the board
Piece.prototype.unDraw = function(){
    this.fill(VACANT);
    this.fillNext(VACANT);
}

// Move left the piece
Piece.prototype.moveLeft = function (){
    if(!this.collision(-1, 0, this.activeTetromino)){
        this.unDraw();
        this.x--;
        this.draw();
        // Audio
        let audio = new Audio('audio/move.ogg');
        if(!muted){
            audio.play();
        }
        audio.volume = 0.3;
    }
}

// Move right the piece
Piece.prototype.moveRight = function (){
    if(!this.collision(1, 0, this.activeTetromino)){
        this.unDraw();
        this.x++;
        this.draw();
        // Audio
        let audio = new Audio('audio/move.ogg');
        if(!muted){
            audio.play();
        }
        audio.volume = 0.3;
    }
}

// Move down the piece
Piece.prototype.moveDown = function (){
    if(!this.collision(0, 1, this.activeTetromino)){
        this.unDraw();
        this.y++;
        this.draw();
        // Audio
        let audio = new Audio('audio/move.ogg');
        if(!muted){
            audio.play();
        }
        audio.volume = 0.3;
    }else{
        this.lock();
        // Audio
        let audio = new Audio('audio/softDrop.ogg');
        if(!muted){
            audio.play();
        }
        // Pick next piece
        p = nextPiece;
        nextPiece = randomPiece();
    }
    // score += (18 - dropY)*1;
}

// Hard Drop
Piece.prototype.hardDrop = function (){
    for(r = 0; r < ROW; r++){
        if(!this.collision(0, 1, this.activeTetromino)){
            dropY = this.y;
            this.unDraw();
            this.y++;
            this.draw(); 
        }else{
            this.lock();
            // Audio
            let audio = new Audio('audio/hardDrop.ogg');
            if(!muted){
                audio.play();
            }
            // Pick next piece
            p = nextPiece;
            nextPiece = randomPiece();
        }
    }
    // score += (18 - dropY)*2;
}

// Rotate the piece
Piece.prototype.rotate = function (){
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if(this.collision(0, 0, nextPattern)){
        if(this.x > COL/2){
            // stuck on right wall
            kick = -1; // move left
        } else {
            // stuck on left wall
            kick = 1; // move right
        }
    }
    if(!this.collision(kick, 0, nextPattern)){
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; // 3 -> 0
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
        // Audio
        let audio = new Audio('audio/rotate.ogg');
        if(!muted){
            audio.play();
        }
        audio.volume = 0.2;
    }
}

// Lock piece in place 
Piece.prototype.lock = function(){
    let clearedRows = 0;
    for(r = 0; r < this.activeTetromino.length; r++){
        for(c = 0; c < this.activeTetromino.length; c++){
            // skip vacant squares
            if(!this.activeTetromino[r][c]){
                continue;
            }
            // game over
            if(this.y + r < 0){
                endMessage.classList.remove('o-1');

                // stop request animation frame
                gameOver = true;

                // Audio
                let audio = new Audio('audio/gameOver.ogg');
                if(!muted){
                    audio.play();
                }

                // Update high score
                updateHighScore()

                // Reload message
                resetMessage.classList.remove('o-1');
                break;
            }
            // lock piece
            board[this.y+r][this.x+c] = this.color;
        }
    }

    // clear row
    for (r = 0; r < ROW; r++){
        let isRowFull = true;
        for(c = 0; c < COL; c++){
            isRowFull = isRowFull && (board[r][c]  != VACANT);
        }
        if(isRowFull){ // if roll is full, then clear it
            clearedRows += 1;
            // remove one from bottom
            for(y = r; y > 1; y--){
                for(c = 0; c < COL; c++){
                    board[y][c] = board[y-1][c];
                }
            }
            // add one on top
            for(c = 0; c < COL; c++){
                board[0][c] = VACANT;
            }
        }
    }

    // Scoring depending on Soft/Hard drop height
    // score += 1;

    // Scoring depending on cleared rows
    if(clearedRows === 4){ //number of cleared rows
        score += 800 * level;
        clears += 4;
        // Audio
        let audio = new Audio('audio/tetris.ogg');
        if(!muted){
            audio.play();
        }
        // Tetris! animation
        tetrisMessage.classList.add('flash');
        setTimeout(function(){
            tetrisMessage.classList.remove('flash');
        }, 2000);
    } else if(clearedRows === 3){
        score += 500 * level;
        clears += 3;
    } else if(clearedRows === 2){
        score += 300 * level;
        clears += 2;
    } else if(clearedRows === 1){
        score += 100 * level;
        clears += 1;
    }

    // Check if level should be incremented
    levelCheck();

    // Update the board
    drawBoard();

    // Update score
    scoreElement.innerHTML = score;

    // Update clears
    clearsElement.innerHTML = clears;
}

// Collision function
Piece.prototype.collision = function(x,y,piece){
    for(r = 0; r < piece.length; r++){
        for(c = 0; c < piece.length; c++){
            // skip if square is empty
            if(!piece[r][c]){
                continue;
            }

            // placement after movement
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // conditions
            if(newX < 0 || newX >= COL || newY >= ROW){
                return true;
            }

            // skip newY < 0 -> board[-1]; crashes the game
            if(newY < 0){
                continue;
            }

            // check for locked piece
            if(board[newY][newX] != VACANT){
                return true;
            }
        }
    }
}

// Controls
document.addEventListener('keydown', CONTROL);

function CONTROL(event){
    if(event.keyCode === 32){ // Hard Drop
        if(running && !gameOver){
            p.hardDrop();
            dropStart = Date.now();
        }
    }else if(event.keyCode === 37){ // Left
        if(running && !gameOver){
            p.moveLeft();
            dropStart = Date.now();
        }
    }else if(event.keyCode === 38){ // Rotate
        if(running && !gameOver){
            p.rotate();
            dropStart = Date.now();
        }
    }else if(event.keyCode === 39){ // Right
        if(running && !gameOver){
            p.moveRight();
            dropStart = Date.now();
        }
    }else if(event.keyCode === 40){ // Down
        if(!gameOver){
            p.moveDown();
            dropStart = Date.now();
        }
        if(!running){
            start();
        }
    }else if(event.keyCode === 82){ // Reset game
        reload();
    }else if(event.keyCode === 83){ // Mute game
        mute();
    }
}

// Start game
function start(){
    drop();
    running = true;
    // Audio
    let audio = new Audio('audio/start.ogg');
    if(!muted){
        audio.play();
    }
    startMessage.classList.add('o-1');
}

// Reload game
function reload(){
    location.reload();
}

// Mute game
function mute(){
    if(!muted){
        muted = true;
        soundSymbol.classList.add('o-1');
    } else {
        muted = false;
        soundSymbol.classList.remove('o-1');
    }
}

// Level system
function levelCheck(){
    let temp = Math.floor((clears+10)/10);
    if(temp > level){
        level = temp;
        // Audio
        let audio = new Audio('audio/levelUp.ogg');
        if(!muted){
            audio.play();
        }
        // Update level
        levelElement.innerHTML = level;
    }
    
}

// Update high score
function updateHighScore(){
    if(score > parseInt(highScore)){
        localStorage.setItem('highscore', score);
    }
    highScoreElement.innerHTML = parseInt(highScore);
}
updateHighScore();

// Drop down 
let gameOver = false;
let dropStart = Date.now();
function drop(){
    let now = Date.now();
    let delta = now - dropStart;
    if(delta > (1000/level)){ // drop speed depending on level
        p.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver){
        requestAnimationFrame(drop);
    }
}