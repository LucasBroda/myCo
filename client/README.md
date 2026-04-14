# MyCo - Pokémon TCG Collection Manager

Application de gestion de collection de cartes Pokémon TCG avec backend Node.js/Express/PostgreSQL et frontend React/TypeScript.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** (v18 ou supérieur) : [https://nodejs.org](https://nodejs.org)
- **PostgreSQL** (v12 ou supérieur)
- **npm** ou **yarn**

### Vérifier les versions installées

```bash
node --version    # v18+
npm --version
psql --version    # PostgreSQL 12+
```

---

## ⚙️ Configuration PostgreSQL

### 1. Créer la base de données et l'utilisateur

Connectez-vous à PostgreSQL avec l'utilisateur `postgres` :

```bash
sudo -u postgres psql
```

Dans le prompt PostgreSQL, exécutez :

```sql
-- Créer la base de données
CREATE DATABASE myco;

-- Créer un utilisateur dédié (changez le mot de passe)
CREATE USER myuser WITH PASSWORD 'votre_mot_de_passe_sécurisé';

-- Donner les droits à l'utilisateur
GRANT ALL PRIVILEGES ON DATABASE myco TO myuser;

-- Quitter
\q
```

### 2. Vérifier la connexion

```bash
psql -U myuser -d myco -c "SELECT version();"
```

Si la commande fonctionne, votre configuration PostgreSQL est prête ✅

---

## 🔧 Installation Backend

### 1. Naviguer dans le dossier backend

```bash
cd backend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez/modifiez le fichier `.env` à la racine du dossier `backend` :

```bash
# Base de données PostgreSQL (ajustez avec vos identifiants)
DATABASE_URL=postgres://myuser:votre_mot_de_passe@localhost:5432/myco

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
- Les secrets `ACCESS_TOKEN_SECRET` et `REFRESH_TOKEN_SECRET` doivent être uniques et longs (64+ caractères)

#### Générer de nouveaux secrets JWT (si nécessaire)

```bash
# Génération de secrets sécurisés
openssl rand -base64 64
```

### 4. Appliquer les migrations

Créer les tables dans la base de données :

```bash
npm run migrate
```

Vous devriez voir :

```
Running migration: 001_users.sql
  ✓ 001_users.sql
Running migration: 002_acquired_cards.sql
  ✓ 002_acquired_cards.sql
Running migration: 003_planned_purchases.sql
  ✓ 003_planned_purchases.sql
All migrations completed.
```

### 5. Lancer le serveur backend

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000` ✅

---

## 🎨 Installation Client (Frontend)

### 1. Naviguer dans le dossier client

Depuis la racine du projet :

```bash
cd client
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur de développement

```bash
npm run start
```

ou

```bash
npm run dev
```

Le client démarre sur `http://localhost:3000` ✅

---

## 🚀 Lancement complet du projet

### Option 1 : Deux terminaux séparés

**Terminal 1 — Backend :**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend :**
```bash
cd client
npm run start
```

### Option 2 : Commande unique (si disponible)

Si un script racine existe :
```bash
npm run dev
```

---

## 👤 Créer un compte utilisateur

### Via l'interface web

1. Ouvrez votre navigateur : `http://localhost:3000`
2. Cliquez sur **S'inscrire** ou allez sur `/register`
3. Remplissez le formulaire :
   - **Email** : votre@email.com
   - **Mot de passe** : minimum 8 caractères
4. Cliquez sur **Créer un compte**

### Via API (curl)

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Réponse attendue :

```json
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "uuid-xxx",
    "email": "test@example.com"
  }
}
```

---

## 🔍 Dépannage

### Erreur : `password authentication failed for user`

⚠️ Vérifiez que votre `DATABASE_URL` dans `.env` correspond bien à vos identifiants PostgreSQL.

### Erreur : `relation "users" does not exist`

⚠️ Les migrations n'ont pas été appliquées. Exécutez :

```bash
cd backend
npm run migrate
```

### Erreur : `ESLint Invalid Options` (client)

⚠️ Incompatibilité ESLint 9 + vite-plugin-checker. Le checker ESLint a été désactivé dans Vite.  
Lintez manuellement avec :

```bash
cd client
npm run lint
```

### Le backend ne démarre pas

1. Vérifiez que PostgreSQL est démarré :
   ```bash
   sudo service postgresql status
   ```

2. Vérifiez que le port 5000 est libre :
   ```bash
   lsof -i :5000
   ```

### Le client ne démarre pas

1. Vérifiez que le port 3000 est libre :
   ```bash
   lsof -i :3000
   ```

2. Réinstallez les dépendances :
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

---

## 📦 Scripts disponibles

### Backend (`backend/`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur en mode développement (hot reload) |
| `npm run build` | Compile le TypeScript en JavaScript |
| `npm run start` | Lance le serveur compilé (production) |
| `npm run migrate` | Applique les migrations SQL |

### Client (`client/`)

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre Vite en mode développement |
| `npm run start` | Alias de `npm run dev` |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |

---

## 🛠️ Technologies utilisées

**Backend :**
- Node.js + Express
- TypeScript
- PostgreSQL (base de données)
- Redis (cache, optionnel)
- JWT (authentification)
- bcrypt (hashing de mots de passe)

**Frontend :**
- React 19
- TypeScript
- Vite (build tool)
- Styled Components
- Zustand (state management)
- React Router

---

## 📝 Licence

Projet académique ISEN.
