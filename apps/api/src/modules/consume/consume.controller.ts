import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { ConsumeService } from './consume.service'

@ApiTags('Consume')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('consume')
export class ConsumeController {
  constructor(private readonly consumeService: ConsumeService) {}

  @Get('codes')
  @ApiOperation({ summary: '可核销课消码列表' })
  getCodes(@CurrentUser() user: AuthUserPayload) {
    return this.consumeService.getConsumeCodes(user.sub)
  }

  @Get('code')
  @ApiOperation({ summary: '获取单个课消码' })
  @ApiQuery({ name: 'enrollmentId', required: true })
  getCode(
    @CurrentUser() user: AuthUserPayload,
    @Query('enrollmentId') enrollmentId: string,
  ) {
    return this.consumeService.getConsumeCode(user.sub, enrollmentId)
  }
}
