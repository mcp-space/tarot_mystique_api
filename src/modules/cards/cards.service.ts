import { Injectable, NotFoundException, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PrismaService } from '../prisma/prisma.service'
import { Card } from '@prisma/client'

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name)

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 🎨 Get all Major Arcana cards
  async findAll(): Promise<Card[]> {
    const cacheKey = 'cards:all'
    
    // Try to get from cache first
    let cards = await this.cacheManager.get<Card[]>(cacheKey)
    
    if (!cards) {
      this.logger.log('🔍 Fetching all cards from database')
      
      cards = await this.prisma.executeWithRetry(
        () => this.prisma.card.findMany({
          orderBy: { arcanaId: 'asc' },
        })
      )
      
      // Cache the results
      await this.cacheManager.set(cacheKey, cards, 600) // 10 minutes
      this.logger.log(`✨ Cached ${cards.length} cards`)
    } else {
      this.logger.log(`🚀 Retrieved ${cards.length} cards from cache`)
    }
    
    return cards
  }

  // 🔍 Get a specific card by ID
  async findOne(id: number): Promise<Card> {
    const cacheKey = `card:${id}`
    
    // Try cache first
    let card = await this.cacheManager.get<Card>(cacheKey)
    
    if (!card) {
      this.logger.log(`🔍 Fetching card ${id} from database`)
      
      card = await this.prisma.executeWithRetry(
        () => this.prisma.card.findUnique({ 
          where: { id } 
        })
      )
      
      if (!card) {
        throw new NotFoundException(`💀 Card with ID ${id} not found in the mystical deck`)
      }
      
      // Cache the card
      await this.cacheManager.set(cacheKey, card, 600)
      this.logger.log(`✨ Cached card: ${card.name}`)
    } else {
      this.logger.log(`🚀 Retrieved card from cache: ${card.name}`)
    }
    
    return card
  }

  // 🔍 Get card by Arcana ID (0-21)
  async findByArcanaId(arcanaId: number): Promise<Card> {
    const cacheKey = `card:arcana:${arcanaId}`
    
    let card = await this.cacheManager.get<Card>(cacheKey)
    
    if (!card) {
      this.logger.log(`🔍 Fetching card with arcana ID ${arcanaId} from database`)
      
      card = await this.prisma.executeWithRetry(
        () => this.prisma.card.findUnique({ 
          where: { arcanaId } 
        })
      )
      
      if (!card) {
        throw new NotFoundException(`💀 Card with Arcana ID ${arcanaId} not found`)
      }
      
      await this.cacheManager.set(cacheKey, card, 600)
    }
    
    return card
  }

  // 🎲 Get random card(s)
  async getRandomCards(count: number = 1): Promise<Card[]> {
    if (count < 1 || count > 22) {
      throw new Error('💀 Invalid card count. Must be between 1 and 22')
    }
    
    this.logger.log(`🎲 Drawing ${count} random cards from the cosmic deck`)
    
    // Get all cards first
    const allCards = await this.findAll()
    
    // Shuffle and select random cards
    const shuffled = [...allCards].sort(() => Math.random() - 0.5)
    const selectedCards = shuffled.slice(0, count)
    
    this.logger.log(`✨ Drew cards: ${selectedCards.map(c => c.name).join(', ')}`)
    
    return selectedCards
  }

  // 🔍 Search cards by keyword
  async searchCards(query: string): Promise<Card[]> {
    const cacheKey = `search:${query.toLowerCase()}`
    
    let results = await this.cacheManager.get<Card[]>(cacheKey)
    
    if (!results) {
      this.logger.log(`🔍 Searching for cards with query: "${query}"`)
      
      results = await this.prisma.executeWithRetry(
        () => this.prisma.card.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { nameKr: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { descriptionKr: { contains: query, mode: 'insensitive' } },
              { keywords: { hasSome: [query.toLowerCase()] } },
              { keywordsKr: { hasSome: [query] } },
            ],
          },
          orderBy: { arcanaId: 'asc' },
        })
      )
      
      await this.cacheManager.set(cacheKey, results, 300) // 5 minutes cache
    }
    
    this.logger.log(`✨ Found ${results.length} cards matching "${query}"`)
    return results
  }

  // 📊 Get card statistics
  async getCardStats() {
    const cacheKey = 'cards:stats'
    
    let stats = await this.cacheManager.get(cacheKey)
    
    if (!stats) {
      this.logger.log('📊 Calculating card statistics')
      
      const [totalCards, mostDrawnCard] = await Promise.all([
        this.prisma.card.count(),
        this.prisma.drawnCard.groupBy({
          by: ['cardId'],
          _count: { cardId: true },
          orderBy: { _count: { cardId: 'desc' } },
          take: 1,
        }),
      ])
      
      let popularCard = null
      if (mostDrawnCard.length > 0) {
        popularCard = await this.findOne(mostDrawnCard[0].cardId)
      }
      
      stats = {
        totalCards,
        mostPopularCard: popularCard ? {
          name: popularCard.name,
          nameKr: popularCard.nameKr,
          timesDrawn: mostDrawnCard[0]._count.cardId,
        } : null,
        lastUpdated: new Date().toISOString(),
      }
      
      await this.cacheManager.set(cacheKey, stats, 300)
    }
    
    return stats
  }
}
