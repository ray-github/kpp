import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { join } from 'path'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './redis/redis.module'
import { AuthModule } from './modules/auth/auth.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { CartModule } from './modules/cart/cart.module'
import { OrderModule } from './modules/order/order.module'
import { EnrollmentModule } from './modules/enrollment/enrollment.module'
import { UserModule } from './modules/user/user.module'
import { MemberModule } from './modules/member/member.module'
import { ConsumeModule } from './modules/consume/consume.module'
import { UserCenterModule } from './modules/user-center/user-center.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(process.cwd(), '.env'),
        join(__dirname, '..', '..', '..', '.env'),
      ],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrderModule,
    EnrollmentModule,
    UserModule,
    ConsumeModule,
    UserCenterModule,
  ],
})
export class AppModule {}
