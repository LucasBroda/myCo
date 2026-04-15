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
import { useCollectionStore } from '@store/collectionStore'
import { useToast } from '@hooks/useToast'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import styled from 'styled-components'

// ─── Layout ──────────────────────────────────────────────────────────────────

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

// ─── AcquireModal ─────────────────────────────────────────────────────────────

interface AcquireModalProps {
	card: PokemonCard | null
	setId: string
	onClose: () => void
	onAcquired: () => void
}

function AcquireModal({ card, setId, onClose, onAcquired }: AcquireModalProps) {
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
	const [price, setPrice] = useState('')
	const [condition, setCondition] = useState<CardCondition>('NM')
	const [loading, setLoading] = useState(false)
	const [formError, setFormError] = useState('')
	const { addCard: addToStore } = useCollectionStore()
	const { success } = useToast()
	const dateInputRef = useRef<HTMLInputElement>(null)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!card) return
		setFormError('')
		setLoading(true)
		try {
			const acquired = await collectionService.addCard({
				cardId: card.id,
				setId,
				acquiredDate: date,
				pricePaid: price ? parseFloat(price) : null,
				condition,
			})
			addToStore(acquired)
			success(`${card.name} ajoutée à votre collection`)
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
			title={card ? `Acquérir : ${card.name}` : ''}
			initialFocusRef={dateInputRef}
		>
			<form onSubmit={handleSubmit}>
				<ModalBody>
					{formError && (
						<p
							role="alert"
							style={{
								color: '#b91c1c',
								fontSize: '14px',
								margin: 0,
							}}
						>
							{formError}
						</p>
					)}

					<Field label="Date d'acquisition" htmlFor="acquire-date">
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
						label="Prix payé (optionnel)"
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

					<Field label="État de la carte" htmlFor="acquire-condition">
						<ConditionSelect
							id="acquire-condition"
							value={condition}
							onChange={setCondition}
						/>
					</Field>
				</ModalBody>
				<ModalFooter>
					<Button variant="secondary" onClick={onClose} type="button">
						Annuler
					</Button>
					<Button type="submit" loading={loading} disabled={loading}>
						{loading ? 'Ajout…' : 'Ajouter à la collection'}
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
	const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)

	const { acquiredMap, setCollection } = useCollectionStore()

	async function loadData() {
		if (!setId) return
		setIsLoading(true)
		setError(null)
		try {
			const [setData, collection] = await Promise.all([
				cardsService.getSet(setId),
				collectionService.getCollection(),
			])
			setPokemonSet(setData.set)
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

	const ownedCount = cards.filter(c => isOwnedCard(c.id)).length

	const filteredCards = cards.filter(card => {
		if (filter === 'owned') return isOwnedCard(card.id)
		if (filter === 'missing') return !isOwnedCard(card.id)
		return true
	})

	function handleCardClick(card: PokemonCard) {
		if (isOwnedCard(card.id)) {
			toast(`${card.name} est déjà dans votre collection`)
			return
		}
		setSelectedCard(card)
	}

	if (isLoading) return <Spinner center label="Chargement du set…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />

	return (
		<section aria-labelledby="set-detail-title">
			<BackLink type="button" onClick={() => navigate('/collections')}>
				← Collections
			</BackLink>

			<PageHeader
				title={pokemonSet?.name ?? setId ?? ''}
				id="set-detail-title"
				subtitle={pokemonSet?.series}
			/>

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

			{filteredCards.length === 0 ? (
				<EmptyState message="Aucune carte pour ce filtre." />
			) : (
				<CardGrid>
					{filteredCards.map(card => (
						<CardThumbnail
							key={card.id}
							card={card}
							owned={isOwnedCard(card.id)}
							onClick={() => handleCardClick(card)}
						/>
					))}
				</CardGrid>
			)}

			<AcquireModal
				card={selectedCard}
				setId={setId ?? ''}
				onClose={() => setSelectedCard(null)}
				onAcquired={() => setSelectedCard(null)}
			/>
		</section>
	)
}
