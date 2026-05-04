# Configuration eBay API

Ce guide explique comment configurer l'intégration de l'API eBay pour obtenir les prix en temps réel des cartes Pokémon.

## Obtenir les credentials eBay

### 1. Créer un compte développeur eBay

1. Rendez-vous sur [developer.ebay.com](https://developer.ebay.com/)
2. Cliquez sur "Register" pour créer un compte développeur
3. Complétez le formulaire d'inscription

### 2. Créer une application

1. Connectez-vous au [Developer Portal](https://developer.ebay.com/my/keys)
2. Créez une nouvelle application (choisissez "Production" pour un usage réel)
3. Remplissez les informations requises :
   - **Application Title** : Nom de votre application (ex: "MyCo Pokemon TCG")
   - **Application Purpose** : Description (ex: "Price comparison for Pokemon cards")

### 3. Récupérer les credentials

Une fois l'application créée, vous aurez accès à :
- **App ID (Client ID)** : Votre identifiant client
- **Cert ID (Client Secret)** : Votre secret client

## Configuration dans le projet

### 1. Fichier .env

Ajoutez les variables suivantes dans votre fichier `.env` :

```env
# eBay API Configuration
EBAY_CLIENT_ID=VotreClientID
EBAY_CLIENT_SECRET=VotreClientSecret
EBAY_MARKETPLACE=EBAY_US  # ou EBAY_FR pour le marché français
```

### 2. Marketplaces disponibles

Vous pouvez changer le marketplace selon votre région :

- `EBAY_US` - États-Unis (USD)
- `EBAY_FR` - France (EUR)
- `EBAY_GB` - Royaume-Uni (GBP)
- `EBAY_DE` - Allemagne (EUR)
- `EBAY_CA` - Canada (CAD)

## Fonctionnement

### Authentification OAuth

Le service eBay gère automatiquement l'authentification OAuth 2.0 :
- Les tokens sont récupérés automatiquement
- Mis en cache pendant 55 minutes (expiration à 60 min)
- Renouvelés automatiquement si nécessaire

### Recherche de prix

Pour chaque carte, l'API :
1. Recherche les listings actifs sur eBay (catégorie Pokémon TCG)
2. Filtre les résultats "Buy It Now" uniquement
3. Calcule le prix moyen des 10 premiers résultats
4. Retourne le prix et l'URL du premier listing

### Fallback

Si l'API eBay n'est pas configurée ou échoue :
- Un lien de recherche eBay est généré
- Le prix reste `null`
- L'utilisateur peut toujours cliquer pour chercher manuellement

## Limites de l'API

- **Limite de requêtes** : 5000 appels/jour (gratuit)
- **Cache** : Les prix sont mis en cache 30 minutes pour éviter les quotas

## Développement local

Pour tester sans configurer eBay :
- Laissez `EBAY_CLIENT_ID` et `EBAY_CLIENT_SECRET` vides
- L'application générera des liens de recherche sans prix
- Aucune erreur ne sera levée

## Production

⚠️ **Important** : En production, assurez-vous de :
- Utiliser une application eBay "Production" (pas Sandbox)
- Vérifier les limites de votre compte eBay
- Monitorer les erreurs dans les logs backend

## Ressources

- [eBay Developer Program](https://developer.ebay.com/)
- [Browse API Documentation](https://developer.ebay.com/api-docs/buy/browse/overview.html)
- [OAuth Guide](https://developer.ebay.com/api-docs/static/oauth-client-credentials-grant.html)
