// Game View
const Game = {
    render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view">
                <button class="back-btn" onclick="Router.navigate('home')">← Back to Home</button>
                
                <div class="game-header">
                    <h2 data-i18n="game.title">${t('game.title')}</h2>
                </div>

                <!-- Start Screen - Mode Selection -->
                <div id="startScreen">
                    <p style="text-align: center; margin-bottom: 30px; font-size: 1.2rem;" data-i18n="game.selectPlayers">${t('game.selectPlayers')}</p>
                    <div class="mode-selection">
                        <div class="mode-btn" onclick="selectMode('2players')">
                            <div class="mode-number">2</div>
                            <div class="mode-label" data-i18n="game.players2">${t('game.players2')}</div>
                        </div>
                        <div class="mode-btn" onclick="selectMode('3players')">
                            <div class="mode-number">3</div>
                            <div class="mode-label" data-i18n="game.players3">${t('game.players3')}</div>
                        </div>
                        <div class="mode-btn" onclick="selectMode('4players')">
                            <div class="mode-number">4</div>
                            <div class="mode-label" data-i18n="game.players4">${t('game.players4')}</div>
                        </div>
                    </div>
                </div>

                <!-- Settings Screen -->
                <div id="settingsScreen" class="hidden">
                    <div class="lobby-section">
                        <h3 style="text-align: center; font-size: 2rem; margin-bottom: 30px; background: linear-gradient(135deg, var(--primary), var(--accent)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;" data-i18n="game.settings.title">${t('game.settings.title')}</h3>
                        
                        <div class="settings-grid">
                            <!-- Paddle Size -->
                            <div class="setting-item">
                                <label class="setting-label" data-i18n="game.settings.paddleSize">
                                    🏓 ${t('game.settings.paddleSize')}
                                </label>
                                <div class="slider-container">
                                    <input type="range" id="paddleSize" min="50" max="150" value="80" step="10" class="slider">
                                    <span class="slider-value" id="paddleSizeValue">80</span>
                                </div>
                                <div class="setting-hint" data-i18n="game.settings.paddleSizeHint">${t('game.settings.paddleSizeHint')}</div>
                            </div>

                            <!-- Ball Speed -->
                            <div class="setting-item">
                                <label class="setting-label" data-i18n="game.settings.ballSpeed">
                                    ⚡ ${t('game.settings.ballSpeed')}
                                </label>
                                <div class="slider-container">
                                    <input type="range" id="ballSpeed" min="1" max="5" value="3" step="1" class="slider">
                                    <span class="slider-value" id="ballSpeedValue">Normal</span>
                                </div>
                                <div class="setting-hint" data-i18n="game.settings.ballSpeedHint">${t('game.settings.ballSpeedHint')}</div>
                            </div>

                            <!-- Win Score -->
                            <div class="setting-item">
                                <label class="setting-label" data-i18n="game.settings.winScore">
                                    🎯 ${t('game.settings.winScore')}
                                </label>
                                <div class="slider-container">
                                    <input type="range" id="winScore" min="3" max="21" value="11" step="1" class="slider">
                                    <span class="slider-value" id="winScoreValue">11</span>
                                </div>
                                <div class="setting-hint" data-i18n="game.settings.winScoreHint">${t('game.settings.winScoreHint')}</div>
                            </div>
                        </div>

                        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 40px;">
                            <button class="back-btn" onclick="backToModeSelection()">← Back</button>
                            <button id="createGameBtn" class="start-game-btn" data-i18n="game.settings.createGame">${t('game.settings.createGame')}</button>
                        </div>
                    </div>
                </div>

                <!-- Lobby / Game Screen -->
                <div id="gameScreen" class="hidden">
                    <div class="lobby-section">
                        <!-- Canvas (Hidden initially) -->
                        <div id="canvasContainer" class="canvas-container hidden">
                            <canvas id="gameCanvas" width="800" height="400"></canvas>
                            
                            <!-- Pause Menu -->
                            <div id="pauseMenu" class="pause-menu hidden">
                                <div class="pause-content">
                                    <h2 class="pause-title" data-i18n="game.pause.title">⏸️ ${t('game.pause.title')}</h2>
                                    <p class="pause-hint" data-i18n="game.pause.hint">${t('game.pause.hint')}</p>
                                    
                                    <div class="pause-buttons">
                                        <button class="pause-btn resume-btn" onclick="togglePause()" data-i18n="game.pause.resume">
                                            ▶️ ${t('game.pause.resume')}
                                        </button>
                                        <button class="pause-btn settings-btn" onclick="showPauseSettings()" data-i18n="game.pause.settings">
                                            ⚙️ ${t('game.pause.settings')}
                                        </button>
                                        <button class="pause-btn home-btn" onclick="Router.navigate('home')" data-i18n="game.pause.home">
                                            🏠 ${t('game.pause.home')}
                                        </button>
                                    </div>
                                </div>
                                
                                <!-- Settings overlay in pause menu -->
                                <div id="pauseSettingsOverlay" class="hidden" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); display: flex; justify-content: center; align-items: center;">
                                    <div style="max-width: 500px; width: 90%; padding: 30px; background: rgba(30, 30, 50, 0.9); border-radius: 20px; border: 2px solid rgba(102, 126, 234, 0.3);">
                                        <h2 style="color: #667eea; margin-bottom: 20px; text-align: center;" data-i18n="game.pause.settingsTitle">⚙️ ${t('game.pause.settingsTitle')}</h2>
                                        <p style="color: rgba(255,255,255,0.6); text-align: center; margin-bottom: 30px; font-size: 0.9rem;" data-i18n="game.pause.settingsHint">${t('game.pause.settingsHint')}</p>
                                        
                                        <div class="setting-item">
                                            <label class="setting-label">🏓 ${t('game.settings.paddleSize')}</label>
                                            <div class="slider-container">
                                                <input type="range" id="pausePaddleSize" min="30" max="100" value="50" step="10" class="slider">
                                                <span class="slider-value" id="pausePaddleSizeValue">50</span>
                                            </div>
                                        </div>
                                        
                                        <div class="setting-item">
                                            <label class="setting-label">⚡ ${t('game.settings.ballSpeed')}</label>
                                            <div class="slider-container">
                                                <input type="range" id="pauseBallSpeed" min="1" max="5" value="3" class="slider">
                                                <span class="slider-value" id="pauseBallSpeedValue">Normal</span>
                                            </div>
                                        </div>
                                        
                                        <div class="setting-item">
                                            <label class="setting-label">🎯 ${t('game.settings.winScore')}</label>
                                            <div class="slider-container">
                                                <input type="range" id="pauseWinScore" min="3" max="21" value="11" class="slider">
                                                <span class="slider-value" id="pauseWinScoreValue">11</span>
                                            </div>
                                        </div>
                                        
                                        <div style="display: flex; gap: 15px; margin-top: 30px;">
                                            <button class="pause-btn" onclick="applyPauseSettings()" style="flex: 1; background: linear-gradient(135deg, #667eea, #764ba2);" data-i18n="game.pause.apply">
                                                ✅ ${t('game.pause.apply')}
                                            </button>
                                            <button class="pause-btn" onclick="closePauseSettings()" style="flex: 1;" data-i18n="game.pause.cancel">
                                                ❌ ${t('game.pause.cancel')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Pause Overlay (disconnect) -->
                            <div id="pauseOverlay" class="hidden">
                                <div class="pause-message" data-i18n="game.paused">${t('game.paused')}</div>
                                <div class="pause-subtext" data-i18n="game.pausedSub">${t('game.pausedSub')}</div>
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

        // Initialize game elements after DOM is ready
        if (typeof initGameElements === 'function') {
            initGameElements();
        }

        // Initialize settings sliders
        if (typeof initSettingsSliders === 'function') {
            initSettingsSliders();
        }
    }
};