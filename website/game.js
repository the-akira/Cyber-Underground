const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações do canvas e da grid
canvas.width = 600;
canvas.height = 600;
const gridSize = 20;
const rows = Math.floor(canvas.height / gridSize);
const cols = Math.floor(canvas.width / gridSize);

// Configurações do quadrado
let squareX = Math.floor(cols / 2);
let squareY = Math.floor(rows / 2);

// Itens e cronômetro
const items = [];
const numItems = 10;
let timeLeft = 80;
let timer;
let gamePaused = false;
let gameOverMessage = '';

// Labirinto
const maze = Array.from({ length: rows }, () => Array(cols).fill(1)); // Inicializa com paredes
function generateMaze() {
    // Algoritmo de Depth-First Search (DFS) para gerar o labirinto
    const stack = [];
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // Cima, baixo, esquerda, direita
    
    // Começa na posição central
    const startX = Math.floor(cols / 2);
    const startY = Math.floor(rows / 2);
    maze[startY][startX] = 0;
    stack.push([startX, startY]);

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = [];

        // Verifica os vizinhos válidos
        directions.forEach(([dx, dy]) => {
            const nx = x + 2 * dx;
            const ny = y + 2 * dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && maze[ny][nx] === 1) {
                neighbors.push([nx, ny, dx, dy]);
            }
        });

        if (neighbors.length > 0) {
            const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
            maze[ny][nx] = 0;
            maze[y + dy][x + dx] = 0;
            stack.push([nx, ny]);
        } else {
            stack.pop();
        }
    }
    maze[squareY][squareX] = 0; // Garante que o quadrado comece em um espaço vazio
}

function generateItems() {
    items.length = 0; // Limpa os itens existentes
    for (let i = 0; i < numItems; i++) {
        let itemX, itemY;
        do {
            itemX = Math.floor(Math.random() * cols);
            itemY = Math.floor(Math.random() * rows);
        } while (maze[itemY][itemX] === 1 || (itemX === squareX && itemY === squareY));
        items.push({ x: itemX, y: itemY });
    }
}

function drawGrid() {
    ctx.strokeStyle = '#139c13';
    ctx.lineWidth = 1;

    // Desenha a grid
    for (let row = 0; row <= rows; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * gridSize);
        ctx.lineTo(canvas.width, row * gridSize);
        ctx.stroke();
    }

    for (let col = 0; col <= cols; col++) {
        ctx.beginPath();
        ctx.moveTo(col * gridSize, 0);
        ctx.lineTo(col * gridSize, canvas.height);
        ctx.stroke();
    }
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00E600';
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (maze[y][x] === 1) {
                ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
            }
        }
    }
}

function drawItems() {
    ctx.fillStyle = 'yellow';
    items.forEach(item => {
        ctx.fillRect(item.x * gridSize, item.y * gridSize, gridSize, gridSize);
    });
}

function drawSquare() {
    ctx.fillStyle = '#be3cfa'; // Cor do jogador
    ctx.fillRect(squareX * gridSize, squareY * gridSize, gridSize, gridSize);
}

function drawTimer() {
    ctx.fillStyle = '#be3cfa'; // Cor do jogador
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Tempo: ${timeLeft}s`, 10, 10);
}

function drawEndScreen(message) {
    canvas.style.border = 'none';
    ctx.fillStyle = '#080808';
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Tela preta
    ctx.fillStyle = '#be3cfa'; // Cor da mensagem
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function update() {
    if (!gamePaused) {
        drawMaze();
        drawGrid();
        drawItems();
        drawSquare();
        drawTimer();
    } else {
        drawEndScreen(gameOverMessage);
    }
}

function moveSquare(e) {
    if (gamePaused) return; // Ignora a movimentação se o jogo estiver pausado

    e.preventDefault();

    let newX = squareX;
    let newY = squareY;
    
    switch (e.key) {
        case 'ArrowUp':
            newY--;
            break;
        case 'ArrowDown':
            newY++;
            break;
        case 'ArrowLeft':
            newX--;
            break;
        case 'ArrowRight':
            newX++;
            break;
    }

    // Verifica se a nova posição é válida
    if (newX >= 0 && newX < cols && newY >= 0 && newY < rows && maze[newY][newX] === 0) {
        squareX = newX;
        squareY = newY;
        
        // Verifica se o jogador coletou um item
        const index = items.findIndex(item => item.x === squareX && item.y === squareY);
        if (index !== -1) {
            items.splice(index, 1); // Remove o item coletado
            if (items.length === 0) {
                gamePaused = true;
                gameOverMessage = 'Vitória! Enter para retornar.';
                update();
            }
        }
    }
    update();
}

function startTimer() {
    timeLeft = 80;
    timer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timer);
            gamePaused = true;
            gameOverMessage = 'Tempo esgotado! Enter para retornar.';
            update();
        }
        update();
    }, 1000);
}

function resetGame() {
    canvas.style.border = '2px solid #00D000';
    squareX = Math.floor(cols / 2);
    squareY = Math.floor(rows / 2);
    generateMaze();
    generateItems();
    startTimer();
    gamePaused = false;
    gameOverMessage = '';
    update();
}

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && gamePaused) {
        resetGame();
    } else {
        moveSquare(e);
    }
});

// Inicializa o jogo
resetGame();