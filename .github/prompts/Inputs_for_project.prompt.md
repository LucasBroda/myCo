---
agent: 'agent'
description: 'Normes de code, design, accessibilité et UX du projet myCo Client'
---

# Contexte — Projet myCo Client

Application web React 19 + TypeScript 5.9 avec Vite 7 et React Router 7.
Ce fichier constitue la référence complète des normes à respecter sur le projet.
Il complète `CLAUDE.md` qui est chargé automatiquement à chaque conversation.

---

## 1. Normes de code

### TypeScript

- Mode strict activé : pas de `@ts-ignore`, pas de `as any`, pas de cast non justifié
- Typer explicitement les props des composants, les retours de fonctions, les réponses d'API
- Préférer les `interface` pour les objets, `type` pour les unions et les utilitaires
- Les paramètres et variables non utilisés doivent être préfixés `_` ou supprimés

### Structure des fichiers

- Un composant par fichier
- Les fichiers de page vivent dans `src/pages/`
- Les composants réutilisables dans `src/components/`
- La logique métier et les appels API dans `src/services/`
- Les types partagés dans `src/types/`
- L'état global dans `src/store/`

### Imports

Toujours utiliser les alias configurés dans `vite.config.ts` :

```ts
// Correct
import { Button } from '@components/Button'
import { useAuth } from '@store/auth'
import type { User } from '@types/user'

// Interdit
import { Button } from '../../components/Button'
```

### Qualité

- `npm run lint` doit passer sans erreur avant tout commit
- `npm run build` doit passer sans erreur avant de marquer une tâche terminée
- Pas de `console.log` dans le code livré
- Ne pas installer de dépendances sans raison explicite et documentée

---

## 2. Normes Design & UX

### Couleurs — règles strictes

#### Interdits sans exception

Ces couleurs ou familles de couleurs sont **bannies** du projet car typiques des interfaces IA génératives et des outils sans identité visuelle propre :

| Famille                 | Exemples                                              |
| ----------------------- | ----------------------------------------------------- |
| Violet / Mauve / Indigo | `#7c3aed` `#8b5cf6` `#a855f7` `#6d28d9` `#4f46e5`     |
| Bleu IA / Chatbot       | `#2563eb` `#3b82f6` `#60a5fa` `#1d4ed8` `#0ea5e9`     |
| Dégradés violet→bleu    | tout `from-violet to-blue`, `from-indigo to-cyan`     |
| Cyan saturé IA          | `#06b6d4` `#22d3ee` utilisés comme couleur principale |

#### Directions de palette acceptables

L'objectif est une identité visuelle forte, humaine et mémorisable.

- **Neutres de base** : `slate`, `zinc`, `stone`, `neutral` (Tailwind) ou équivalents HSL
- **Tons chauds** : terracotta (`#c2674b`), ocre (`#d4a24c`), sable (`#e8d5b7`), brique (`#9b3a2e`)
- **Verts sobres** : vert forêt, sauge, mousse
- **Sombres** : charbon, anthracite, noir doux (éviter le noir pur `#000000`)
- **Accents** : un seul accent couleur par interface, fort et intentionnel

### Accessibilité (WCAG 2.1 — AA obligatoire, AAA si possible)

#### Contraste

- Texte normal (< 18px non gras) : ratio ≥ **4.5:1**
- Grand texte (≥ 18px ou 14px gras) : ratio ≥ **3:1**
- Éléments UI interactifs et composants graphiques : ratio ≥ **3:1**
- Vérifier avec des outils : [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

#### Navigation clavier

- Tous les éléments interactifs reçoivent le focus clavier (`Tab`)
- L'ordre de focus suit la logique visuelle de la page
- `Escape` ferme les modales, dropdowns et overlays
- `Enter` / `Space` activent les boutons et liens
- Pas de `outline: none` sans remplacement visuel du focus

#### HTML sémantique

```html
<!-- Correct -->
<nav>
	,
	<main>
		,
		<header>
			,
			<footer>
				,
				<section aria-labelledby="...">
					,
					<article>
						<button type="button">
							,
							<a href="...">
								(jamais
								<div onClick>
									)
									<ul>
										/
										<ol>
											pour les listes,
											<table>
												pour les données tabulaires

												<!-- Interdit -->
												<div class="button" onClick>
													, <span class="link" onClick></span>
												</div>
											</table>
										</ol>
									</ul></div
							></a>
						</button>
					</article>
				</section>
			</footer>
		</header>
	</main>
</nav>
```

#### ARIA

- `aria-label` ou `aria-labelledby` sur tous les éléments sans texte visible
- `aria-live="polite"` pour les notifications et mises à jour dynamiques
- `role="dialog"` + `aria-modal="true"` + focus piégé pour les modales
- `aria-expanded`, `aria-haspopup` sur les menus et accordéons
- `aria-invalid` + `aria-describedby` sur les champs de formulaire en erreur

#### Images et médias

- `alt=""` pour les images décoratives (vide, pas absent)
- `alt="description précise"` pour les images porteuses d'information
- Les vidéos ont des sous-titres ; les audios ont une transcription

#### Formulaires

- Chaque `<input>`, `<select>`, `<textarea>` a un `<label>` associé (`htmlFor` / `id`)
- Les messages d'erreur sont explicites et liés au champ via `aria-describedby`
- Pas de validation uniquement par la couleur — toujours accompagner d'un texte

---

## 3. Design moderne et sobre

### Principes généraux

- **Mobile-first** : concevoir pour 375px, enrichir pour 768px, 1024px, 1280px+
- Interface épurée : éviter la surcharge visuelle, la transparence verre (glassmorphism abusif), les ombres excessives
- Un seul point d'attention visuel par vue (pas de 3 CTA en compétition)
- Les interfaces denses (tableaux, dashboards) restent lisibles à 80% de zoom

### Typographie

- Taille de base : **≥ 16px**
- Interligne : **≥ 1.5** pour le corps de texte
- Maximum 2 familles typographiques par projet
- Hiérarchie claire : `h1` > `h2` > `h3` — jamais sauter un niveau
- Pas de justification de texte (`text-align: justify`) — nuit à la lisibilité

### Espacement

- Système à base de 4px ou 8px (tokens de spacing cohérents)
- Padding des zones cliquables ≥ 44px × 44px (cible tactile WCAG 2.5.5)
- Marges suffisantes autour des textes longs (max-width ~65ch pour le corps)

### États des composants

Chaque composant interactif doit avoir tous ses états designés :

| État             | Obligatoire   |
| ---------------- | ------------- |
| Default          | oui           |
| Hover            | oui           |
| Focus (clavier)  | oui           |
| Active / Pressed | oui           |
| Disabled         | oui           |
| Loading          | si applicable |
| Error            | si applicable |
| Empty state      | si applicable |

### Feedback et interactions

- Feedback visuel immédiat (< 100ms) sur tout clic ou interaction
- Indicateur de chargement pour toute opération > 300ms
- Messages d'erreur humains et actionnables (pas "Error 500", mais "Impossible de sauvegarder, réessayez")
- Les actions irréversibles (suppression, déconnexion) demandent une confirmation explicite

### Animations

- Durées courtes : transitions UI entre 150ms et 300ms
- Respecter `prefers-reduced-motion` — toujours prévoir une version sans animation
- Pas d'animation décorative qui bloque ou détourne l'attention du contenu

---

## 4. Composants React — bonnes pratiques UX

- Un composant = une responsabilité (SRP)
- Les composants de présentation ne contiennent pas de logique métier
- Les formulaires contrôlés gèrent leur état localement sauf si partagé
- Les listes d'éléments ont toujours une `key` stable (jamais l'index si la liste est modifiable)
- Les modales, toasts et overlays sont rendus dans un `Portal` React
- Les composants asynchrones ont toujours un état de chargement et un état d'erreur
