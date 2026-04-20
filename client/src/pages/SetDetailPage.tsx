import type { CardCondition, PokemonCard, PokemonSet } from '@/types/models'
import { Button } from '@components/ui/Button'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Field, Input } from '@components/ui/Input'
import { Modal, ModalBody, ModalFooter } from '@components/ui/Modal'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Spinner } from '@components/ui/Spinner'
import { FilterBar, type FilterOption } from '@components/layout/FilterBar'
import { PageHeader } from '@components/layout/PageHeader'
import { CardThumbnail } from '@components/pokemon/CardThumbnail'
import { ConditionSelect } from '@components/pokemon/ConditionSelect'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { profileService } from '@services/profileService'
import { useCollectionStore } from '@store/collectionStore'
import { usePlannedStore } from '@store/plannedStore'
import { useToast } from '@hooks/useToast'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

// ─── Layout ──────────────────────────────────────────────────────────────────

const HeaderSection = styled.div`
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: ${({ theme }) => theme.spacing['4']};
	margin-bottom: ${({ theme }) => theme.spacing['6']};

	@media (max-width: ${({ theme }) => theme.breakpoints.md}) {
		flex-direction: column;
		align-items: flex-start;
	}
`

const FollowButton = styled(Button)<{ $isFollowed: boolean }>`
	background-color: ${({ $isFollowed, theme }) =>
		$isFollowed ? theme.colors.brickLight : theme.colors.amberLight};
	color: ${({ $isFollowed, theme }) =>
		$isFollowed ? theme.colors.brick : theme.colors.amber};

	&:hover:not(:disabled) {
		background-color: ${({ $isFollowed, theme }) =>
			$isFollowed ? theme.colors.brick : theme.colors.amber};
		color: ${({ theme }) => theme.colors.textPrimary};
	}
`

const ProgressSection = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['6']};
	padding: ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
`

const CardGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: ${({ theme }) => theme.spacing['3']};
`

const BackLink = styled.button`
	display: inline-flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['1']};
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	font-family: inherit;

	&:hover {
		color: ${({ theme }) => theme.colors.textPrimary};
	}

	&:focus-visible {
		outline: 2px solid ${({ theme }) => theme.colors.focus};
		outline-offset: 2px;
		border-radius: ${({ theme }) => theme.radii.sm};
	}
`

// ─── Filter options ───────────────────────────────────────────────────────────

type CardFilter = 'all' | 'owned' | 'missing'

const filterOptions: FilterOption<CardFilter>[] = [
	{ value: 'all', label: 'Toutes' },
	{ value: 'owned', label: 'Possédées' },
	{ value: 'missing', label: 'Manquantes' },
]

// Rarity order from most common to rarest (lower number = more common)
const rarityOrder: Record<string, number> = {
	'Common': 1,
	'Uncommon': 2,
	'Rare': 3,
	'Rare Holo': 4,
	'Double Rare': 5,
	'Rare Holo EX': 6,
	'Rare Holo GX': 7,
	'Rare Holo V': 8,
	'Rare Holo VMAX': 9,
	'Rare Holo VSTAR': 10,
	'Rare Ultra': 11,
	'Illustration Rare': 12,
	'Rare ACE': 13,
	'Rare BREAK': 14,
	'Amazing Rare': 15,
	'Radiant Rare': 16,
	'Rare Shining': 17,
	'Rare Shiny': 18,
	'Rare Shiny GX': 19,
	'Ultra Rare': 20,
	'Special Illustration Rare': 21,
	'Hyper Rare': 22,
	'Rare Secret': 23,
	'Rare Rainbow': 24,
	'LEGEND': 25,
	'Promo': 26,
}

// ─── AcquireModal ─────────────────────────────────────────────────────────────

const ErrorMessage = styled.p`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.brickLight};
	color: ${({ theme }) => theme.colors.brick};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	border-radius: ${({ theme }) => theme.radii.md};
	border-left: 3px solid ${({ theme }) => theme.colors.brick};
	margin: 0;

	&::before {
		content: '⚠';
		font-size: ${({ theme }) => theme.font.size.lg};
		flex-shrink: 0;
	}
`

const InfoMessage = styled.p`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['2']};
	padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.amberLight};
	color: ${({ theme }) => theme.colors.amber};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	border-radius: ${({ theme }) => theme.radii.md};
	border-left: 3px solid ${({ theme }) => theme.colors.amber};
	margin: 0;

	&::before {
		content: '📅';
		font-size: ${({ theme }) => theme.font.size.lg};
		flex-shrink: 0;
	}
`

const Textarea = styled.textarea`
	width: 100%;
	min-height: 80px;
	padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
	border-radius: ${({ theme }) => theme.radii.md};
	border: 1px solid ${({ theme }) => theme.colors.border};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	color: ${({ theme }) => theme.colors.textPrimary};
	font-family: inherit;
	font-size: ${({ theme }) => theme.font.size.base};
	resize: vertical;
	transition:
		border-color ${({ theme }) => theme.transitions.fast},
		box-shadow ${({ theme }) => theme.transitions.fast};

	&::placeholder {
		color: ${({ theme }) => theme.colors.textMuted};
	}

	&:hover:not(:disabled) {
		border-color: ${({ theme }) => theme.colors.borderStrong};
	}

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.amber};
		box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.amberLight};
	}

	&:disabled {
		background-color: ${({ theme }) => theme.colors.surface};
		color: ${({ theme }) => theme.colors.disabledText};
		cursor: not-allowed;
	}
`

interface AcquireModalProps {
	readonly card: PokemonCard | null
	readonly set: PokemonSet | null
	readonly onClose: () => void
	readonly onAcquired: () => void
	readonly addToPlannedStore: (purchase: import('@/types/models').PlannedPurchase) => void
}

function AcquireModal({ card, set, onClose, onAcquired, addToPlannedStore }: AcquireModalProps) {
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
	const [price, setPrice] = useState('')
	const [condition, setCondition] = useState<CardCondition>('NM')
	const [notes, setNotes] = useState('')
	const [loading, setLoading] = useState(false)
	const [formError, setFormError] = useState('')
	const { addCard: addToStore } = useCollectionStore()
	const { success } = useToast()
	const dateInputRef = useRef<HTMLInputElement>(null)

	// Détecte si la date sélectionnée est dans le futur
	const isFutureDate = new Date(date) > new Date()
	
	const actionText = isFutureDate ? 'Planifier' : 'Acquérir'
	const modalTitle = card ? `${actionText} : ${card.name}` : ''
	
	const baseButtonText = isFutureDate ? 'Planifier cet achat' : 'Ajouter à la collection'
	const submitButtonText = loading ? 'Ajout…' : baseButtonText

	async function handleSubmit(e: { preventDefault: () => void }) {
		e.preventDefault()
		if (!card || !set) return
		setFormError('')
		setLoading(true)
		
		try {
			if (isFutureDate) {
				// Créer un achat planifié
				const planned = await profileService.addPlanned({
					cardId: card.id,
					setId: set.id,
					cardName: card.name,
					setName: set.name,
					plannedDate: date,
					budget: price ? Number.parseFloat(price) : null,
					notes: notes || null,
				})
				addToPlannedStore(planned)
				success(`${card.name} ajoutée aux achats planifiés`)
			} else {
				// Ajouter à la collection immédiatement
				const acquired = await collectionService.addCard({
					cardName: card.name,
					setName: set.name,
					acquiredDate: date,
					pricePaid: price ? Number.parseFloat(price) : null,
					condition,
				})
				addToStore(acquired)
				success(`${card.name} ajoutée à votre collection`)
			}
			onAcquired()
		} catch (err) {
			setFormError(err instanceof Error ? err.message : "Erreur lors de l'ajout")
		} finally {
			setLoading(false)
		}
	}

	return (
		<Modal
			isOpen={!!card}
			onClose={onClose}
			title={modalTitle}
			initialFocusRef={dateInputRef}
		>
			<form onSubmit={handleSubmit}>
				<ModalBody>
					{formError && (
						<ErrorMessage role="alert">
							{formError}
						</ErrorMessage>
					)}

					{isFutureDate && (
						<InfoMessage>
							Date future détectée : cette carte sera ajoutée à vos achats planifiés
						</InfoMessage>
					)}

					<Field 
						label={isFutureDate ? "Date d'achat prévue" : "Date d'acquisition"} 
						htmlFor="acquire-date"
					>
						<Input
							ref={dateInputRef}
							id="acquire-date"
							type="date"
							value={date}
							onChange={e => setDate(e.target.value)}
							required
						/>
					</Field>

					<Field
						label={isFutureDate ? "Budget prévu (optionnel)" : "Prix payé (optionnel)"}
						htmlFor="acquire-price"
						hint="En euros"
					>
						<Input
							id="acquire-price"
							type="number"
							min="0"
							step="0.01"
							value={price}
							onChange={e => setPrice(e.target.value)}
							placeholder="0.00"
						/>
					</Field>

					{isFutureDate ? (
						<Field 
							label="Notes (optionnel)" 
							htmlFor="acquire-notes"
							hint="Rappel ou informations complémentaires"
						>
							<Textarea
								id="acquire-notes"
								value={notes}
								onChange={e => setNotes(e.target.value)}
								placeholder="Ex: Attendre la réédition, surveiller les prix..."
								maxLength={500}
							/>
						</Field>
					) : (
						<Field label="État de la carte" htmlFor="acquire-condition">
							<ConditionSelect
								id="acquire-condition"
								value={condition}
								onChange={setCondition}
							/>
						</Field>
					)}
				</ModalBody>
				<ModalFooter>
					<Button variant="secondary" onClick={onClose} type="button">
						Annuler
					</Button>
					<Button type="submit" loading={loading} disabled={loading}>
						{submitButtonText}
					</Button>
				</ModalFooter>
			</form>
		</Modal>
	)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetDetailPage() {
	const { setId } = useParams<{ setId: string }>()
	const navigate = useNavigate()
	const { toast } = useToast()

	const [pokemonSet, setPokemonSet] = useState<PokemonSet | null>(null)
	const [cards, setCards] = useState<PokemonCard[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [filter, setFilter] = useState<CardFilter>('all')
	const [rarityFilter, setRarityFilter] = useState<string>('all')
	const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
	const [isFollowed, setIsFollowed] = useState(false)

	const { acquiredMap, setCollection } = useCollectionStore()
	const { plannedMap, setPlanned, addPlanned: addToPlannedStore } = usePlannedStore()

	async function loadData() {
		if (!setId) return
		setIsLoading(true)
		setError(null)
		try {
			const [setData, collection, followedSets, plannedPurchases] = await Promise.all([
				cardsService.getSet(setId),
				collectionService.getCollection(),
				collectionService.getFollowedSets(),
				profileService.getPlanned(),
			])
			setPokemonSet(setData.set)
			setIsFollowed(followedSets.includes(setId))
			// Sort cards numerically by number field
			const sortedCards = [...setData.cards].sort((a, b) => {
				// Extract numeric part from card numbers (e.g., "10", "TG01" -> 1, "SWSH001" -> 1)
				const numA = Number.parseInt(a.number.replace(/\D/g, ''), 10) || 0
				const numB = Number.parseInt(b.number.replace(/\D/g, ''), 10) || 0
				
				if (numA !== numB) return numA - numB
				// If numbers are equal, fall back to alphabetic sort
				return a.number.localeCompare(b.number)
			})
			setCards(sortedCards)
			setCollection(collection)
			setPlanned(plannedPurchases)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Erreur de chargement')
		} finally {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		loadData()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [setId])

	function isOwnedCard(cardId: string): boolean {
		return (acquiredMap[cardId]?.length ?? 0) > 0
	}

	function isPlannedCard(cardId: string): boolean {
		return (plannedMap[cardId]?.length ?? 0) > 0
	}

	const ownedCount = cards.filter(c => isOwnedCard(c.id)).length

	// Extract unique rarities from cards and sort by rarity order
	const availableRarities = Array.from(new Set(cards.map(c => c.rarity))).sort((a, b) => {
		const orderA = rarityOrder[a] ?? 999 // Unknown rarities go to the end
		const orderB = rarityOrder[b] ?? 999
		if (orderA !== orderB) return orderA - orderB
		// If same order or both unknown, sort alphabetically
		return a.localeCompare(b)
	})
	const rarityOptions: FilterOption<string>[] = [
		{ value: 'all', label: 'Toutes les raretés' },
		...availableRarities.map(rarity => ({ value: rarity, label: rarity })),
	]

	// Apply filters
	const filteredCards = cards.filter(card => {
		// Filter by ownership status
		if (filter === 'owned' && !isOwnedCard(card.id)) return false
		if (filter === 'missing' && isOwnedCard(card.id)) return false
		
		// Filter by rarity
		if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false
		
		return true
	})

	function handleCardClick(card: PokemonCard) {
		if (isOwnedCard(card.id)) {
			toast(`${card.name} est déjà dans votre collection`)
			return
		}
		setSelectedCard(card)
	}

	async function handleToggleFollow() {
		if (!setId || !pokemonSet) return
		
		try {
			if (isFollowed) {
				await collectionService.unfollowSet(setId)
				setIsFollowed(false)
				toast(`Collection "${pokemonSet.name}" retirée de vos suivis`, 'success')
			} else {
				await collectionService.followSet(setId)
				setIsFollowed(true)
				toast(`Collection "${pokemonSet.name}" ajoutée à vos suivis`, 'success')
			}
		} catch (err) {
			toast(
				err instanceof Error ? err.message : 'Erreur lors de la modification',
				'error'
			)
		}
	}

	if (isLoading) return <Spinner center label="Chargement du set…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />

	return (
		<section aria-labelledby="set-detail-title">
			<BackLink type="button" onClick={() => navigate('/collections')}>
				← Collections
			</BackLink>

			<HeaderSection>
				<PageHeader
					title={pokemonSet?.name ?? setId ?? ''}
					id="set-detail-title"
					subtitle={pokemonSet?.series}
				/>
				<FollowButton
					$isFollowed={isFollowed}
					onClick={handleToggleFollow}
				>
					{isFollowed ? '✓ Suivie' : '+ Ajouter la collection'}
				</FollowButton>
			</HeaderSection>

			{pokemonSet && (
				<ProgressSection>
					<ProgressBar
						value={ownedCount}
						max={pokemonSet.total}
						label="Progression du set"
					/>
				</ProgressSection>
			)}

			<FilterBar
				options={filterOptions}
				value={filter}
				onChange={setFilter}
				label="Filtrer les cartes"
			/>

			<FilterBar
				options={rarityOptions}
				value={rarityFilter}
				onChange={setRarityFilter}
				label="Filtrer par rareté"
			/>

			{filteredCards.length === 0 ? (
				<EmptyState message="Aucune carte pour ce filtre." />
			) : (
				<CardGrid>
					{filteredCards.map(card => (
						<CardThumbnail
							key={card.id}
							card={card}
							owned={isOwnedCard(card.id)}
							planned={isPlannedCard(card.id)}
							onClick={() => handleCardClick(card)}
						/>
					))}
				</CardGrid>
			)}

			<AcquireModal
				card={selectedCard}
				set={pokemonSet}
				onClose={() => setSelectedCard(null)}
				onAcquired={() => setSelectedCard(null)}
				addToPlannedStore={addToPlannedStore}
			/>
		</section>
	)
}
