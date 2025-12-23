# ft_transcendence 🏓

Projet de jeu Pong multijoueur en temps réel avec authentification OAuth, contrôleurs mobiles et système de classement.

## ✨ Fonctionnalités

### 🎮 Jeu
- **Modes multijoueurs** : 2, 3 ou 4 joueurs
- **Contrôleurs mobiles** : Scannez le QR code pour jouer avec votre téléphone
- **Paramètres personnalisables** :
  - Taille des raquettes (petite / moyenne / grande)
  - Vitesse de balle (très lent à très rapide)
  - Score de victoire (3 à 21 points)
- **Menu pause** : Modifiez les paramètres en cours de partie (ESC)
- **Animations** : Effets visuels et particules lors des victoires

### 🔐 Authentification OAuth 2.0
- **Connexion avec Google** : Authentification sécurisée
- **Connexion avec GitHub** : Alternative OAuth
- **Session persistante** : Cookies sécurisés avec gestion automatique
- **Avatar & profil** : Affichage du nom et avatar dans le header

### 🏆 Leaderboard
- **Classement en temps réel** : Top joueurs avec médailles 🥇🥈🥉
- **Statistiques détaillées** :
  - Nombre de victoires / défaites
  - Total de parties jouées
  - Taux de victoire avec barre de progression
- **Scores liés aux comptes** : Les scores sont enregistrés avec les vrais usernames OAuth

### 🌍 Multi-langues
- **3 langues supportées** : Français, Anglais, Espagnol
- **Traduction complète** : Interface, jeu, leaderboard
- **Changement dynamique** : Sans rechargement de page

### ♿ Accessibilité
- **Mode contraste élevé** : Pour une meilleure visibilité
- **Taille de texte ajustable** : Augmenter / Diminuer / Réinitialiser
- **Navigation clavier** : Support complet (Tab, ESC, touches fléchées)
- **Labels ARIA** : Compatibilité avec les lecteurs d'écran
- **Skip link** : Accès rapide au contenu principal

### 🎨 Design
- **Thème spatial** : Arrière-plan animé avec étoiles et nébuleuses
- **Responsive** : Compatible mobile, tablette, desktop
- **Animations fluides** : Transitions et effets visuels
- **Interface moderne** : Design épuré avec Tailwind CSS

---

## 🚀 Démarrage rapide
```bash
# Construire et lancer
make

# Voir les logs
make logs

# Arrêter
make down

# Nettoyer tout
make fclean
```

---

## 🌐 Accès

- **Frontend** : https://localhost:8443
- **Backend API** : https://localhost:8443/api/health
- **Leaderboard API** : https://localhost:8443/api/leaderboard

⚠️ **Note** : Certificat SSL auto-signé, accepter l'avertissement du navigateur.

---

## 🔧 Configuration OAuth

### Google OAuth
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet OAuth
3. Configurez les URIs autorisées :
   - **Authorized JavaScript origins** : `https://localhost:8443`
   - **Authorized redirect URIs** : `https://localhost:8443/api/auth/google/callback`
4. Copiez `Client ID` et `Client Secret`
5. Créez `backend/.env` :
```env
PORT=4000
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_client_secret_here
GOOGLE_OAUTH_REDIRECT_URI=https://localhost:8443/api/auth/google/callback
COOKIE_SECRET=generate_random_secret_here
FRONTEND_URL=https://localhost:8443
```

### GitHub OAuth
1. Allez sur [GitHub Developer Settings](https://github.com/settings/developers)
2. Créez une nouvelle OAuth App
3. Configurez :
   - **Homepage URL** : `https://localhost:8443`
   - **Authorization callback URL** : `https://localhost:8443/api/auth/github/callback`
4. Ajoutez à `backend/.env` :
```env
GITHUB_OAUTH_CLIENT_ID=your_github_client_id
GITHUB_OAUTH_CLIENT_SECRET=your_github_client_secret
GITHUB_OAUTH_REDIRECT_URI=https://localhost:8443/api/auth/github/callback
```

---


## 🛠️ Commandes disponibles
```bash
make              # Build et start
make build        # Build les containers
make up           # Start les containers
make down         # Stop les containers
make logs         # Voir les logs en temps réel
make clean        # Stop et supprimer les volumes
make fclean       # Nettoyage complet
make re           # Rebuild complet
make status       # État des containers
```

---

## 🏆 Modules 42 

1. ✅ **Multi Langues** (FR/EN/ES) - 5 pts
2. ✅ **Accessibilité** (Contraste, Taille texte, Navigation clavier, ARIA) - 5 pts
3. ✅ **Game Customization** (Paddle, Vitesse, Score) - 5 pts
4. ✅ **Frontend Framework** (Vanilla JS modulaire + SPA Router) - 5 pts
5. ✅ **Multi Navigateurs** (Chrome, Firefox, Safari) - 5 pts
6. ✅ **Leaderboard** (Système de classement avec stats) - 5 pts
7. ✅ **User Management OAuth** (Google + GitHub) - 10 pts

---


## 📝 Prérequis

- Docker & Docker Compose
- Make
- Git
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

---

## 🎮 Comment jouer

1. **Connectez-vous** avec Google ou GitHub
2. **Créez une partie** :
   - Choisissez le nombre de joueurs (2, 3 ou 4)
   - Personnalisez les paramètres (paddle, vitesse, score)
3. **Scannez les QR codes** avec vos téléphones pour les utiliser comme contrôleurs
4. **Jouez !** Appuyez sur "START GAME" quand tous les joueurs sont connectés
5. **Consultez le leaderboard** pour voir votre classement

---

## 🌍 Multi-navigateurs

- ✅ Chrome / Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge

---

## 🐛 Dépannage

### Le site ne charge pas
```bash
# Vérifier que tous les containers sont actifs
make status

# Redémarrer 
make down
make up
```
