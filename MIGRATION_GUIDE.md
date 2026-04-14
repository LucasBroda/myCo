# Guide de migration Git - myCo

## Contexte
Le projet a été restructuré pour séparer `backend/` et `client/` en répertoires distincts à la racine.

## État actuel

### Branches prêtes
- ✅ `feature/add_README` - Restructuration complète (corrigée)
- ✅ `refactor/restructure-monorepo` - PR à merger vers develop

### Branches à porter
- ⏳ `feature/init_auth` - Authentification (ancienne structure)
- ⏳ `feature/init_interface` - Interface utilisateur (ancienne structure)

## Prochaines étapes

### 1. Merger la restructuration
```bash
# Sur GitHub, créer et merger la PR:
# refactor/restructure-monorepo → develop
```

### 2. Porter feature/init_auth

**Option A : Cherry-pick (si les commits sont propres)**
```bash
# Récupérer develop restructuré
git checkout develop
git pull

# Créer une nouvelle branche
git checkout -b feature/auth-migration

# Cherry-pick les commits de init_auth
git log origin/feature/init_auth --oneline
# Noter les SHA des commits à porter

git cherry-pick <SHA1> <SHA2> ...

# Résoudre les conflits si nécessaire
# Les fichiers seront maintenant dans client/ au lieu de la racine

# Pousser
git push -u origin feature/auth-migration
```

**Option B : Recréer manuellement (recommandé si complexe)**
```bash
# Récupérer develop restructuré
git checkout develop
git pull

# Créer une nouvelle branche
git checkout -b feature/auth-refactored

# Comparer avec l'ancienne branche pour voir les changements
git diff develop..origin/feature/init_auth

# Appliquer manuellement les changements dans la nouvelle structure
# Puis commit et push
git add .
git commit -m "feat: authentification (porté sur nouvelle structure)"
git push -u origin feature/auth-refactored
```

### 3. Porter feature/init_interface

Suivre la même approche que pour `init_auth`.

## Résolution des conflits typiques

### Anciens chemins → Nouveaux chemins
```
src/            → client/src/
public/         → client/public/
package.json    → client/package.json
vite.config.ts  → client/vite.config.ts
```

### Fichiers backend
```
backend/package.json (ancien) → backend/package.json (nouveau - structure complète)
```

## Commandes utiles

### Voir les différences entre branches
```bash
git diff develop..origin/feature/init_auth --stat
```

### Lister les commits d'une branche
```bash
git log develop..origin/feature/init_auth --oneline
```

### Voir les fichiers modifiés dans un commit
```bash
git show <SHA> --name-only
```

## Gitflow propre final

```
main
  ↑
develop (restructuré)
  ↑
  ├── feature/auth-refactored
  ├── feature/interface-refactored
  └── (futures features)
```

## Notes importantes

- ✅ L'historique de develop reste propre
- ✅ Pas de submodules Git problématiques
- ✅ Structure modulaire prête pour le développement
- ⚠️  Les anciennes branches ne doivent PAS être mergées directement (structure incompatible)

## Support

Si vous rencontrez des problèmes lors de la migration, commencez toujours par :
1. Vérifier que vous êtes sur la bonne branche : `git branch`
2. Vérifier l'état : `git status`
3. Vérifier les remotes : `git remote -v`
