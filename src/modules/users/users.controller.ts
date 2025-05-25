import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'

import { UsersService } from './users.service'

class CreateUserDto {
  email?: string
  username?: string
  displayName?: string
  preferredLanguage?: string
  timezone?: string
}

class UpdateUserDto {
  displayName?: string
  preferredLanguage?: string
  timezone?: string
  isPublic?: boolean
  newsletter?: boolean
}

@ApiTags('users')
@Controller('users')
@UseGuards(ThrottlerGuard)
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ 
    summary: 'Create a new user (mystical seeker)',
    description: 'Welcome a new seeker to the mystical realm of tarot'
  })
  @ApiBody({
    description: 'User profile information',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email', example: 'seeker@mystical.realm' },
        username: { type: 'string', example: 'mystic_seeker' },
        displayName: { type: 'string', example: 'Mystical Seeker' },
        preferredLanguage: { type: 'string', default: 'ko', example: 'ko' },
        timezone: { type: 'string', default: 'Asia/Seoul', example: 'Asia/Seoul' }
      }
    }
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    this.logger.log('✨ Welcoming a new seeker to the mystical realm')
    return this.usersService.create(createUserDto)
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user profile',
    description: 'Retrieve a user profile with recent reading history'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: 'user123'
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found in the mystical realm'
  })
  async findOne(@Param('id') id: string) {
    this.logger.log(`🔍 Seeking user ${id} in the cosmic records`)
    return this.usersService.findOne(id)
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Update user profile',
    description: 'Update user profile information'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: 'user123'
  })
  @ApiBody({
    description: 'Profile updates',
    schema: {
      type: 'object',
      properties: {
        displayName: { type: 'string', example: 'Updated Mystic Name' },
        preferredLanguage: { type: 'string', example: 'ko' },
        timezone: { type: 'string', example: 'Asia/Seoul' },
        isPublic: { type: 'boolean', example: false },
        newsletter: { type: 'boolean', example: true }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`✨ Updating profile for user ${id}`)
    return this.usersService.update(id, updateUserDto)
  }

  @Get(':id/stats')
  @ApiOperation({ 
    summary: 'Get user statistics',
    description: 'Retrieve detailed statistics and cosmic insights for a user'
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'User ID',
    example: 'user123'
  })
  @ApiResponse({
    status: 200,
    description: 'User statistics and cosmic insights',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        totalReadings: { type: 'number' },
        lastReading: { type: 'string', nullable: true },
        favoriteSpread: { type: 'string', nullable: true },
        mysticLevel: { type: 'string' },
        cosmicInsight: { type: 'string' }
      }
    }
  })
  async getStats(@Param('id') id: string) {
    this.logger.log(`📊 Calculating cosmic statistics for user ${id}`)
    return this.usersService.getUserStats(id)
  }
}
