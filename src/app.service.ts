import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getWelcome() {
    return {
      message: '🔮 Welcome to the Tarot Mystique API - Ancient Wisdom Through Modern Technology',
      description: 'Unveil the secrets of your destiny through our mystical tarot card API',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      endpoints: {
        documentation: '/api/docs',
        health: '/health',
        cards: '/api/cards',
        readings: '/api/readings'
      },
      mysticalQuote: 'The cards reveal what the soul already knows...'
    }
  }

  getHealth() {
    const uptime = process.uptime()
    const memory = process.memoryUsage()
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      memory: {
        rss: `${Math.floor(memory.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.floor(memory.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.floor(memory.heapTotal / 1024 / 1024)} MB`
      },
      mysticStatus: '🌙 The cosmic energies are flowing perfectly'
    }
  }
}
