/**
 * Page "Mes Collections"
 * 
 * Affiche uniquement les collections (sets Pokémon) que l'utilisateur suit.
 * Fonctionnalité clé : recherche bilingue français-anglais pour les noms de collections.
 * 
 * Fonctionnalités :
 * - Chargement des collections suivies depuis l'API
 * - Affichage du nombre de cartes possédées par collection
 * - Recherche bilingue (ex: "Soleil" trouve "Sun & Moon")
 * - Mapping français → anglais pour faciliter la recherche
 * - Normalisation des chaînes (suppression des accents)
 * - Filtrage en temps réel
 * - Navigation vers les détails de collection
 * - Gestion d'états : chargement, erreur, vide
 */

import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EtatVide'
import { ErrorState } from '@components/ui/EtatErreur'
import { Spinner } from '@components/ui/Chargeur'
import { Input } from '@components/ui/Entree'
import { PageHeader } from '@components/layout/EntetePage'
import { SetCard } from '@components/pokemon/CarteCollection'
import { collectionService } from '@services/serviceCollection'
import { cardsService } from '@services/serviceCartes'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	max-width: 500px;

	@media (min-width: ${({ theme }) => theme.breakpoints.md}) {
		margin-bottom: ${({ theme }) => theme.spacing['6']};
	}
`

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	gap: ${({ theme }) => theme.spacing['3']};

	@media (min-width: ${({ theme }) => theme.breakpoints.sm}) {
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: ${({ theme }) => theme.spacing['4']};
	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
`

// Mapping français -> anglais pour les séries Pokémon
const frenchToEnglishMapping: Record<string, string[]> = {
	// Séries principales
	'base': ['base'],
	'jungle': ['jungle'],
	'fossile': ['fossil'],
	'team rocket': ['team rocket'],
	'gym': ['gym'],
	'neo': ['neo'],
	'legendary': ['legendary', 'legendaire'],
	'expedition': ['expedition', 'expédition'],
	'aquapolis': ['aquapolis'],
	'skyridge': ['skyridge'],
	'rubis': ['ruby', 'sapphire'],
	'saphir': ['ruby', 'sapphire'],
	'emeraude': ['emerald'],
	'feuille': ['firered', 'leafgreen', 'fire', 'leaf'],
	'rouge': ['firered', 'fire'],
	'verte': ['leafgreen', 'leaf'],
	'diamant': ['diamond', 'pearl'],
	'perle': ['diamond', 'pearl'],
	'platine': ['platinum'],
	'or': ['heartgold', 'gold'],
	'argent': ['soulsilver', 'silver'],
	'noir': ['black', 'white'],
	'blanc': ['black', 'white'],
	'x': ['x', 'y'],
	'y': ['x', 'y'],
	'soleil': ['sun', 'moon'],
	'lune': ['sun', 'moon'],
	'épée': ['sword', 'shield'],
	'bouclier': ['sword', 'shield'],
	'écarlate': ['scarlet', 'violet'],
	'violet': ['scarlet', 'violet'],
	'évolutions': ['evolutions', 'evolution'],
	'générations': ['generations', 'generation'],
	'destinées': ['fates', 'destiny', 'destinies'],
	'occult': ['hidden', 'occult'],
	'obscures': ['hidden', 'dark'],
	'brillant': ['shining', 'brilliant', 'shiny'],
	'étoile': ['star', 'stellar'],
	'fusion': ['fusion', 'strike'],
	'ténèbres': ['darkness', 'dark'],
	'tempête': ['storm', 'tempest'],
	'ciel': ['sky', 'celestial'],
	'gardiens': ['guardians', 'guardian'],
	'origine': ['origins', 'origin'],
	'légendes': ['legends', 'legendary'],
	'triomphe': ['triumphant', 'triumph'],
	'dragons': ['dragon'],
	'astres': ['astral', 'stellar'],
	'couronne': ['crown', 'zenith'],
	'zénith': ['zenith'],
	'braises': ['ember', 'fire'],
	'obsidienne': ['obsidian'],
	'glacier': ['ice', 'glacier'],
	'flammes': ['flame', 'fire'],
	'volt': ['volt', 'electric'],
	'paradoxe': ['paradox'],
	'destinée': ['destiny', 'destinies'],
	'roi': ['king', 'crown'],
	'reine': ['queen', 'crown'],
	'masques': ['mask'],
	'crépuscule': ['twilight', 'dusk'],
	'aurore': ['dawn', 'aurora'],
}

/**
 * Normalise une chaîne de caractères pour la recherche
 * 
 * Transformations appliquées :
 * 1. Conversion en minuscules
 * 2. Normalisation Unicode NFD (décomposition des caractères accentués)
 * 3. Suppression des diacritiques (accents) via regex \u0300-\u036f
 * 4. Trim (suppression des espaces de début/fin)
 * 
 * Exemples :
 * - "Épée" → "epee"
 * - "Tempête" → "tempete"
 * - "  Légendes  " → "legendes"
 * 
 * @param str - Chaîne à normaliser
 * @returns Chaîne normalisée (minuscules, sans accents)
 */
function normalizeString(str: string): string {
	return str
		.toLowerCase()
		.normalize('NFD') // Décomposition Unicode (ex: é → e + accent)
		.replace(/[\u0300-\u036f]/g, '') // Suppression des accents (plage Unicode)
		.trim()
}

/**
 * Vérifie si un nom de collection correspond à la recherche
 * 
 * Stratégie de recherche en 2 étapes :
 * 1. Recherche directe dans le nom anglais officiel
 * 2. Si pas de correspondance, utilise le mapping français-anglais
 * 
 * La recherche est insensible à la casse et aux accents grâce à normalizeString().
 * 
 * Exemples :
 * - Recherche "sun" trouve "Sun & Moon" (correspondance directe)
 * - Recherche "soleil" trouve "Sun & Moon" (via mapping français)
 * - Recherche "épée" trouve "Sword & Shield" (via mapping + normalisation)
 * 
 * @param setName - Nom officiel de la collection (en anglais)
 * @param searchQuery - Terme recherché par l'utilisateur (français ou anglais)
 * @returns true si la collection correspond à la recherche
 */
function matchesSearch(setName: string, searchQuery: string): boolean {
	if (!searchQuery) return true

	const normalizedSetName = normalizeString(setName)
	const normalizedQuery = normalizeString(searchQuery)

	// Étape 1 : Recherche directe dans le nom anglais
	if (normalizedSetName.includes(normalizedQuery)) return true

	// Étape 2 : Recherche via le mapping français-anglais
	for (const [frenchTerm, englishTerms] of Object.entries(frenchToEnglishMapping)) {
		const normalizedFrench = normalizeString(frenchTerm)
		
		// Vérifier si le terme français correspond à la recherche
		if (normalizedFrench.includes(normalizedQuery) || normalizedQuery.includes(normalizedFrench)) {
			// Si oui, vérifier si un des termes anglais est dans le nom de la collection
			return englishTerms.some(englishTerm => 
				normalizedSetName.includes(normalizeString(englishTerm))
			)
		}
	}

	return false
}

/**
 * Page Mes Collections - Composant principal
 * 
 * Charge et affiche les collections suivies par l'utilisateur avec recherche bilingue.
 */
export default function PageMesCollections() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore() // Store Zustand pour les cartes possédées
	const navigate = useNavigate()

	/**
	 * Charge les données initiales
	 * 
	 * Chargement parallèle avec Promise.all pour optimiser les performances :
	 * 1. Liste des IDs des collections suivies
	 * 2. Collection de cartes de l'utilisateur
	 * 3. Tous les sets disponibles dans l'API Pokémon TCG
	 * 
	 * Filtre ensuite pour ne garder que les sets suivis.
	 */
	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			// Chargement parallèle pour optimiser les performances (3 requêtes simultanées)
			const [followedSetIds, collection, allSets] = await Promise.all([
				collectionService.getFollowedSets(), // GET /api/collection/collections-suivies
				collectionService.getCollection(), // GET /api/collection
				cardsService.getSets(), // API Pokémon TCG (caché 24h côté backend)
			])
			
			// Met à jour le store Zustand avec les cartes possédées
			setCollection(collection)
			
			// Filtrage : ne garde que les collections que l'utilisateur suit
			const followedSets = allSets.filter(set => followedSetIds.includes(set.id))
			setSets(followedSets)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	// Chargement au montage du composant
	useEffect(() => {
		loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	/**
	 * Filtre les collections en fonction de la recherche
	 * 
	 * Utilise useMemo pour éviter de recalculer le filtrage à chaque render.
	 * Recalcule seulement quand sets ou searchQuery changent.
	 */
	const filteredSets = useMemo(() => {
		return sets.filter(set => matchesSearch(set.name, searchQuery))
	}, [sets, searchQuery])

	/**
	 * Compte le nombre de cartes possédées dans une collection
	 * 
	 * Parcourt toutes les cartes de l'acquiredMap (structure : Map<cardId, AcquiredCard[]>)
	 * et compte celles qui appartiennent au set donné.
	 * 
	 * @param setId - ID de la collection
	 * @returns Nombre de cartes possédées dans cette collection
	 */
	function getOwnedCount(setId: string): number {
		return Object.values(acquiredMap)
			.flat() // Aplatit le tableau de tableaux
			.filter(c => c.setId === setId).length
	}

	// États de chargement et d'erreur
	if (isLoading) return <Spinner center label="Chargement de vos collections…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	
	// État vide : aucune collection suivie
	if (sets.length === 0) {
		return (
			<section aria-labelledby="my-collections-title">
				<PageHeader
					title="Mes collections"
					id="my-collections-title"
					subtitle="Aucune collection suivie"
				/>
				<EmptyState message="Vous ne suivez aucune collection. Allez dans 'Toutes les collections' pour en ajouter." />
			</section>
		)
	}

	// Construction du sous-titre dynamique avec nombre de collections
	const collectionsLabel = filteredSets.length > 1 ? 'collections suivies' : 'collection suivie'
	const subtitle = searchQuery
		? `${filteredSets.length} ${collectionsLabel} (${sets.length} au total)`
		: `${filteredSets.length} ${collectionsLabel}`

	return (
		<section aria-labelledby="my-collections-title">
			<PageHeader
				title="Mes collections"
				id="my-collections-title"
				subtitle={subtitle}
			/>
			{/* Champ de recherche bilingue */}
			<SearchContainer>
				<Input
					type="text"
					placeholder="Rechercher une collection (ex: Vainqueurs Suprêmes, Base, XY)..."
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					inputSize="md"
				/>
			</SearchContainer>
			{/* Affichage conditionnel : résultats ou message vide */}
			{filteredSets.length === 0 ? (
				<EmptyState message={`Aucune collection trouvée pour "${searchQuery}"`} />
			) : (
				<Grid>
					{filteredSets.map(set => (
					<SetCard
						key={set.id}
						set={set}
						ownedCount={getOwnedCount(set.id)}
						onClick={() => navigate(`/collections/${set.id}`)}
					/>
					))}
				</Grid>
			)}
		</section>
	)
}
