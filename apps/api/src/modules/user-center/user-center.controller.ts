import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  FollowTargetType,
  MerchantType,
} from '@prisma/client'
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { UserCenterService } from './user-center.service'

class CourseIdDto {
  @IsString()
  courseId: string
}

class FollowDto {
  @IsEnum(FollowTargetType)
  targetType: FollowTargetType

  @IsString()
  targetId: string

  @IsString()
  targetName: string

  @IsOptional()
  @IsString()
  targetDesc?: string
}

class AppointmentDto {
  @IsOptional()
  @IsString()
  courseId?: string

  @IsString()
  @MinLength(1)
  title: string

  @IsDateString()
  appointmentAt: string

  @IsOptional()
  @IsString()
  remark?: string
}

class AddressDto {
  @IsString()
  name: string

  @IsString()
  phone: string

  @IsString()
  province: string

  @IsString()
  city: string

  @IsString()
  district: string

  @IsString()
  detail: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

class MerchantApplyDto {
  @IsEnum(MerchantType)
  type: MerchantType

  @IsString()
  name: string

  @IsString()
  contact: string

  @IsString()
  phone: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  description?: string
}

class InvoiceDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  taxNo?: string

  @IsOptional()
  @IsString()
  email?: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

class BankCardDto {
  @IsString()
  bankName: string

  @IsString()
  cardNo: string

  @IsString()
  holderName: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}

@ApiTags('UserCenter')
@Controller('user-center')
export class UserCenterController {
  constructor(private readonly userCenterService: UserCenterService) {}

  @Get('support')
  @ApiOperation({ summary: '客服信息' })
  getSupport() {
    return this.userCenterService.getSupportInfo()
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '浏览历史' })
  getHistory(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getBrowseHistory(user.sub)
  }

  @Post('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '记录浏览' })
  recordHistory(@CurrentUser() user: AuthUserPayload, @Body() dto: CourseIdDto) {
    return this.userCenterService.recordBrowseHistory(user.sub, dto.courseId)
  }

  @Delete('history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '清空浏览历史' })
  clearHistory(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.clearBrowseHistory(user.sub)
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFavorites(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getFavorites(user.sub)
  }

  @Get('favorites/check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  checkFavorite(
    @CurrentUser() user: AuthUserPayload,
    @Query('courseId') courseId: string,
  ) {
    return this.userCenterService.isFavorite(user.sub, courseId)
  }

  @Post('favorites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addFavorite(@CurrentUser() user: AuthUserPayload, @Body() dto: CourseIdDto) {
    return this.userCenterService.addFavorite(user.sub, dto.courseId)
  }

  @Delete('favorites/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeFavorite(
    @CurrentUser() user: AuthUserPayload,
    @Param('courseId') courseId: string,
  ) {
    return this.userCenterService.removeFavorite(user.sub, courseId)
  }

  @Get('follows')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getFollows(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getFollows(user.sub)
  }

  @Post('follows')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addFollow(@CurrentUser() user: AuthUserPayload, @Body() dto: FollowDto) {
    return this.userCenterService.addFollow(user.sub, dto)
  }

  @Delete('follows/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  removeFollow(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.userCenterService.removeFollow(user.sub, id)
  }

  @Get('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAppointments(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getAppointments(user.sub)
  }

  @Post('appointments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createAppointment(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: AppointmentDto,
  ) {
    return this.userCenterService.createAppointment(user.sub, dto)
  }

  @Post('appointments/:id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  cancelAppointment(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
  ) {
    return this.userCenterService.cancelAppointment(user.sub, id)
  }

  @Get('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getAddresses(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getAddresses(user.sub)
  }

  @Post('addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createAddress(@CurrentUser() user: AuthUserPayload, @Body() dto: AddressDto) {
    return this.userCenterService.createAddress(user.sub, dto)
  }

  @Put('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateAddress(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: AddressDto,
  ) {
    return this.userCenterService.updateAddress(user.sub, id, dto)
  }

  @Delete('addresses/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteAddress(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.userCenterService.deleteAddress(user.sub, id)
  }

  @Get('merchant/application')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getMerchantApplication(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getMerchantApplication(user.sub)
  }

  @Post('merchant/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  submitMerchantApplication(
    @CurrentUser() user: AuthUserPayload,
    @Body() dto: MerchantApplyDto,
  ) {
    return this.userCenterService.submitMerchantApplication(user.sub, dto)
  }

  @Get('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getInvoices(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getInvoices(user.sub)
  }

  @Post('invoices')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createInvoice(@CurrentUser() user: AuthUserPayload, @Body() dto: InvoiceDto) {
    return this.userCenterService.createInvoice(user.sub, dto)
  }

  @Put('invoices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  updateInvoice(
    @CurrentUser() user: AuthUserPayload,
    @Param('id') id: string,
    @Body() dto: InvoiceDto,
  ) {
    return this.userCenterService.updateInvoice(user.sub, id, dto)
  }

  @Delete('invoices/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteInvoice(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.userCenterService.deleteInvoice(user.sub, id)
  }

  @Get('bank-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  getBankCards(@CurrentUser() user: AuthUserPayload) {
    return this.userCenterService.getBankCards(user.sub)
  }

  @Post('bank-cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  addBankCard(@CurrentUser() user: AuthUserPayload, @Body() dto: BankCardDto) {
    return this.userCenterService.addBankCard(user.sub, dto)
  }

  @Delete('bank-cards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  deleteBankCard(@CurrentUser() user: AuthUserPayload, @Param('id') id: string) {
    return this.userCenterService.deleteBankCard(user.sub, id)
  }
}
