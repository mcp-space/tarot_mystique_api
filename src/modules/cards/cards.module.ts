import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'

import { CardsController } from './cards.controller'
import { CardsService } from './cards.service'

@Module({
  imports: [
    CacheModule.register({
      ttl: 600, // 10 minutes cache for card data
    })
  ],
  controllers: [CardsController],
  providers: [CardsService],
  exports: [CardsService],
})
export class CardsModule {}
