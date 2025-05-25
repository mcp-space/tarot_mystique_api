import { Module } from '@nestjs/common'

import { InterpretationsService } from './interpretations.service'

@Module({
  providers: [InterpretationsService],
  exports: [InterpretationsService],
})
export class InterpretationsModule {}
