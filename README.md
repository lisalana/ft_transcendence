# ft_transcendence 🏓

Projet de jeu Pong multijoueur en temps réel.

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

## 🌐 Accès

- **Frontend**: https://localhost
- **Backend API**: https://localhost/api/health

⚠️ **Note**: Certificat SSL auto-signé, accepter l'avertissement du navigateur.

## 📁 Structure
```
ft_transcendence/
├── frontend/        # Application web (TypeScript + Vite)
├── backend/         # API REST (Fastify + Node.js)
├── nginx/           # Reverse proxy + SSL
└── docker-compose.yml
```

## 🛠️ Commandes disponibles

- `make` ou `make all` - Build et start
- `make build` - Build les containers
- `make up` - Start les containers
- `make down` - Stop les containers
- `make logs` - Voir les logs en temps réel
- `make clean` - Stop et supprimer les volumes
- `make fclean` - Nettoyage complet
- `make re` - Rebuild complet
- `make status` - État des containers

## 👥 Équipe

- [L     ]
- [R     ]
- [H     ]
