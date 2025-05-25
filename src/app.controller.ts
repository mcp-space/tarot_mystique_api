import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AppService } from './app.service'

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Root endpoint - Welcome to the mystical realm' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns a mystical welcome message',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        timestamp: { type: 'string' },
        version: { type: 'string' }
      }
    }
  })
  getWelcome() {
    return this.appService.getWelcome()
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns server health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        timestamp: { type: 'string' },
        uptime: { type: 'number' },
        memory: { type: 'object' }
      }
    }
  })
  getHealth() {
    return this.appService.getHealth()
  }
}
