import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger'

import { CardsService } from './cards.service'
import { Card } from '@prisma/client'

@ApiTags('cards')
@Controller('cards')
@UseGuards(ThrottlerGuard)
export class CardsController {
  private readonly logger = new Logger(CardsController.name)

  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get all Major Arcana cards',
    description: 'Retrieve the complete collection of 22 Major Arcana tarot cards with their mystical properties'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all cards',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          arcanaId: { type: 'number', example: 0 },
          name: { type: 'string', example: 'The Fool' },
          nameKr: { type: 'string', example: '광대' },
          imageUrl: { type: 'string', example: '/images/tarot/00-fool.jpg' },
          keywords: { type: 'array', items: { type: 'string' } },
          keywordsKr: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          descriptionKr: { type: 'string' },
          element: { type: 'string', nullable: true },
          planet: { type: 'string', nullable: true },
          numerology: { type: 'number' },
          symbolism: { type: 'array', items: { type: 'string' } }
        }
      }
    }
  })
  async findAll(): Promise<Card[]> {
    this.logger.log('🔮 Revealing all cards from the mystical deck')
    return this.cardsService.findAll()
  }

  @Get('random')
  @ApiOperation({ 
    summary: 'Draw random tarot cards',
    description: 'Draw one or more random cards from the Major Arcana deck'
  })
  @ApiQuery({
    name: 'count',
    required: false,
    type: 'number',
    description: 'Number of cards to draw (1-22)',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully drew random cards',
    schema: {
      type: 'object',
      properties: {
        cards: {
          type: 'array',
          items: { type: 'object' }
        },
        drawnAt: { type: 'string' },
        cosmic_message: { type: 'string' }
      }
    }
  })
  async drawRandomCards(@Query('count', new ParseIntPipe({ 
    errorHttpStatusCode: HttpStatus.BAD_REQUEST,
    optional: true 
  })) count: number = 1) {
    this.logger.log(`🎲 Drawing ${count} cards from the cosmic deck`)
    
    const cards = await this.cardsService.getRandomCards(count)
    
    return {
      cards,
      drawnAt: new Date().toISOString(),
      cosmic_message: count === 1 
        ? '🌟 The universe has chosen your destiny card'
        : `✨ ${count} cards reveal the threads of your fate`
    }
  }

  @Get('search')
  @ApiOperation({ 
    summary: 'Search tarot cards',
    description: 'Search for cards by name, keywords, or descriptions'
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: 'string',
    description: 'Search query',
    example: 'love'
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        results: { type: 'array', items: { type: 'object' } },
        count: { type: 'number' }
      }
    }
  })
  async searchCards(@Query('q') query: string) {
    this.logger.log(`🔍 Searching the mystical library for: "${query}"`)
    
    if (!query || query.trim().length < 2) {
      return {
        query,
        results: [],
        count: 0,
        message: '💀 Query too short. The spirits require at least 2 characters'
      }
    }
    
    const results = await this.cardsService.searchCards(query.trim())
    
    return {
      query,
      results,
      count: results.length,
      message: results.length > 0 
        ? `✨ The cosmic search revealed ${results.length} mystical matches`
        : '🌙 The spirits found no matches for your query'
    }
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get card statistics',
    description: 'Retrieve statistical information about card usage and popularity'
  })
  @ApiResponse({
    status: 200,
    description: 'Card statistics',
    schema: {
      type: 'object',
      properties: {
        totalCards: { type: 'number' },
        mostPopularCard: { type: 'object', nullable: true },
        lastUpdated: { type: 'string' }
      }
    }
  })
  async getStats() {
    this.logger.log('📊 Consulting the cosmic analytics')
    return this.cardsService.getCardStats()
  }

  @Get('arcana/:arcanaId')
  @ApiOperation({ 
    summary: 'Get card by Arcana ID',
    description: 'Retrieve a specific card by its Arcana number (0-21)'
  })
  @ApiParam({
    name: 'arcanaId',
    type: 'number',
    description: 'Major Arcana number (0-21)',
    example: 0
  })
  @ApiResponse({
    status: 200,
    description: 'Card found',
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found'
  })
  async findByArcanaId(@Param('arcanaId', ParseIntPipe) arcanaId: number): Promise<Card> {
    this.logger.log(`🔍 Seeking the card of Arcana ${arcanaId}`)
    return this.cardsService.findByArcanaId(arcanaId)
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get card by ID',
    description: 'Retrieve a specific tarot card by its database ID'
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'Card database ID',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Card found',
  })
  @ApiResponse({
    status: 404,
    description: 'Card not found in the mystical deck'
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Card> {
    this.logger.log(`🔍 Revealing the secrets of card ${id}`)
    return this.cardsService.findOne(id)
  }
}
