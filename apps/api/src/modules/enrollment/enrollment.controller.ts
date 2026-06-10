import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { EnrollmentStatus } from '@prisma/client'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, AuthUserPayload } from '../../common/decorators/current-user.decorator'
import { EnrollmentService } from './enrollment.service'

@ApiTags('Enrollment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({ summary: '我的课程表' })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus })
  getEnrollments(
    @CurrentUser() user: AuthUserPayload,
    @Query('status') status?: EnrollmentStatus,
  ) {
    return this.enrollmentService.getEnrollments(user.sub, status)
  }
}
