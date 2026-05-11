/**
 * Page Collections (version simple)
 * 
 * Affiche toutes les collections Pokémon TCG disponibles sans fonction de suivi.
 * Version simplifiée de la page, utilisée comme page d'accueil.
 * 
 * Fonctionnalités :
 * - Affichage de tous les sets disponibles dans l'API Pokémon TCG
 * - Compte des cartes possédées par set
 * - Navigation vers les détails de chaque collection
 * - Pas de recherche ni de filtres (version simple)
 */

import type { PokemonSet } from '@/types/models'
import { EmptyState } from '@components/ui/EtatVide'
import { ErrorState } from '@components/ui/EtatErreur'
import { Spinner } from '@components/ui/Chargeur'
import { PageHeader } from '@components/layout/EntetePage'
import { SetCard } from '@components/pokemon/CarteCollection'
import { collectionService } from '@services/serviceCollection'
import { cardsService } from '@services/serviceCartes'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'

const Grid = styled.div`
/**
 * Composant principal de la page Collections
 * 
 * Charge toutes les collections et affiche une grille simple avec navigation.
 */
export default function CollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore() // Store Zustand
	const navigate = useNavigate()

	/**
	 * Charge les données : tous les sets + collection de l'utilisateur
	 * 
	 * Chargement parallèle pour optimiser les performances.
	 */	}

	@media (min-width: ${({ theme }) => theme.breakpoints.lg}) {
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
`

export default function CollectionsPage() {
	const [sets, setSets] = useState<PokemonSet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const { setCollection, acquiredMap } = useCollectionStore()
	const navigate = useNavigate()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			const [fetchedSets, collection] = await Promise.all([
				cardsService.getSets(),
				collectionService.getCollection(),
			])
			setSets(fetchedSets)
			setCollection(collection)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	function getOwnedCount(setId: string): number {
		return Object.values(acquiredMap)
			.flat()
			.filter(c => c.setId === setId).length
	}

	if (isLoading) return <Spinner center label="Chargement des collections…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />
	if (sets.length === 0) return <EmptyState message="Aucun set disponible." />

	return (
		<section aria-labelledby="collections-title">
			<PageHeader
				title="Collections"
				id="collections-title"
				subtitle={`${sets.length} sets Pokémon TCG`}
			/>
			<Grid>
				{sets.map(set => (
					<SetCard
						key={set.id}
						set={set}
						ownedCount={getOwnedCount(set.id)}
						onClick={() => navigate(`/collections/${set.id}`)}
					/>
				))}
			</Grid>
		</section>
	)
}
