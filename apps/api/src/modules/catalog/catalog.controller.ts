import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { CourseType } from '@prisma/client'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { CatalogService } from './catalog.service'

@ApiTags('Catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('categories')
  @ApiOperation({ summary: '品类列表' })
  getCategories() {
    return this.catalogService.getCategories()
  }

  @Get('courses')
  @ApiOperation({ summary: '课程/老师/教练列表（分页）' })
  @ApiQuery({ name: 'type', required: false, enum: CourseType })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  getCourses(
    @Query('type') type?: CourseType,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.catalogService.getCourses(
      type,
      categoryId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10,
    )
  }

  @Get('courses/:id')
  @ApiOperation({ summary: '课程详情' })
  getCourseById(@Param('id') id: string) {
    return this.catalogService.getCourseById(id)
  }

  @Get('banners')
  @ApiOperation({ summary: '首页轮播' })
  getBanners() {
    return this.catalogService.getBanners()
  }

  @Get('coupons/newcomer')
  @ApiOperation({ summary: '新人券包' })
  getNewcomerCoupons() {
    return this.catalogService.getNewcomerCoupons()
  }

  @Post('coupons/:id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '领取优惠券' })
  claimCoupon(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
  ) {
    return this.catalogService.claimCoupon(user.sub, id)
  }
}
