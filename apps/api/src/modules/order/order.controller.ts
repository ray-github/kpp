import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { OrderStatus } from '@prisma/client'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { OrderService } from './order.service'

@ApiTags('Order')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get('summary')
  @ApiOperation({ summary: '订单数量汇总' })
  getSummary(@CurrentUser() user: AuthUserPayload) {
    return this.orderService.getOrderSummary(user.sub)
  }

  @Get()
  @ApiOperation({ summary: '订单列表' })
  @ApiQuery({ name: 'status', required: false, enum: [...Object.values(OrderStatus), 'REFUND'] })
  getOrders(
    @CurrentUser() user: AuthUserPayload,
    @Query('status') status?: OrderStatus | 'REFUND',
  ) {
    return this.orderService.getOrders(user.sub, status)
  }

  @Get(':id')
  @ApiOperation({ summary: '订单详情' })
  getOrder(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.orderService.getOrder(user.sub, id)
  }

  @Post()
  @ApiOperation({ summary: '从购物车创建订单（模拟支付成功）' })
  createFromCart(@CurrentUser() user: AuthUserPayload) {
    return this.orderService.createFromCart(user.sub)
  }

  @Post(':id/review')
  @ApiOperation({ summary: '评价订单' })
  review(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.orderService.markReview(user.sub, id)
  }

  @Post(':id/refund')
  @ApiOperation({ summary: '申请退款' })
  refund(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.orderService.requestRefund(user.sub, id)
  }
}
