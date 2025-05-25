import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    })
  }

  async onModuleInit() {
    try {
      // Listen for Prisma events
      this.$on('warn', (e) => {
        this.logger.warn(`🔮 Prisma Warning: ${e.message}`)
      })

      this.$on('info', (e) => {
        this.logger.log(`🔮 Prisma Info: ${e.message}`)
      })

      this.$on('error', (e) => {
        this.logger.error(`💀 Prisma Error: ${e.message}`)
      })

      // Connect to database
      await this.$connect()
      this.logger.log('🌙 Connected to the mystical database')
    } catch (error) {
      this.logger.error('💀 Failed to connect to database:', error)
      throw error
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect()
      this.logger.log('🌅 Disconnected from the mystical database')
    } catch (error) {
      this.logger.error('💀 Error disconnecting from database:', error)
    }
  }

  // 🔮 Helper method to handle database errors gracefully
  async executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
    let lastError: Error
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        this.logger.warn(`🔄 Database operation failed (attempt ${attempt}/${maxRetries}): ${error.message}`)
        
        if (attempt === maxRetries) {
          break
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    throw lastError!
  }
}
