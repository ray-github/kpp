import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { CartService } from './cart.service'

class AddCartItemDto {
  @IsString()
  courseId: string

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number
}

class UpdateCartItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number

  @IsOptional()
  @IsBoolean()
  selected?: boolean
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get('items')
  @ApiOperation({ summary: '购物车列表' })
  getItems(@CurrentUser() user: AuthUserPayload) {
    return this.cartService.getItems(user.sub)
  }

  @Post('items')
  @ApiOperation({ summary: '加入购物车' })
  addItem(@CurrentUser() user: AuthUserPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto.courseId, dto.quantity || 1)
  }

  @Patch('items/:id')
  @ApiOperation({ summary: '更新购物车项' })
  updateItem(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, id, dto)
  }

  @Delete('items/:id')
  @ApiOperation({ summary: '删除购物车项' })
  removeItem(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.cartService.removeItem(user.sub, id)
  }
}
