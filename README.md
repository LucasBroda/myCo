# MyCo - Pokémon TCG Collection Manager

Application fullstack de gestion de collection de cartes Pokémon TCG.

## 🏗️ Structure du projet

```
myCo/
├── backend/          # API Node.js + Express + PostgreSQL
├── client/           # Interface React + TypeScript + Vite
└── README.md         # Ce fichier
```

## 🚀 Démarrage rapide

### 1️⃣ Prérequis

- **Node.js** v18+
- **PostgreSQL** v12+
- **npm** ou **yarn**

### 2️⃣ Configuration PostgreSQL

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base et l'utilisateur
CREATE DATABASE myco;
CREATE USER lucasb WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE myco TO lucasb;
\q
```

### 3️⃣ Backend

```bash
cd backend
npm install
# Configurer le fichier .env (voir backend/.env.example ou client/README.md)
npm run migrate      # Créer les tables
npm run dev          # Démarrer le serveur (port 5000)
```

### 4️⃣ Client

```bash
cd client
npm install
npm run start        # Démarrer l'interface (port 3000)
```

### 5️⃣ Créer un compte

- Ouvrir `http://localhost:3000/register`
- Renseigner email + mot de passe (8 caractères min)

---

## 📖 Documentation complète

👉 **Consultez le [README détaillé](client/README.md)** pour :
- Configuration PostgreSQL détaillée
- Variables d'environnement
- Génération des secrets JWT
- Scripts disponibles
- Dépannage

---

## 🛠️ Technologies

**Backend :** Node.js, Express, TypeScript, PostgreSQL, Redis, JWT  
**Frontend :** React 19, TypeScript, Vite, Styled Components, Zustand

---

## 📝 Scripts utiles

**Backend :**
```bash
npm run dev        # Développement
npm run migrate    # Migrations DB
npm run build      # Build production
```

**Client :**
```bash
npm run start      # Développement
npm run build      # Build production
npm run lint       # Vérification code
```

---

## ⚠️ Problèmes courants

| Erreur | Solution |
|--------|----------|
| `password authentication failed` | Vérifier `DATABASE_URL` dans `backend/.env` |
| `relation "users" does not exist` | Exécuter `npm run migrate` dans `backend/` |
| `ESLint Invalid Options` | Désactivé dans Vite, utiliser `npm run lint` |

---

📧 **Contact :** Projet académique ISEN
