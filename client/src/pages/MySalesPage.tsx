import type { PokemonCard, PotentialSale, CardCondition } from '@/types/models'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorState } from '@components/ui/ErrorState'
import { Spinner } from '@components/ui/Spinner'
import { Input } from '@components/ui/Input'
import { Button } from '@components/ui/Button'
import { PageHeader } from '@components/layout/PageHeader'
import { CardThumbnail } from '@components/pokemon/CardThumbnail'
import { ConditionSelect } from '@components/pokemon/ConditionSelect'
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

// ─── Page Component ───────────────────────────────────────────────────────────

export default function MySalesPage() {
	const [cards, setCards] = useState<PokemonCard[]>([])
	const [sales, setSales] = useState<PotentialSale[]>([])
	const [soldCardsDetails, setSoldCardsDetails] = useState<Map<string, PokemonCard>>(new Map())
	const [searchQuery, setSearchQuery] = useState('')
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)
	const [showAddModal, setShowAddModal] = useState(false)
	const [editingSale, setEditingSale] = useState<PotentialSale | null>(null)
	
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
			// Charger les ventes potentielles
			const potentialSales = await salesService.getPotentialSales()
			setSales(potentialSales)

			// Charger les détails des cartes vendues
			const soldCardsMap = new Map<string, PokemonCard>()
			const uniqueSets = new Set(potentialSales.map(sale => sale.setId))
			
			for (const setId of uniqueSets) {
				try {
					const setData = await cardsService.getSet(setId)
					// Ajouter toutes les cartes de ce set qui sont vendues
					for (const card of setData.cards) {
						if (potentialSales.some(sale => sale.cardId === card.id)) {
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

	const filteredCards = useMemo(() => {
		if (!searchQuery) return cards
		const normalizedQuery = normalizeString(searchQuery)
		return cards.filter(card => {
			const normalizedName = normalizeString(card.name)
			const normalizedSet = normalizeString(card.set.name)
			return normalizedName.includes(normalizedQuery) || normalizedSet.includes(normalizedQuery)
		})
	}, [cards, searchQuery])

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

	function handleEditSale(sale: PotentialSale) {
		setEditingSale(sale)
		setSalePrice(sale.salePrice.toString())
		setSaleDate(sale.saleDate)
		setCondition(sale.condition)
		setNotes(sale.notes || '')
		setShowAddModal(true)
	}

	async function handleSubmit() {
		if (!salePrice || !saleDate) {
			alert('Veuillez remplir tous les champs obligatoires')
			return
		}

		try {
			if (editingSale) {
				// Mise à jour
				await salesService.updatePotentialSale(editingSale.id, {
					salePrice: Number.parseFloat(salePrice),
					saleDate,
					condition,
					notes: notes || null,
				})
			} else if (selectedCard) {
				// Ajout
				await salesService.addPotentialSale({
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

	// Calculer les statistiques
	const totalSales = sales?.length ?? 0
	const totalValue = sales?.reduce((sum, sale) => sum + sale.salePrice, 0) ?? 0

	if (isLoading) return <Spinner center label="Chargement…" />
	if (error) return <ErrorState message={error} onRetry={loadData} />

	return (
		<PageContainer>
			<section aria-labelledby="sales-title">
				<PageHeader
					title="Mes ventes potentielles"
					id="sales-title"
					subtitle="Gérez vos ventes de cartes"
				/>

				<StatsContainer>
					<StatItem>
						<StatLabel>Ventes enregistrées</StatLabel>
						<StatValue>{totalSales}</StatValue>
					</StatItem>
					<StatItem>
						<StatLabel>Valeur totale estimée</StatLabel>
						<StatValue>{totalValue.toFixed(2)} €</StatValue>
					</StatItem>
				</StatsContainer>

				{/* Liste des ventes potentielles */}
				<SectionCard>
					<SectionTitle>Ventes enregistrées</SectionTitle>
					
					{(sales?.length ?? 0) === 0 ? (
						<EmptyState message="Aucune vente enregistrée. Sélectionnez une carte ci-dessous pour commencer." />
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
									{sales?.map(sale => {
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

				{/* Sélection des cartes */}
				<SectionCard>
					<SectionTitle>Ajouter une vente</SectionTitle>
					<p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
						Sélectionnez une carte de votre collection pour l'ajouter aux ventes potentielles
					</p>
					
					<SearchContainer>
						<Input
							placeholder="Rechercher une carte…"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</SearchContainer>

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
							<Label htmlFor="saleDate">Date de vente prévue *</Label>
							<Input
								id="saleDate"
								type="date"
								value={saleDate}
								onChange={(e) => setSaleDate(e.target.value)}
							/>
						</FormGroup>

						<FormGroup>
							<Label htmlFor="condition">Condition *</Label>
							<ConditionSelect
							id="condition"
							value={condition}
							onChange={(value) => setCondition(value as CardCondition)}
						/>
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
