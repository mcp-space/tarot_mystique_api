import { Module } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'

import { ReadingsController } from './readings.controller'
import { ReadingsService } from './readings.service'
import { CardsModule } from '../cards/cards.module'
import { InterpretationsModule } from '../interpretations/interpretations.module'

@Module({
  imports: [
    CacheModule.register({
      ttl: 300, // 5 minutes cache for readings
    }),
    CardsModule,
    InterpretationsModule,
  ],
  controllers: [ReadingsController],
  providers: [ReadingsService],
  exports: [ReadingsService],
})
export class ReadingsModule {}
