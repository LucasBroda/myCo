# CLAUDE.md — Projet myCo Client

## Stack technique

- **Framework** : React 19 avec TypeScript 5.9
- **Bundler** : Vite 7
- **Router** : React Router 7
- **Linter** : ESLint 9 avec typescript-eslint, react-hooks, prettier
- **Formatter** : Prettier 3
- **Type** : module ES (`"type": "module"`)

## Scripts disponibles

```bash
npm run dev       # Démarre le serveur de développement (port 3000)
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # Prévisualisation du build
```

## Conventions TypeScript

- Mode **strict** activé — ne jamais contourner avec `@ts-ignore` ou cast `as any`
- Pas de `any` explicite (règle ESLint : warn) — utiliser des types précis
- Variables et paramètres non utilisés sont interdits (`noUnusedLocals`, `noUnusedParameters`)
- Target : `ES2020`, module : `ESNext`, résolution : `bundler`
- JSX transform : `react-jsx` (pas besoin d'importer React dans chaque fichier)

## Imports — utiliser les alias absolus

Toujours préférer les alias aux chemins relatifs profonds :

| Alias           | Chemin réel        |
| --------------- | ------------------ |
| `@/*`           | `src/*`            |
| `@components/*` | `src/components/*` |
| `@pages/*`      | `src/pages/*`      |
| `@layout/*`     | `src/layouts/*`    |
| `@services/*`   | `src/services/*`   |
| `@types/*`      | `src/types/*`      |
| `@store/*`      | `src/store/*`      |
| `@assets/*`     | `src/assets/*`     |

## Conventions Prettier (ne pas dévier)

- `semi: false` — pas de point-virgule
- `singleQuote: true` — guillemets simples
- `useTabs: true` — indentation par tabulations
- `tabWidth: 2`
- `trailingComma: "es5"` — virgule finale sur les objets/tableaux multilignes
- `printWidth: 80`
- `arrowParens: "avoid"` — pas de parenthèses sur les arrow functions à un paramètre
- `bracketSameLine: false`

## Règles ESLint à respecter

- `prettier/prettier: error` — tout code doit passer Prettier
- `@typescript-eslint/no-unused-vars: warn` — préfixer par `_` si intentionnellement non utilisé
- `@typescript-eslint/no-explicit-any: warn` — éviter `any`, typer précisément
- `react-refresh/only-export-components` — les fichiers composants n'exportent que des composants

## Architecture src/

```
src/
├── assets/        # Images, fonts, fichiers statiques
├── components/    # Composants réutilisables
├── layouts/       # Composants de mise en page
├── pages/         # Pages (une par route)
├── services/      # Appels API et logique métier
├── store/         # État global
└── types/         # Types et interfaces TypeScript partagés
```

## Serveur de développement

- Port : **3000**
- Proxy : `/api` → `http://localhost:5000` (backend)

## Design & UX

### Palette de couleurs — règles strictes

**Couleurs interdites :**
- Tout violet/mauve (`#7c3aed`, `#8b5cf6`, `#a855f7`, `#6d28d9`, etc.)
- Tout bleu typique IA/chatbot (`#2563eb`, `#3b82f6`, `#60a5fa`, `#1d4ed8`, etc.)
- Les dégradés violet→bleu ou bleu→cyan caractéristiques des interfaces IA génératives

**Palette autorisée — exemples de directions :**
- Neutres : `slate`, `zinc`, `stone`, `gray` (échelle Tailwind ou équivalent)
- Tons chauds : terracotta, ocre, sable, ardoise chaude
- Accents sobres et intentionnels : vert forêt, rouge brique, jaune ambre
- Fond clair ou sombre selon le contexte, jamais de fond saturé

### Accessibilité (WCAG 2.1 — niveau AA minimum)

- Contraste texte/fond ≥ **4.5:1** pour le texte normal, ≥ **3:1** pour le grand texte
- Tous les éléments interactifs sont navigables au **clavier** (`Tab`, `Enter`, `Escape`)
- Chaque image non décorative a un attribut `alt` descriptif
- Les icônes seules ont un `aria-label` ou un texte visuellement masqué (`sr-only`)
- Utiliser les balises sémantiques HTML5 : `<nav>`, `<main>`, `<header>`, `<section>`, `<article>`, `<button>`, etc.
- Les formulaires ont des `<label>` associés à chaque `<input>`
- Les états visuels (focus, hover, disabled, error) sont tous distincts et visibles
- Pas de contenu qui clignote ou s'anime de façon agressive

### Design moderne et sobre

- **Mobile-first** : concevoir d'abord pour petits écrans, puis enrichir pour desktop
- Espacement cohérent basé sur une échelle (ex: multiples de 4px ou 8px)
- Typographie hiérarchique claire : une seule police principale, maximum deux familles
- Taille de texte de base ≥ 16px
- Pas de contenu tronqué arbitrairement — adapter le layout plutôt que cacher
- Les états vides, chargement et erreur sont tous designés (pas de composant sans état alternatif)
- Les actions destructives (suppression, déconnexion) demandent une confirmation
- Feedback visuel immédiat sur toute interaction (hover, focus, clic, chargement)

### Composants React

- Les composants visuels sont découplés de la logique métier
- Les styles sont colocalisés avec le composant (CSS Modules, Tailwind, ou styled-components selon le projet)
- Pas de valeurs de style en dur dans le JSX si elles sont réutilisées ailleurs
- Toujours penser responsive : pas de largeur fixe en `px` pour les conteneurs

## Règles générales

- Ne jamais créer de fichiers inutiles — toujours préférer éditer un fichier existant
- Vérifier que `npm run build` passe avant de considérer une tâche terminée
- Vérifier que `npm run lint` ne produit aucune erreur avant de valider du code
- Ne pas ajouter de `console.log` dans le code livré
- Ne pas installer de dépendances sans raison explicite
- Respecter la structure `src/` définie ci-dessus pour tout nouveau fichier
