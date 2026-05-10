import type { PokemonCard, PlannedSale, CardCondition } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { Select, type SelectOption } from '@components/ui/Select'
import { FilterBar, type FilterOption } from '@components/layout/FilterBar'
import { PageHeader } from '@components/layout/PageHeader'
import { CardThumbnail } from '@components/pokemon/CardThumbnail'
import { collectionService } from '@services/collectionService'
import { cardsService } from '@services/cardsService'
import { salesService } from '@services/salesService'
import { useCollectionStore } from '@store/collectionStore'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

// ─── Styled Components ────────────────────────────────────────────────────────

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['8']};
	padding-bottom: ${({ theme }) => theme.spacing['8']};
`

const SectionCard = styled.div`
	padding: ${({ theme }) => theme.spacing['6']};
	background: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.xl};
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
	margin-top: ${({ theme }) => theme.spacing['4']};
`

const SectionTitle = styled.h2`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0 0 ${({ theme }) => theme.spacing['4']} 0;
`

const SearchContainer = styled.div`
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	max-width: 500px;
`

const CardGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: ${({ theme }) => theme.spacing['3']};
	margin-top: ${({ theme }) => theme.spacing['4']};
`

const CardSelectionOverlay = styled.div`
	position: relative;
	cursor: pointer;
	transition: transform 0.2s ease;

	&:hover {
		transform: scale(1.05);
	}
`

const SalesTable = styled.div`
	overflow-x: auto;
	margin-top: ${({ theme }) => theme.spacing['4']};
`

const Table = styled.table`
	width: 100%;
	border-collapse: collapse;
	background: ${({ theme }) => theme.colors.surface};
	border-radius: ${({ theme }) => theme.radii.lg};
	overflow: hidden;
`

const Thead = styled.thead`
	background: ${({ theme }) => theme.colors.surfaceElevated};
`

const Th = styled.th`
	padding: ${({ theme }) => theme.spacing['3']};
	text-align: left;
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.semibold};
	color: ${({ theme }) => theme.colors.textSecondary};
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const Tbody = styled.tbody``

const Tr = styled.tr`
	border-bottom: 1px solid ${({ theme }) => theme.colors.border};
	transition: background 0.2s ease;

	&:hover {
		background: ${({ theme }) => theme.colors.surfaceElevated};
	}

	&:last-child {
		border-bottom: none;
	}
`

const Td = styled.td`
	padding: ${({ theme }) => theme.spacing['3']};
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const CardInfoCell = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['3']};
`

const CardMiniature = styled.img`
	width: 40px;
	height: 56px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.sm};
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`

const CardInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: 2px;
`

const CardName = styled.span`
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const CardSet = styled.span`
	font-size: ${({ theme }) => theme.font.size.xs};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const ModalOverlay = styled.div`
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: ${({ theme }) => theme.spacing['4']};
`

const Modal = styled.div`
	background: ${({ theme }) => theme.colors.surface};
	border-radius: ${({ theme }) => theme.radii.xl};
	padding: ${({ theme }) => theme.spacing['6']};
	max-width: 500px;
	width: 100%;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`

const ModalHeader = styled.div`
	display: flex;
	align-items: center;
	gap: ${({ theme }) => theme.spacing['4']};
	margin-bottom: ${({ theme }) => theme.spacing['6']};
`

const ModalCardImage = styled.img`
	width: 80px;
	height: 112px;
	object-fit: cover;
	border-radius: ${({ theme }) => theme.radii.md};
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`

const ModalCardInfo = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
	flex: 1;
`

const ModalCardName = styled.h3`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
	margin: 0;
`

const ModalCardSet = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const FormGroup = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['2']};
	margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const Label = styled.label`
	font-size: ${({ theme }) => theme.font.size.sm};
	font-weight: ${({ theme }) => theme.font.weight.medium};
	color: ${({ theme }) => theme.colors.textPrimary};
`

const TextArea = styled.textarea`
	padding: ${({ theme }) => theme.spacing['3']};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.md};
	font-size: ${({ theme }) => theme.font.size.sm};
	font-family: inherit;
	background: ${({ theme }) => theme.colors.surface};
	color: ${({ theme }) => theme.colors.textPrimary};
	resize: vertical;
	min-height: 80px;
	transition: border-color 0.2s ease;

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.amber};
	}
`

const ModalActions = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing['3']};
	justify-content: flex-end;
	margin-top: ${({ theme }) => theme.spacing['6']};
`

const StatsContainer = styled.div`
	display: flex;
	gap: ${({ theme }) => theme.spacing['4']};
	margin-bottom: ${({ theme }) => theme.spacing['4']};
	padding: ${({ theme }) => theme.spacing['4']};
	background-color: ${({ theme }) => theme.colors.surfaceElevated};
	border: 1px solid ${({ theme }) => theme.colors.border};
	border-radius: ${({ theme }) => theme.radii.lg};
	flex-wrap: wrap;
`

const StatItem = styled.div`
	display: flex;
	flex-direction: column;
	gap: ${({ theme }) => theme.spacing['1']};
`

const StatLabel = styled.span`
	font-size: ${({ theme }) => theme.font.size.sm};
	color: ${({ theme }) => theme.colors.textSecondary};
`

const StatValue = styled.span`
	font-size: ${({ theme }) => theme.font.size.xl};
	font-weight: ${({ theme }) => theme.font.weight.bold};
	color: ${({ theme }) => theme.colors.textPrimary};
`

// ─── Helper Functions ─────────────────────────────────────────────────────────

function normalizeString(str: string | undefined | null): string {
	if (!str) return ''
	return str
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.trim()
}
// Rarity order from most common to rarest
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
// ─── Page Component ───────────────────────────────────────────────────────────

export default function MySalesPage() {
	const [cards, setCards] = useState<PokemonCard[]>([])
	const [sales, setSales] = useState<PlannedSale[]>([])
	const [soldCardsDetails, setSoldCardsDetails] = useState<Map<string, PokemonCard>>(new Map())
	const [searchQuery, setSearchQuery] = useState('')
	const [rarityFilter, setRarityFilter] = useState<string>('all')
	const [setFilter, setSetFilter] = useState<string>('all')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingSale, setEditingSale] = useState<PlannedSale | null>(null)
	
	// Form state
	const [salePrice, setSalePrice] = useState<string>('')
	const [saleDate, setSaleDate] = useState<string>(new Date().toISOString().split('T')[0])
	const [condition, setCondition] = useState<CardCondition>('NM')
	const [notes, setNotes] = useState<string>('')
	
	const { acquiredMap, setCollection } = useCollectionStore()

	async function loadData() {
		setIsLoading(true)
		setError(null)
		try {
			// Charger les ventes planifiées
			const plannedSales = await salesService.getPlannedSales()
			setSales(plannedSales)

			// Charger les détails des cartes vendues
			const soldCardsMap = new Map<string, PokemonCard>()
			const uniqueSets = new Set(plannedSales.map(sale => sale.setId))
			
			for (const setId of uniqueSets) {
				try {
					const setData = await cardsService.getSet(setId)
					// Ajouter toutes les cartes de ce set qui sont vendues
					for (const card of setData.cards) {
						if (plannedSales.some(sale => sale.cardId === card.id)) {
							soldCardsMap.set(card.id, card)
						}
					}
				} catch (err) {
					console.error(`Error loading set ${setId}:`, err)
				}
			}
			setSoldCardsDetails(soldCardsMap)

			// Charger la collection
			const collection = await collectionService.getCollection()
			setCollection(collection)

			// Récupérer les IDs des cartes possédées directement depuis collection
			if (collection.length === 0) {
				setCards([])
				setIsLoading(false)
				return
			}

			// Récupérer les détails des cartes
			const cardsBySet = new Map<string, string[]>()
			for (const card of collection) {
				if (!cardsBySet.has(card.setId)) {
					cardsBySet.set(card.setId, [])
				}
				cardsBySet.get(card.setId)?.push(card.cardId)
			}

			const allCardsPromises = Array.from(cardsBySet.entries()).map(async ([setId]) => {
				const setData = await cardsService.getSet(setId)
				return setData
			})

			const allSetsData = await Promise.all(allCardsPromises)
			const allCards = allSetsData.flatMap(setData => setData.cards)
			
			// Créer une map des cartes possédées
			const ownedCardIds = new Set(collection.map(c => c.cardId))
			const ownedCards = allCards.filter(card => ownedCardIds.has(card.id))

			// Trier par nom
			const sortedCards = [...ownedCards].sort((a, b) => a.name.localeCompare(b.name))

			setCards(sortedCards)
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

	// Extract unique rarities from cards and sort by rarity order
	const availableRarities = useMemo(() => {
		return Array.from(new Set(cards.map(c => c.rarity))).sort((a, b) => {
			const orderA = rarityOrder[a] ?? 999
			const orderB = rarityOrder[b] ?? 999
			if (orderA !== orderB) return orderA - orderB
			return a.localeCompare(b)
		})
	}, [cards])

	const rarityOptions: FilterOption<string>[] = useMemo(() => {
		return [
			{ value: 'all', label: 'Toutes les raretés' },
			...availableRarities.map(rarity => ({ 
				value: rarity, 
				label: rarity || 'Autres'
			})),
		]
	}, [availableRarities])

	// Extract unique sets from cards and sort alphabetically
	const availableSets = useMemo(() => {
		const setIds = Array.from(new Set(cards.map(c => c.set.id)))
		return setIds
			.map(setId => {
				const card = cards.find(c => c.set.id === setId)
				return {
					id: setId,
					name: card?.set.name || setId,
				}
			})
			.sort((a, b) => a.name.localeCompare(b.name))
	}, [cards])

	const setOptions: SelectOption<string>[] = useMemo(() => {
		return [
			{ value: 'all', label: 'Toutes les collections' },
			...availableSets.map(set => ({ value: set.id, label: set.name })),
		]
	}, [availableSets])


	// Apply filters to cards
	const filteredCards = useMemo(() => {
		return cards.filter(card => {
			// Filter by search query
			if (searchQuery) {
				const normalizedQuery = normalizeString(searchQuery)
				const normalizedName = normalizeString(card.name)
				const normalizedSet = normalizeString(card.set.name)
				if (!normalizedName.includes(normalizedQuery) && !normalizedSet.includes(normalizedQuery)) {
					return false
				}
			}
			
			// Filter by rarity
			if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false
			
			// Filter by set
			if (setFilter !== 'all' && card.set.id !== setFilter) return false
			
			return true
		})
	}, [cards, searchQuery, rarityFilter, setFilter])

	function handleCardSelect(card: PokemonCard) {
		setSelectedCard(card)
		setShowAddModal(true)
		// Récupérer les acquisitions de cette carte pour pré-remplir la condition
		const cardAcquisitions = acquiredMap[card.id]
		if (cardAcquisitions && cardAcquisitions.length > 0) {
			setCondition(cardAcquisitions[0].condition)
		}
		// Réinitialiser le formulaire
		setSalePrice('')
		setSaleDate(new Date().toISOString().split('T')[0])
		setNotes('')
	}

	function handleEditSale(sale: PlannedSale) {
		setEditingSale(sale)
		setSalePrice(sale.salePrice.toString())
		// Extraire seulement la partie date (YYYY-MM-DD) pour l'input type="date"
		setSaleDate(sale.saleDate.split('T')[0])
		setCondition(sale.condition)
		setNotes(sale.notes || '')
		setShowAddModal(true)
	}

	// Calculer les options de condition disponibles pour la carte sélectionnée
	const availableConditions = useMemo(() => {
		if (!selectedCard || editingSale) return []
		const cardAcquisitions = acquiredMap[selectedCard.id] || []
		// Récupérer les conditions uniques des cartes possédées
		const conditions = Array.from(new Set(cardAcquisitions.map(acq => acq.condition)))
		return conditions
	}, [selectedCard, editingSale, acquiredMap])

	const conditionOptions: SelectOption<CardCondition>[] = useMemo(() => {
		const allConditions: SelectOption<CardCondition>[] = [
			{ value: 'Mint', label: 'Mint' },
			{ value: 'NM', label: 'Near Mint (NM)' },
			{ value: 'LP', label: 'Lightly Played (LP)' },
			{ value: 'MP', label: 'Moderately Played (MP)' },
			{ value: 'HP', label: 'Heavily Played (HP)' },
			{ value: 'Damaged', label: 'Damaged' },
		]
		
		// En mode édition, montrer toutes les options
		if (editingSale) return allConditions
		
		// Filtrer pour ne garder que les conditions disponibles
		if (availableConditions.length === 0) return allConditions
		return allConditions.filter(opt => availableConditions.includes(opt.value))
	}, [availableConditions, editingSale])

	// Vérifier si la condition doit être bloquée (un seul exemplaire OU mode édition)
	const isConditionLocked = useMemo(() => {
		// En mode édition, toujours bloquer (la carte est déjà sortie de la collection)
		if (editingSale) return true

		// En mode ajout, bloquer si on a qu'un seul exemplaire
		if (!selectedCard) return false
		const cardAcquisitions = acquiredMap[selectedCard.id] || []
		return cardAcquisitions.length === 1
	}, [selectedCard, editingSale, acquiredMap])

	// Obtenir le label de la condition pour l'affichage en mode verrouillé
	const lockedConditionLabel = useMemo(() => {
		const conditionOption = conditionOptions.find(opt => opt.value === condition)
		return conditionOption?.label || condition
	}, [condition, conditionOptions])

	async function handleSubmit() {
		if (!salePrice || !saleDate) {
			alert('Veuillez remplir tous les champs obligatoires')
			return
		}

		try {
			if (editingSale) {
				// Mise à jour
				await salesService.updatePlannedSale(editingSale.id, {
					salePrice: Number.parseFloat(salePrice),
					saleDate,
					condition,
					notes: notes || null,
				})
			} else if (selectedCard) {
				// Ajout
				await salesService.addPlannedSale({
					cardId: selectedCard.id,
					setId: selectedCard.set.id,
					salePrice: Number.parseFloat(salePrice),
					saleDate,
					condition,
					notes: notes || null,
				})
			}
			
			// Recharger les données
			await loadData()
			
			// Fermer le modal
			handleCloseModal()
		} catch (err) {
			console.error('Error saving sale:', err)
			alert('Erreur lors de l\'enregistrement de la vente')
		}
	}

	function handleCloseModal() {
		setShowAddModal(false)
		setSelectedCard(null)
		setEditingSale(null)
		setSalePrice('')
		setSaleDate(new Date().toISOString().split('T')[0])
		setCondition('NM')
		setNotes('')
	}

	// Calculer les statistiques (sur toutes les ventes)
	const totalSales = sales?.length ?? 0

	// Séparer ventes complétées et planifiées
	const completedSales = useMemo(() => sales.filter(s => s.completed), [sales])
	const plannedSales = useMemo(() => sales.filter(s => !s.completed), [sales])

	async function handleMarkAsCompleted(saleId: string) {
		if (!confirm('Marquer cette vente comme réalisée ?')) return
		
		try {
			await salesService.markSaleAsCompleted(saleId)
			await loadData()
		} catch (err) {
			console.error('Error marking sale as completed:', err)
			alert('Erreur lors de la mise à jour de la vente')
		}
	}

	if (isLoading) return <Spinner center label="Chargement…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />

	return (
		<PageContainer>
			<section aria-labelledby="sales-title">
				<PageHeader
					title="Mes ventes planifiées"
					id="sales-title"
					subtitle="Gérez vos ventes de cartes"
				/>

				<StatsContainer>
					<StatItem>
						<StatLabel>Ventes totales enregistrées</StatLabel>
						<StatValue>{totalSales}</StatValue>
					</StatItem>
					<StatItem>
						<StatLabel>Ventes réalisées</StatLabel>
						<StatValue>{completedSales.length}</StatValue>
					</StatItem>
					<StatItem>
						<StatLabel>Ventes planifiées</StatLabel>
						<StatValue>{plannedSales.length}</StatValue>
					</StatItem>
				</StatsContainer>

				{/* Section des ventes réalisées */}
				<SectionCard>
					<SectionTitle>Ventes réalisées ({completedSales.length})</SectionTitle>
					
					{completedSales.length === 0 ? (
						<EmptyState message="Aucune vente réalisée." />
					) : (
						<SalesTable>
							<Table>
								<Thead>
									<tr>
										<Th>Carte</Th>
										<Th>Condition</Th>
										<Th>Prix de vente</Th>
										<Th>Date</Th>
										<Th>Notes</Th>
										<Th>Actions</Th>
									</tr>
								</Thead>
								<Tbody>
									{completedSales.map(sale => {
										const soldCard = soldCardsDetails.get(sale.cardId)
										return (
											<Tr key={sale.id}>
												<Td>
													<CardInfoCell>
														{soldCard && (
															<CardMiniature 
																src={soldCard.images.small} 
																alt={soldCard.name}
															/>
														)}
														<CardInfo>
															<CardName>{sale.cardName}</CardName>
															<CardSet>{sale.setName}</CardSet>
														</CardInfo>
													</CardInfoCell>
												</Td>
												<Td>{sale.condition}</Td>
												<Td>{sale.salePrice.toFixed(2)} €</Td>
												<Td>{new Date(sale.saleDate).toLocaleDateString('fr-FR')}</Td>
												<Td>{sale.notes || '-'}</Td>
												<Td>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEditSale(sale)}
													>
														Modifier
													</Button>
												</Td>
											</Tr>
										)
									})}
								</Tbody>
							</Table>
						</SalesTable>
					)}
				</SectionCard>

				{/* Section des ventes planifiées */}
				<SectionCard>
					<SectionTitle>Ventes planifiées ({plannedSales.length})</SectionTitle>
					
					{plannedSales.length === 0 ? (
						<EmptyState message="Aucune vente planifiée. Sélectionnez une carte ci-dessous pour commencer." />
					) : (
						<SalesTable>
							<Table>
								<Thead>
									<tr>
										<Th>Carte</Th>
										<Th>Condition</Th>
										<Th>Prix de vente</Th>
										<Th>Date prévue</Th>
										<Th>Notes</Th>
										<Th>Actions</Th>
									</tr>
								</Thead>
								<Tbody>
									{plannedSales.map(sale => {
										const soldCard = soldCardsDetails.get(sale.cardId)
										return (
											<Tr key={sale.id}>
												<Td>
													<CardInfoCell>
														{soldCard && (
															<CardMiniature 
																src={soldCard.images.small} 
																alt={soldCard.name}
															/>
														)}
														<CardInfo>
															<CardName>{sale.cardName}</CardName>
															<CardSet>{sale.setName}</CardSet>
														</CardInfo>
													</CardInfoCell>
												</Td>
												<Td>{sale.condition}</Td>
												<Td>{sale.salePrice.toFixed(2)} €</Td>
												<Td>{new Date(sale.saleDate).toLocaleDateString('fr-FR')}</Td>
												<Td>{sale.notes || '-'}</Td>
												<Td>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleEditSale(sale)}
														style={{ marginRight: '0.5rem' }}
													>
														Modifier
													</Button>
													<Button
														variant="primary"
														size="sm"
														onClick={() => handleMarkAsCompleted(sale.id)}
													>
														✓ Réalisée
													</Button>
												</Td>
											</Tr>
										)
									})}
								</Tbody>
							</Table>
						</SalesTable>
					)}
				</SectionCard>

				{/* Sélection des cartes */}
				<SectionCard>
					<SectionTitle>Ajouter une vente</SectionTitle>
					<p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
						Sélectionnez une carte de votre collection pour l'ajouter aux ventes planifiées
					</p>
					
					<SearchContainer>
						<Input
							placeholder="Rechercher une carte…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							inputSize="md"
						/>
					</SearchContainer>

					<Select
						options={setOptions}
						value={setFilter}
						onChange={setSetFilter}
						label="Collection"
						id="set-filter-cards"
					/>

					<FilterBar
						options={rarityOptions}
						value={rarityFilter}
						onChange={setRarityFilter}
						label="Filtrer par rareté"
					/>

					{filteredCards.length === 0 ? (
						<EmptyState message="Aucune carte trouvée. Ajoutez des cartes à votre collection d'abord." />
					) : (
						<CardGrid>
							{filteredCards.map(card => (
								<CardSelectionOverlay
									key={card.id}
									onClick={() => handleCardSelect(card)}
								>
									<CardThumbnail card={card} />
								</CardSelectionOverlay>
							))}
						</CardGrid>
					)}
				</SectionCard>
			</section>

			{/* Modal d'ajout/modification */}
			{showAddModal && (
				<ModalOverlay onClick={handleCloseModal}>
					<Modal onClick={(e) => e.stopPropagation()}>
						<ModalHeader>
							{editingSale ? (
								<>
									<ModalCardImage 
										src={soldCardsDetails.get(editingSale.cardId)?.images.small || ''} 
										alt={editingSale.cardName}
									/>
									<ModalCardInfo>
										<ModalCardName>{editingSale.cardName}</ModalCardName>
										<ModalCardSet>{editingSale.setName}</ModalCardSet>
									</ModalCardInfo>
								</>
							) : selectedCard && (
								<>
									<ModalCardImage 
										src={selectedCard.images.small} 
										alt={selectedCard.name}
									/>
									<ModalCardInfo>
										<ModalCardName>{selectedCard.name}</ModalCardName>
										<ModalCardSet>{selectedCard.set.name}</ModalCardSet>
									</ModalCardInfo>
								</>
							)}
						</ModalHeader>

						<FormGroup>
							<Label htmlFor="salePrice">Prix de vente (€) *</Label>
							<Input
								id="salePrice"
								type="number"
								step="0.01"
								min="0"
								value={salePrice}
								onChange={(e) => setSalePrice(e.target.value)}
								placeholder="0.00"
							/>
						</FormGroup>

						<FormGroup>
						<Label htmlFor="saleDate">
							{editingSale?.completed ? 'Date de vente réalisée *' : 'Date de vente prévue *'}
						</Label>
						<Input
							id="saleDate"
							type="date"
							min={editingSale ? undefined : new Date().toISOString().split('T')[0]}
							value={saleDate}
							onChange={(e) => setSaleDate(e.target.value)}
							disabled={editingSale?.completed}
							style={editingSale?.completed ? { cursor: 'not-allowed', opacity: 0.7 } : undefined}
						/>
						{editingSale?.completed && (
							<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
								La date ne peut pas être modifiée pour une vente réalisée
							</span>
						)}
				</FormGroup>

				<FormGroup>
						{isConditionLocked ? (
							<>
								<Label>Condition *</Label>
								<Input
									value={lockedConditionLabel}
									disabled
									style={{ cursor: 'not-allowed', opacity: 0.7 }}
								/>
								{editingSale && (
									<span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
										La condition ne peut pas être modifiée pour une vente enregistrée
									</span>
								)}
							</>
						) : (
							<Select
									options={conditionOptions}
									value={condition}
									onChange={setCondition}
									label="Condition *"
									id="condition-select"
								/>
							)}
						</FormGroup>

						<FormGroup>
							<Label htmlFor="notes">Notes</Label>
							<TextArea
								id="notes"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Ajoutez des notes sur cette vente..."
							/>
						</FormGroup>
						<ModalActions>
							<Button variant="ghost" onClick={handleCloseModal}>
								Annuler
							</Button>
							<Button variant="primary" onClick={handleSubmit}>
								{editingSale ? 'Mettre à jour' : 'Ajouter'}
							</Button>
						</ModalActions>
					</Modal>
				</ModalOverlay>
			)}
		</PageContainer>
	)
}
