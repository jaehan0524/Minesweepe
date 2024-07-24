const TILE_SIZE = 32;
let board, revealed, mines, flagged;
let WIDTH, HEIGHT, MINES;
let gameover = false;

function initializeBoard() {
    board = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(' '));
    revealed = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false));
    mines = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false));
    flagged = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill(false));

    let placedMines = 0;
    while (placedMines < MINES) {
        const x = Math.floor(Math.random() * WIDTH);
        const y = Math.floor(Math.random() * HEIGHT);
        if (!mines[y][x]) {
            mines[y][x] = true;
            placedMines++;
        }
    }
}

function countAdjacentMines(x, y) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && mines[ny][nx]) {
                count++;
            }
        }
    }
    return count;
}

function reveal(x, y) {
    if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT || revealed[y][x] || flagged[y][x]) return;
    revealed[y][x] = true;

    const tile = document.getElementById(`tile-${x}-${y}`);
    const mineCount = countAdjacentMines(x, y);
    if (mineCount > 0) {
        board[y][x] = mineCount.toString();
        tile.textContent = mineCount;
    } else {
        board[y][x] = ' ';
        tile.textContent = '';
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                reveal(x + i, y + j);
            }
        }
    }
    tile.classList.add('revealed');

    if (checkWin()) {
        alert('You win!');
        gameover = true;
    }
}

function revealAdjacentTiles(x, y) {
    const mineCount = countAdjacentMines(x, y);
    let flaggedCount = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const nx = x + i;
            const ny = y + j;
            if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                if (flagged[ny][nx] && !mines[ny][nx]) {
                    gameover = true;
                    alert('Game Over! Incorrect flag placement.');
                    revealAllMines();
                    return;
                }
                if (flagged[ny][nx]) {
                    flaggedCount++;
                }
            }
        }
    }

    if (mineCount === flaggedCount) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const nx = x + i;
                const ny = y + j;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && !flagged[ny][nx] && !mines[ny][nx]) {
                    reveal(nx, ny);
                }
            }
        }
    }
}

function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.style.gridTemplateColumns = `repeat(${WIDTH}, ${TILE_SIZE}px)`;
    boardElement.innerHTML = '';

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const tile = document.createElement('div');
            tile.id = `tile-${x}-${y}`;
            tile.className = 'tile';
            tile.addEventListener('click', (e) => {
                if (gameover) return;
                if (revealed[y][x]) {
                    revealAdjacentTiles(x, y);
                } else if (mines[y][x]) {
                    alert('Game Over');
                    gameover = true;
                    revealAllMines();
                } else {
                    reveal(x, y);
                }
            });
            tile.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (gameover || revealed[y][x]) {
                    return; // 이미 공개된 타일에서는 아무 작업도 하지 않음
                }
                if (!revealed[y][x] && !flagged[y][x]) {
                    flagged[y][x] = true;
                    tile.classList.add('flagged');
                } else if (flagged[y][x]) {
                    flagged[y][x] = false;
                    tile.classList.remove('flagged');
                }
                if (checkWin()) {
                    alert('You win!');
                    gameover = true;
                }
            });
            boardElement.appendChild(tile);
        }
    }
}

function revealAllMines() {
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (mines[y][x]) {
                const tile = document.getElementById(`tile-${x}-${y}`);
                tile.textContent = '*';
                tile.classList.add('revealed');
            }
        }
    }
}

function checkWin() {
    let revealedCount = 0;
    let flaggedCorrectly = true;
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            if (revealed[y][x]) {
                revealedCount++;
            }
            if (flagged[y][x] && !mines[y][x]) {
                flaggedCorrectly = false;
            }
        }
    }
    return (revealedCount === WIDTH * HEIGHT - MINES) && flaggedCorrectly;
}

function startGame() {
    WIDTH = parseInt(document.getElementById('width').value);
    HEIGHT = parseInt(document.getElementById('height').value);
    MINES = parseInt(document.getElementById('mines').value);

    gameover = false;
    initializeBoard();
    drawBoard();
}
//https://git.heroku.com/desolat-beach-56461.git