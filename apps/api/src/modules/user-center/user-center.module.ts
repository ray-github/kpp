import { Module } from '@nestjs/common'
import { UserCenterController } from './user-center.controller'
import { UserCenterService } from './user-center.service'

@Module({
  controllers: [UserCenterController],
  providers: [UserCenterService],
})
export class UserCenterModule {}
