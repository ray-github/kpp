import { Module } from '@nestjs/common'
import { MemberModule } from '../member/member.module'
import { UserController } from './user.controller'
import { UserService } from './user.service'

@Module({
  imports: [MemberModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
