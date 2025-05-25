import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Logger,
  HttpStatus,
  Req,
} from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger'
import { Request } from 'express'

import { ReadingsService } from './readings.service'
import { SpreadType } from '@prisma/client'

class CreateReadingDto {
  spreadType: SpreadType
  question?: string
  userId?: string
}

@ApiTags('readings')
@Controller('readings')
@UseGuards(ThrottlerGuard)
export class ReadingsController {
  private readonly logger = new Logger(ReadingsController.name)

  constructor(private readonly readingsService: ReadingsService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new tarot reading',
    description: 'Draw cards and receive mystical insights based on your question and chosen spread'
  })
  @ApiBody({
    description: 'Reading configuration',
    schema: {
      type: 'object',
      properties: {
        spreadType: {
          type: 'string',
          enum: ['SINGLE', 'THREE_CARD', 'CELTIC_CROSS'],
          example: 'SINGLE'
        },
        question: {
          type: 'string',
          example: '오늘 나에게 필요한 메시지는 무엇인가요?',
          maxLength: 500
        },
        userId: {
          type: 'string',
          required: false,
          description: 'Optional user ID for saving reading history'
        }
      },
      required: ['spreadType']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Reading created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        spreadType: { type: 'string' },
        question: { type: 'string' },
        drawnCards: { type: 'array' },
        overallMessage: { type: 'string' },
        advice: { type: 'string' },
        createdAt: { type: 'string' },
        cosmic_energy: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid spread type or question too long'
  })
  async create(@Body() createReadingDto: CreateReadingDto, @Req() req: Request) {
    this.logger.log(`🔮 Creating new ${createReadingDto.spreadType} reading`)
    
    // Extract session info
    const sessionData = {
      ...createReadingDto,
      sessionId: req.sessionID,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
    }
    
    return this.readingsService.createReading(sessionData)
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get reading statistics',
    description: 'Retrieve statistical data about all readings performed'
  })
  @ApiResponse({
    status: 200,
    description: 'Reading statistics',
    schema: {
      type: 'object',
      properties: {
        totalReadings: { type: 'number' },
        todayReadings: { type: 'number' },
        spreadStats: { type: 'object' },
        lastUpdated: { type: 'string' },
        cosmic_insight: { type: 'string' }
      }
    }
  })
  async getStats() {
    this.logger.log('📊 Consulting the cosmic statistics')
    return this.readingsService.getReadingStats()
  }

  @Get('user/:userId')
  @ApiOperation({ 
    summary: 'Get user reading history',
    description: 'Retrieve all readings for a specific user'
  })
  @ApiParam({
    name: 'userId',
    type: 'string',
    description: 'User ID',
    example: 'user123'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: 'number',
    description: 'Number of readings to return',
    example: 10
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: 'number',
    description: 'Number of readings to skip',
    example: 0
  })
  @ApiResponse({
    status: 200,
    description: 'User reading history',
  })
  async findByUser(
    @Param('userId') userId: string,
    @Query('limit', new ParseIntPipe({ 
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      optional: true 
    })) limit: number = 10,
    @Query('offset', new ParseIntPipe({ 
      errorHttpStatusCode: HttpStatus.BAD_REQUEST,
      optional: true 
    })) offset: number = 0
  ) {
    this.logger.log(`📚 Retrieving reading history for user ${userId}`)
    return this.readingsService.findByUser(userId, limit, offset)
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get reading by ID',
    description: 'Retrieve a specific reading with all its cards and interpretations'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'Reading ID',
    example: 'clr1234567890'
  })
  @ApiResponse({
    status: 200,
    description: 'Reading found',
  })
  @ApiResponse({
    status: 404,
    description: 'Reading not found in the cosmic records'
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Retrieving reading ${id} from the akashic records`)
    return this.readingsService.findOne(id)
  }
}
