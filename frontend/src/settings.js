// Settings View - Account Management
const Settings = {
    render() {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="view settings-view">
                <button class="back-btn" onclick="Router.navigate('home')" data-i18n="settingsPage.backBtn">← Back to Home</button>
                
                <div class="settings-header">
                    <h2 data-i18n="settingsPage.title">⚙️ Account Settings</h2>
                    <p data-i18n="settingsPage.subtitle">Manage your personal data and privacy</p>
                </div>

                <div class="settings-container">
                    <!-- Export Data -->
                    <div class="setting-card">
                        <div class="setting-icon">📥</div>
                        <div class="setting-content">
                            <h3 data-i18n="settingsPage.downloadTitle">Download My Data</h3>
                            <p data-i18n="settingsPage.downloadDesc">Get a copy of all your personal information</p>
                        </div>
                        <button id="export-data-btn" class="setting-btn" data-i18n="settingsPage.downloadBtn">Download</button>
                    </div>

                    <!-- Delete Account -->
                    <div class="setting-card danger">
                        <div class="setting-icon">🗑️</div>
                        <div class="setting-content">
                            <h3 data-i18n="settingsPage.deleteTitle">Delete Account</h3>
                            <p data-i18n="settingsPage.deleteDesc">Permanently delete your account and all data</p>
                        </div>
                        <button id="delete-account-btn" class="setting-btn danger" data-i18n="settingsPage.deleteBtn">Delete</button>
                    </div>

                    <!-- Privacy Info -->
                    <div class="privacy-info">
                        <h3 data-i18n="settingsPage.privacyTitle">🔒 Your Privacy</h3>
                        <ul>
                            <li data-i18n="settingsPage.privacyItem1">Your data is stored securely on our servers</li>
                            <li data-i18n="settingsPage.privacyItem2">We never share your data with third parties</li>
                            <li data-i18n="settingsPage.privacyItem3">You can download or delete your data anytime</li>
                            <li data-i18n="settingsPage.privacyItem4">Full GDPR compliance</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;

        updatePageTranslations();
        this.initEventListeners();
    },

    initEventListeners() {
        // Export button
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', async () => {
                exportBtn.disabled = true;
                exportBtn.textContent = t('settingsPage.downloadProgress');
                
                try {
                    const response = await fetch('https://localhost:8443/api/users/me/export', {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `my_data_${Date.now()}.json`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        alert(t('settingsPage.downloadSuccess'));
                    } else {
                        alert(t('settingsPage.downloadError'));
                    }
                } catch (error) {
                    console.error('Export error:', error);
                    alert(t('settingsPage.downloadError'));
                } finally {
                    exportBtn.disabled = false;
                    exportBtn.textContent = t('settingsPage.downloadBtn');
                }
            });
        }

        // Delete button
        const deleteBtn = document.getElementById('delete-account-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', async () => {
                const confirmed = confirm(t('settingsPage.deleteConfirm'));
                
                if (!confirmed) return;
                
                try {
                    const response = await fetch('https://localhost:8443/api/users/me', {
                        method: 'DELETE',
                        credentials: 'include'
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        alert(t('settingsPage.deleteSuccess'));
                        window.location.href = 'https://localhost:8443/api/auth/logout';
                    } else {
                        alert(t('settingsPage.deleteError'));
                    }
                } catch (error) {
                    console.error('Delete error:', error);
                    alert(t('settingsPage.deleteError'));
                }
            });
        }
    }
};