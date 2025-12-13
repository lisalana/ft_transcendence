const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const startBtn = document.getElementById('startBtn');
const lobbyInfo = document.getElementById('lobbyInfo');
const canvasContainer = document.getElementById('canvasContainer');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const pauseOverlay = document.getElementById('pauseOverlay');

let gameId = null;
let ws = null;
let playersConnected = {};
let gameState = null;
let currentMode = '2players'; // Default
let totalPlayers = 2;

// Particle System
let particles = [];
let isGameOver = false;
let winnerId = null;
let animationFrameId = null;

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.005;
        this.gravity = 0.1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.alpha -= this.decay;
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, Math.random() * 4 + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 150; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function renderGameOver() {
    if (!isGameOver) return;

    // Semi-transparent clear for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particles = particles.filter(p => p.update());
    particles.forEach(p => p.draw(ctx));

    // Draw Winner Text
    ctx.save();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 60px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#667eea';
    ctx.shadowBlur = 20;
    ctx.fillText(`PLAYER ${winnerId} WINS!`, canvas.width / 2, canvas.height / 2);
    ctx.restore();

    animationFrameId = requestAnimationFrame(renderGameOver);
}

startBtn.addEventListener('click', startGame);

async function createGame(mode) {
    try {
        const res = await fetch(`${window.location.protocol}//${window.location.host}/api/game/create/${mode}`, { method: 'POST' });
        const data = await res.json();

        if (data.status === 'ok') {
            gameId = data.gameId;
            currentMode = mode;

            // Determine total players
            if (mode === '2players') totalPlayers = 2;
            else if (mode === '3players') totalPlayers = 3;
            else if (mode === '4players') totalPlayers = 4;

            // Resize canvas for 3/4 players
            if (totalPlayers > 2) {
                canvas.width = 800;
                canvas.height = 800;
            } else {
                canvas.width = 800;
                canvas.height = 400;
            }

            initLobby();
        }
    } catch (e) {
        console.error('Failed to create game:', e);
        alert('Error creating game');
    }
}

function initLobby() {
    startScreen.classList.add('hidden');
    gameScreen.classList.add('active');

    lobbyInfo.innerHTML = ''; // Clear previous
    playersConnected = {};

    for (let i = 1; i <= totalPlayers; i++) {
        playersConnected[i] = false;

        // Create Card
        const card = document.createElement('div');
        card.className = 'player-card';
        card.id = `p${i}Card`;

        let title = `Player ${i}`;
        if (i === 1) title += " (Left)";
        else if (i === 2 && totalPlayers >= 2) title += " (Right)";
        else if (i === 3) title += " (Top)";
        else if (i === 4) title += " (Bottom)";

        card.innerHTML = `
                    <h3>${title}</h3>
                    <div class="status-badge" id="p${i}Status">Waiting for connection...</div>
                    <div id="qr-p${i}" class="qr-placeholder"></div>
                    <div class="controls-hint">Scan to join</div>
                `;
        lobbyInfo.appendChild(card);

        // Generate QR
        setTimeout(() => {
            generateQR(`qr-p${i}`, getControllerUrl(i));
        }, 0);
    }

    // Connect WebSocket
    connectWebSocket();
}

function getControllerUrl(playerId) {
    const host = window.location.host;
    const protocol = window.location.protocol;
    return `${protocol}//${host}/controller.html?gameId=${gameId}&playerId=${playerId}`;
}

function generateQR(elementId, text) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';
    new QRCode(el, {
        text: text,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    el.style.cursor = 'pointer';
    el.onclick = () => window.open(text, '_blank', 'width=400,height=600');
}

function connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/game/${gameId}/websocket`;
    // alert(wsUrl);

    ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            handleMessage(data);
        } catch (e) {
            // Ignore non-JSON
        }
    };
}

function handleMessage(data) {
    if (data.type === 'player_connection') {
        updatePlayerStatus(data.playerId, data.connected);
    }
    else if (data.type === 'game_started') {
        lobbyInfo.classList.add('hidden');
        startBtn.classList.add('hidden');
        canvasContainer.classList.remove('hidden');
        isGameOver = false;
    }
    else if (data.type === 'game_paused') {
        pauseOverlay.classList.remove('hidden');
        lobbyInfo.classList.remove('hidden'); // Show QR codes
    }
    else if (data.type === 'game_resumed') {
        pauseOverlay.classList.add('hidden');
        lobbyInfo.classList.add('hidden'); // Hide QR codes
    }
    else if (data.type === 'game_state_update') {
        if (!isGameOver) {
            gameState = data.state;
            drawGame();
        }
    }
    else if (data.type === 'game_over') {
        winnerId = data.winnerId;
        isGameOver = true;

        // Trigger explosion
        const color = winnerId === 1 ? '#667eea' : '#764ba2';
        createExplosion(canvas.width / 2, canvas.height / 2, color);

        // Start animation loop
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        renderGameOver();

        // Reset UI after delay
        setTimeout(() => {
            isGameOver = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            canvasContainer.classList.add('hidden');
            lobbyInfo.classList.remove('hidden');
            startBtn.classList.remove('hidden');
            startBtn.disabled = false;
            startBtn.textContent = "START GAME";
            gameState = null;
            particles = [];

            // Reset scores visualization
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 5000);
    }
}

function updatePlayerStatus(playerId, connected) {
    playersConnected[playerId] = connected;

    const card = document.getElementById(`p${playerId}Card`);
    const status = document.getElementById(`p${playerId}Status`);

    if (card && status) {
        if (connected) {
            card.classList.add('connected');
            status.textContent = 'Ready!';
        } else {
            card.classList.remove('connected');
            status.textContent = 'Waiting...';
        }
    }

    // Enable start button if both are connected
    let allConnected = true;
    for (let i = 1; i <= totalPlayers; i++) {
        if (!playersConnected[i]) {
            allConnected = false;
            break;
        }
    }

    if (allConnected) {
        startBtn.disabled = false;
        startBtn.textContent = "START GAME";
    } else {
        startBtn.disabled = true;
        startBtn.textContent = "Waiting for Players...";
    }
}

function startGame() {
    if (ws) {
        ws.send(JSON.stringify({ type: 'start_game' }));
    }
}

function drawGame() {
    if (!gameState) return;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Net
    ctx.strokeStyle = '#333';
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Paddles
    // P1 (Left)
    ctx.fillStyle = '#667eea';
    if (gameState.players_position && gameState.players_position[0]) {
        ctx.fillRect(gameState.players_position[0].x, gameState.players_position[0].y, 10, 50);
    }

    // P2 (Right)
    ctx.fillStyle = '#764ba2';
    if (gameState.players_position && gameState.players_position[1]) {
        ctx.fillRect(gameState.players_position[1].x - 10, gameState.players_position[1].y, 10, 50);
    }

    // P3 (Top) - Horizontal
    ctx.fillStyle = '#4caf50';
    if (gameState.players_position && gameState.players_position[2]) {
        // Assuming x/y is top-left. Horizontal paddle 50x10
        ctx.fillRect(gameState.players_position[2].x, gameState.players_position[2].y, 50, 10);
    }

    // P4 (Bottom) - Horizontal
    ctx.fillStyle = '#ff9800';
    if (gameState.players_position && gameState.players_position[3]) {
        // Assuming x/y is top-left. Horizontal paddle 50x10
        ctx.fillRect(gameState.players_position[3].x, gameState.players_position[3].y - 10, 50, 10);
    }

    // Ball
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(gameState.ball_position.x, gameState.ball_position.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect for ball
    ctx.shadowBlur = 10;
    ctx.shadowColor = "white";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Scores
    if (gameState.score) {
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";

        // 2 Players: Standard Left/Right
        if (gameState.score.length === 2) {
            ctx.fillStyle = "rgba(102, 126, 234, 0.5)"; // P1 Blue
            ctx.fillText(gameState.score[0], canvas.width / 4, 60);

            ctx.fillStyle = "rgba(118, 75, 162, 0.5)"; // P2 Purple
            ctx.fillText(gameState.score[1], (canvas.width / 4) * 3, 60);
        }
        // 3 or 4 Players: Corners/Edges
        else {
            ctx.font = "bold 32px sans-serif";

            // P1 (Left - Blue)
            ctx.fillStyle = "rgba(102, 126, 234, 0.7)";
            ctx.fillText(gameState.score[0], 40, canvas.height / 2);

            // P2 (Right - Purple)
            ctx.fillStyle = "rgba(118, 75, 162, 0.7)";
            ctx.fillText(gameState.score[1], canvas.width - 40, canvas.height / 2);

            // P3 (Top - Green)
            if (gameState.score.length >= 3) {
                ctx.fillStyle = "rgba(76, 175, 80, 0.7)";
                ctx.fillText(gameState.score[2], canvas.width / 2, 40);
            }

            // P4 (Bottom - Orange)
            if (gameState.score.length >= 4) {
                ctx.fillStyle = "rgba(255, 152, 0, 0.7)";
                ctx.fillText(gameState.score[3], canvas.width / 2, canvas.height - 20);
            }
        }
    }
}