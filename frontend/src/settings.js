// Settings View - GDPR Compliance
const Settings = {
    render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view settings-view">
                <header>
                    <button class="back-btn" onclick="Router.navigate('home')">
                        ← Retour
                    </button>
                    <h1>⚙️ Paramètres du compte</h1>
                </header>

                <div class="settings-container">
                    <section class="gdpr-section">
                        <h2>🔒 Confidentialité et données (RGPD)</h2>
                        
                        <!-- Export des données -->
                        <div class="setting-card">
                            <div class="setting-info">
                                <h3>📥 Exporter mes données</h3>
                                <p>Téléchargez toutes vos données personnelles au format JSON.</p>
                            </div>
                            <button id="export-data-btn" class="btn btn-primary">
                                Télécharger
                            </button>
                        </div>

                        <!-- Anonymisation -->
                        <div class="setting-card warning">
                            <div class="setting-info">
                                <h3>🎭 Anonymiser mon compte</h3>
                                <p>Supprime vos informations personnelles mais conserve vos statistiques. Cette action est irréversible.</p>
                            </div>
                            <button id="anonymize-btn" class="btn btn-warning">
                                Anonymiser
                            </button>
                        </div>

                       <!-- Suppression -->
                        <div class="setting-card danger">
                            <div class="setting-info">
                                <h3>🗑️ Supprimer mes données et mon compte</h3>
                                <p>Supprime définitivement votre compte et TOUTES vos données. Cette action est irréversible.</p>
                            </div>
                            <button id="delete-account-btn" class="btn btn-danger">
                                Supprimer mes données et mon compte
                            </button>
                        </div>
                    </section>

                    <section class="data-info">
                        <h2>ℹ️ Stockage des données</h2>
                        <ul>
                            <li>✅ Vos données sont stockées localement sur notre serveur</li>
                            <li>✅ Aucune donnée n'est partagée avec des tiers</li>
                            <li>✅ Conformité RGPD (Règlement Général sur la Protection des Données)</li>
                            <li>✅ Vous gardez le contrôle total de vos données</li>
                        </ul>
                    </section>
                </div>
            </div>
        `;

        // ⚠️ IMPORTANT : Attacher les event listeners APRÈS le rendu
        setTimeout(() => this.initEventListeners(), 0);
    },

    initEventListeners() {
        console.log('🔧 Initializing event listeners...');
        
        // 📥 Export des données
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            console.log('✅ Export button found');
            exportBtn.addEventListener('click', async () => {
                console.log('🖱️ Export button clicked');
                try {
                    const response = await fetch('/api/users/me/export', {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `mes_donnees_${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        alert('✅ Données exportées avec succès !');
                    } else {
                        const data = await response.json();
                        alert('❌ ' + (data.error || 'Erreur lors de l\'export'));
                    }
                } catch (error) {
                    console.error('Erreur export:', error);
                    alert('❌ Erreur lors de l\'export');
                }
            });
        } else {
            console.error('❌ Export button not found');
        }

        // 🎭 Anonymisation
        const anonymizeBtn = document.getElementById('anonymize-btn');
if (anonymizeBtn) {
    console.log('✅ Anonymize button found');
    anonymizeBtn.addEventListener('click', async () => {
        console.log('🖱️ Anonymize button clicked');
        
        try {
            // Lancement anonymisation
            const response = await fetch('/api/users/me/anonymize', {
                method: 'POST',
                credentials: 'include'
            });
            
            console.log('📡 Réponse reçue:', response.status);
            const data = await response.json();
            console.log('📦 Data:', data);
            
            if (data.success) {
                console.log('✅ Anonymisation réussie, export des données anonymisées...');
                
                // Export automatique des données anonymisées AVANT déconnexion
                try {
                    const verifyResponse = await fetch('/api/users/me/export', {
                        credentials: 'include'
                    });
                    
                    if (verifyResponse.ok) {
                        const blob = await verifyResponse.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `donnees_anonymisees_${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        console.log('✅ Export des données anonymisées effectué');
                    }
                } catch (error) {
                    console.error('Erreur export vérification:', error);
                }
                
                // Attendre 1.5s pour que le téléchargement se lance, puis déconnecter
                setTimeout(() => {
                    console.log('🚪 Déconnexion...');
                    window.location.href = '/';
                }, 1500);
                
            } else {
                alert('❌ Erreur: ' + (data.error || 'Erreur lors de l\'anonymisation'));
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur lors de l\'anonymisation');
        }
    });
} else {
    console.error('❌ Anonymize button not found');
}

        // 🗑️ Suppression
        const deleteBtn = document.getElementById('delete-account-btn');
        if (deleteBtn) {
            console.log('✅ Delete button found');
            deleteBtn.addEventListener('click', async () => {
                console.log('🖱️ Delete button clicked');
                
                const confirmed1 = confirm(
                    '⚠️ DANGER : Voulez-vous vraiment supprimer DÉFINITIVEMENT votre compte ?\n\n' +
                    '• Toutes vos données seront EFFACÉES\n' +
                    '• Toutes vos statistiques seront PERDUES\n' +
                    '• Cette action est IRRÉVERSIBLE\n\n' +
                    'Continuer ?'
                );
                
                if (!confirmed1) return;
                
                const confirmed2 = confirm(
                    '⚠️ DERNIÈRE CONFIRMATION :\n\n' +
                    'Êtes-vous ABSOLUMENT SÛR de vouloir supprimer votre compte ?\n\n' +
                    'Cliquez sur OK pour confirmer.'
                );
                
                if (!confirmed2) return;
                
                try {
                    const response = await fetch('/api/users/me', {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert('✅ Compte supprimé avec succès.\nAu revoir !');
                        window.location.href = '/';
                    } else {
                        alert('❌ ' + (data.error || 'Erreur lors de la suppression'));
                    }
                } catch (error) {
                    console.error('Erreur suppression:', error);
                    alert('❌ Erreur lors de la suppression');
                }
            });
        } else {
            console.error('❌ Delete button not found');
        }
        
        console.log('✅ Event listeners initialized');
    }
};