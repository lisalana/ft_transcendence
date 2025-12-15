// Header component
const Header = {
    render() {
        const headerHTML = `
            <!-- Skip link pour accessibilité -->
            <a href="#app" class="skip-link">Skip to main content</a>
            
            <!-- Header avec langue et accessibilité + Classes Tailwind -->
            <header class="site-header fixed top-0 left-0 right-0 z-50">
                <div class="header-content flex justify-between items-center">
                    <div class="header-left">
                        <h1 class="site-logo text-2xl font-bold">FT_TRANSCENDENCE</h1>
                    </div>
                    
                    <div class="header-right flex gap-3 items-center">
                        <!-- Sélecteur de langue -->
                        <div class="language-selector relative">
                            <button id="langBtn" class="header-btn px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all" aria-label="Select language">
                                <span id="currentLang">🇬🇧 EN</span>
                            </button>
                            <div id="langMenu" class="dropdown-menu hidden absolute top-full right-0 mt-2 bg-slate-800 rounded-lg shadow-xl">
                                <button onclick="setLanguage('en')" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                    <span class="flag">🇬🇧</span> English
                                </button>
                                <button onclick="setLanguage('fr')" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                    <span class="flag">🇫🇷</span> Français
                                </button>
                                <button onclick="setLanguage('es')" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                    <span class="flag">🇪🇸</span> Español
                                </button>
                            </div>
                        </div>
                        
                        <!-- Bouton accessibilité -->
                        <button id="a11yBtn" class="header-btn px-4 py-2 rounded-lg hover:bg-opacity-80 transition-all text-xl" aria-label="Accessibility options">
                            ♿
                        </button>
                        <div id="a11yMenu" class="dropdown-menu hidden absolute top-full right-0 mt-2 bg-slate-800 rounded-lg shadow-xl">
                            <button onclick="toggleHighContrast()" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                <span>🎨</span> <span data-i18n="nav.highContrast">High Contrast</span>
                            </button>
                            <button onclick="increaseFontSize()" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                <span>🔍+</span> <span>Increase Text Size</span>
                            </button>
                            <button onclick="decreaseFontSize()" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                <span>🔍-</span> <span>Decrease Text Size</span>
                            </button>
                            <button onclick="resetFontSize()" class="dropdown-item flex items-center gap-2 px-4 py-2 hover:bg-slate-700 transition-colors">
                                <span>↺</span> <span>Reset Text Size</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
        `;
        
        // Injecter le header au debut du body
        document.body.insertAdjacentHTML('afterbegin', headerHTML);
        
        // Initialiser les events
        this.initEvents();
    },
    
    initEvents() {
        // Toggle language menu
        const langBtn = document.getElementById('langBtn');
        const langMenu = document.getElementById('langMenu');
        
        if (langBtn) {
            langBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                langMenu.classList.toggle('hidden');
                document.getElementById('a11yMenu')?.classList.add('hidden');
            });
        }
        
        // Toggle accessibility menu
        const a11yBtn = document.getElementById('a11yBtn');
        const a11yMenu = document.getElementById('a11yMenu');
        
        if (a11yBtn) {
            a11yBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleAccessibilityMenu();
            });
        }
        
        // Fermer les menus en cliquant ailleurs
        document.addEventListener('click', () => {
            langMenu?.classList.add('hidden');
            a11yMenu?.classList.add('hidden');
        });
        
        // Mettre a jour le drapeau actuel
        this.updateCurrentLanguage();
    },
    
    updateCurrentLanguage() {
        const currentLang = document.getElementById('currentLang');
        if (currentLang) {
            const flags = {
                'en': '🇬🇧 EN',
                'fr': '🇫🇷 FR',
                'es': '🇪🇸 ES'
            };
            currentLang.textContent = flags[currentLanguage] || '🇬🇧 EN';
        }
    }
};

// ===== FONCTIONS D'ACCESSIBILITE =====
let fontSizeMultiplier = 1.0;

// Toggle accessibility menu
function toggleAccessibilityMenu() {
    const a11yMenu = document.getElementById('a11yMenu');
    const langMenu = document.getElementById('langMenu');
    
    if (a11yMenu) {
        a11yMenu.classList.toggle('hidden');
        langMenu?.classList.add('hidden');
    }
}

// Toggle high contrast mode
function toggleHighContrast() {
    document.body.classList.toggle('high-contrast');
    const isHighContrast = document.body.classList.contains('high-contrast');
    localStorage.setItem('highContrast', isHighContrast);
    
    // Fermer le menu
    document.getElementById('a11yMenu')?.classList.add('hidden');
}

// Increase font size
function increaseFontSize() {
    if (fontSizeMultiplier < 1.5) {
        fontSizeMultiplier += 0.1;
        applyFontSize();
        localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
    }
    document.getElementById('a11yMenu')?.classList.add('hidden');
}

// Decrease font size
function decreaseFontSize() {
    if (fontSizeMultiplier > 0.8) {
        fontSizeMultiplier -= 0.1;
        applyFontSize();
        localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
    }
    document.getElementById('a11yMenu')?.classList.add('hidden');
}

// Reset font size
function resetFontSize() {
    fontSizeMultiplier = 1.0;
    applyFontSize();
    localStorage.setItem('fontSizeMultiplier', fontSizeMultiplier);
    document.getElementById('a11yMenu')?.classList.add('hidden');
}

// Apply font size
function applyFontSize() {
    document.documentElement.style.fontSize = (16 * fontSizeMultiplier) + 'px';
}

// Charger les preferences d'accessibilite au démarrage
function loadAccessibilityPreferences() {
    // High contrast
    const highContrast = localStorage.getItem('highContrast') === 'true';
    if (highContrast) {
        document.body.classList.add('high-contrast');
    }
    
    // Font size
    const savedFontSize = localStorage.getItem('fontSizeMultiplier');
    if (savedFontSize) {
        fontSizeMultiplier = parseFloat(savedFontSize);
        applyFontSize();
    }
}

// Charger automatiquement
loadAccessibilityPreferences();