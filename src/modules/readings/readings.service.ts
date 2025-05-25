import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { Inject } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PrismaService } from '../prisma/prisma.service'
import { CardsService } from '../cards/cards.service'
import { InterpretationsService } from '../interpretations/interpretations.service'
import { Reading, DrawnCard, SpreadType } from '@prisma/client'

interface CreateReadingDto {
  spreadType: SpreadType
  question?: string
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

interface ReadingResult {
  id: string
  spreadType: SpreadType
  question?: string
  drawnCards: (DrawnCard & { card: any })[]
  overallMessage?: string
  advice?: string
  createdAt: Date
  cosmic_energy: string
}

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly cardsService: CardsService,
    private readonly interpretationsService: InterpretationsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // 🌟 Create a new tarot reading
  async createReading(data: CreateReadingDto): Promise<ReadingResult> {
    this.logger.log(`🔮 Creating new ${data.spreadType} reading`)
    
    try {
      // Validate spread type and get card count
      const cardCount = this.getCardCountForSpread(data.spreadType)
      
      // Create the reading record
      const reading = await this.prisma.reading.create({
        data: {
          spreadType: data.spreadType,
          question: data.question,
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      })
      
      // Draw random cards
      const cards = await this.cardsService.getRandomCards(cardCount)
      
      // Create drawn cards with positions
      const drawnCards = await Promise.all(
        cards.map(async (card, index) => {
          const reversed = Math.random() < 0.3 // 30% chance of reversed
          const positionName = this.getPositionName(data.spreadType, index)
          
          // Generate interpretation
          const interpretation = await this.interpretationsService.generateInterpretation(
            card,
            reversed,
            data.spreadType,
            index,
            data.question
          )
          
          return this.prisma.drawnCard.create({
            data: {
              cardId: card.id,
              readingId: reading.id,
              position: index,
              positionName,
              reversed,
              interpretation,
              confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
            },
            include: {
              card: true,
            },
          })
        })
      )
      
      // Generate overall reading message
      const { overallMessage, advice } = await this.interpretationsService.generateOverallReading(
        drawnCards,
        data.spreadType,
        data.question
      )
      
      // Update reading with overall interpretation
      const updatedReading = await this.prisma.reading.update({
        where: { id: reading.id },
        data: {
          overallMessage,
          advice,
          completedAt: new Date(),
        },
      })
      
      // Update statistics
      await this.updateReadingStats(data.spreadType)
      
      this.logger.log(`✨ Reading ${reading.id} completed with ${drawnCards.length} cards`)
      
      return {
        ...updatedReading,
        drawnCards,
        cosmic_energy: this.getCosmicEnergyLevel()
      }
      
    } catch (error) {
      this.logger.error(`💀 Failed to create reading: ${error.message}`)
      throw error
    }
  }

  // 🔍 Get reading by ID
  async findOne(id: string): Promise<ReadingResult> {
    const cacheKey = `reading:${id}`
    
    let reading = await this.cacheManager.get<ReadingResult>(cacheKey)
    
    if (!reading) {
      this.logger.log(`🔍 Retrieving reading ${id} from the akashic records`)
      
      const dbReading = await this.prisma.reading.findUnique({
        where: { id },
        include: {
          drawnCards: {
            include: {
              card: true,
            },
            orderBy: {
              position: 'asc',
            },
          },
        },
      })
      
      if (!dbReading) {
        throw new NotFoundException(`💀 Reading ${id} not found in the cosmic records`)
      }
      
      reading = {
        ...dbReading,
        cosmic_energy: this.getCosmicEnergyLevel()
      }
      
      // Cache for 5 minutes
      await this.cacheManager.set(cacheKey, reading, 300)
    }
    
    return reading
  }

  // 📋 Get user's reading history
  async findByUser(userId: string, limit: number = 10, offset: number = 0) {
    this.logger.log(`📋 Retrieving reading history for user ${userId}`)
    
    const [readings, total] = await Promise.all([
      this.prisma.reading.findMany({
        where: { userId },
        include: {
          drawnCards: {
            include: {
              card: {
                select: {
                  id: true,
                  name: true,
                  nameKr: true,
                  imageUrl: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.reading.count({ where: { userId } }),
    ])
    
    return {
      readings,
      total,
      page: Math.floor(offset / limit) + 1,
      pages: Math.ceil(total / limit),
      cosmic_wisdom: '🌙 Your journey through the cards reveals the threads of destiny'
    }
  }

  // 📊 Get reading statistics
  async getReadingStats() {
    const cacheKey = 'readings:stats'
    
    let stats = await this.cacheManager.get(cacheKey)
    
    if (!stats) {
      this.logger.log('📊 Consulting the cosmic statistics')
      
      const [totalReadings, todayReadings, spreadStats] = await Promise.all([
        this.prisma.reading.count(),
        this.prisma.reading.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        this.prisma.reading.groupBy({
          by: ['spreadType'],
          _count: { spreadType: true },
        }),
      ])
      
      stats = {
        totalReadings,
        todayReadings,
        spreadStats: spreadStats.reduce((acc, stat) => {
          acc[stat.spreadType] = stat._count.spreadType
          return acc
        }, {} as Record<string, number>),
        lastUpdated: new Date().toISOString(),
        cosmic_insight: '🌟 The patterns of destiny flow through time'
      }
      
      await this.cacheManager.set(cacheKey, stats, 300)
    }
    
    return stats
  }

  // 📊 Private helper methods
  private getCardCountForSpread(spreadType: SpreadType): number {
    switch (spreadType) {
      case 'SINGLE':
        return 1
      case 'THREE_CARD':
        return 3
      case 'CELTIC_CROSS':
        return 10
      default:
        throw new BadRequestException(`💀 Unknown spread type: ${spreadType}`)
    }
  }

  private getPositionName(spreadType: SpreadType, position: number): string {
    const positions: Record<SpreadType, string[]> = {
      SINGLE: ['오늘의 메시지'],
      THREE_CARD: ['과거', '현재', '미래'],
      CELTIC_CROSS: [
        '현재 상황', '가능한 결과', '과거의 영향', '잠재의식',
        '가능한 미래', '당신의 접근법', '외부 영향', '희망과 두려움',
        '최종 결과', '조언'
      ],
    }
    
    return positions[spreadType]?.[position] || `위치 ${position + 1}`
  }

  private getCosmicEnergyLevel(): string {
    const energies = [
      '🌙 Mystical lunar energy flows strong',
      '✨ Stellar alignments favor your reading',
      '🔮 Crystal clear cosmic vibrations',
      '🌟 Powerful celestial forces at work',
      '🌌 Universal energies in perfect harmony'
    ]
    
    return energies[Math.floor(Math.random() * energies.length)]
  }

  private async updateReadingStats(spreadType: SpreadType) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    try {
      await this.prisma.readingStats.upsert({
        where: { date: today },
        update: {
          totalReadings: { increment: 1 },
          [spreadType === 'SINGLE' ? 'singleCard' : 
           spreadType === 'THREE_CARD' ? 'threeCard' : 'celticCross']: { increment: 1 },
        },
        create: {
          date: today,
          totalReadings: 1,
          singleCard: spreadType === 'SINGLE' ? 1 : 0,
          threeCard: spreadType === 'THREE_CARD' ? 1 : 0,
          celticCross: spreadType === 'CELTIC_CROSS' ? 1 : 0,
        },
      })
    } catch (error) {
      this.logger.warn(`💀 Failed to update reading stats: ${error.message}`)
    }
  }
}
