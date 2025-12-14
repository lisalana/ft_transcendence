// Game View
const Game = {
    render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view">
                <button class="back-btn" onclick="Router.navigate('home')">← Back to Home</button>
                
                <div class="game-header">
                    <h2>Pong Master</h2>
                    <p class="game-subtitle">Host a game on your screen and use your phones as controllers</p>
                </div>

                <!-- Start Screen -->
                <div id="startScreen">
                    <div class="mode-selection">
                        <div class="mode-btn" onclick="createGame('2players')">
                            <div class="mode-number">2</div>
                            <div class="mode-label">Players</div>
                        </div>
                        <div class="mode-btn" onclick="createGame('3players')">
                            <div class="mode-number">3</div>
                            <div class="mode-label">Players</div>
                        </div>
                        <div class="mode-btn" onclick="createGame('4players')">
                            <div class="mode-number">4</div>
                            <div class="mode-label">Players</div>
                        </div>
                    </div>
                </div>

                <!-- Lobby / Game Screen -->
                <div id="gameScreen" class="hidden">
                    <div class="lobby-section">
                        <!-- Canvas (Hidden initially) -->
                        <div id="canvasContainer" class="canvas-container hidden">
                            <canvas id="gameCanvas" width="800" height="400"></canvas>
                            <!-- Pause Overlay -->
                            <div id="pauseOverlay" class="hidden">
                                <div class="pause-message">GAME PAUSED</div>
                                <div class="pause-subtext">Waiting for player to reconnect...</div>
                            </div>
                        </div>

                        <!-- Lobby Info / Player Cards -->
                        <div class="lobby-info" id="lobbyInfo">
                            <!-- Cards will be generated dynamically by main.js -->
                        </div>

                        <div style="text-align: center;">
                            <button id="startBtn" disabled>Waiting for Players...</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize game elements after rendering
        if (typeof initGameElements === 'function') {
            initGameElements();
        }
    }
};