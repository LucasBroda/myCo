# MyCo - Pokémon TCG Collection Manager

Application fullstack de gestion de collection de cartes Pokémon TCG.

## Lien vers le site hébergé sur Netlify (front), Render (back), Supabase (bdd)
Lien du site : https://mycopokemon.netlify.app/

## 🏗️ Structure du projet

```
myCo/
├── backend/          # API Node.js + Express + PostgreSQL
├── client/           # Interface React + TypeScript + Vite
└── README.md         # Ce fichier
```

## 🚀 Démarrage rapide

### 1️⃣ Prérequis

- **Node.js** v22.16=+
- **PostgreSQL** v14.22=+
- **npm** ou **yarn**

### 2️⃣ Configuration PostgreSQL

```bash
# Permet de se connecter à la base de données PostgreSQL
sudo -u postgres psql

# Permet de créer la base et l'utilisateur correspondant, pensez bien sûr à remplacer my_user par votre nom d'utilisateur et votre mot de passe par un mot de passe sécurisé
CREATE DATABASE myco;
CREATE USER my_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE myco TO my_user;
\q
```

### 3️⃣ Backend

## Configurer les variables d'environnement

Créez/modifiez le fichier `.env` à la racine du dossier `backend` :

```bash
# Base de données PostgreSQL (ajustez avec vos identifiants)
DATABASE_URL=postgres://my_user:votre_mot_de_passe@localhost:5432/myco

# Redis (optionnel pour le cache)
REDIS_URL=redis://localhost:6379

# Secrets JWT (NE PAS MODIFIER ces valeurs générées)
ACCESS_TOKEN_SECRET=<généré_automatiquement>
REFRESH_TOKEN_SECRET=<généré_automatiquement>

# API Pokemon TCG (optionnelle)
POKEMON_TCG_API_KEY=votre_cle_api_pokemon_tcg

# APIs tierces (optionnelles)
CARDMARKET_APP_TOKEN=
EBAY_APP_ID=

# Configuration serveur
PORT=5000
NODE_ENV=development
```

**⚠️ Important** :
- Remplacez `votre_mot_de_passe` par le mot de passe PostgreSQL que vous avez défini
- Ne committez **jamais** le fichier `.env` dans Git
- Les secrets `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET` doivent être uniques et longs (64+ caractères -> utiliser cette commande -> openssl rand -base64 64)


```bash
cd backend
npm install
npm run migrate      # Permet de créer les tables de la base de données
npm run dev          # Démarre le serveur back-end(port 5000)
```

### 4️⃣ Client

```bash
cd client
npm install
npm run dev        # Démarre le front de l'application (port 3000)
```

### 5️⃣ Créer un compte

- Ouvrir `http://localhost:3000/register`
- Renseigner email + mot de passe (8 caractères min)


---

## 🛠️ Technologies

**Backend :** Node.js, Express, TypeScript, PostgreSQL, Redis, JWT  
**Frontend :** React 19, TypeScript, Vite, Styled Components, Zustand

---

📧 **Contact :** Projet académique ISEN
