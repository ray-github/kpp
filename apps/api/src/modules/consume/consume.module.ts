import { Module } from '@nestjs/common'
import { ConsumeController } from './consume.controller'
import { ConsumeService } from './consume.service'

@Module({
  controllers: [ConsumeController],
  providers: [ConsumeService],
})
export class ConsumeModule {}
