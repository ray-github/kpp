import { Injectable } from '@nestjs/common'
import { EnrollmentStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber } from '../../common/utils/helpers'

@Injectable()
export class EnrollmentService {
  constructor(private readonly prisma: PrismaService) {}

  async getEnrollments(userId: string, status?: EnrollmentStatus) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    return {
      total: enrollments.length,
      items: enrollments.map((item) => ({
        id: item.id,
        status: item.status,
        lessonTotal: item.lessonTotal,
        lessonUsed: item.lessonUsed,
        nextLessonAt: item.nextLessonAt,
        course: {
          id: item.course.id,
          title: item.course.title,
          subtitle: item.course.subtitle,
          price: decimalToNumber(item.course.price),
          coverBg: item.course.coverBg,
          coverUrl: item.course.coverUrl,
        },
      })),
    }
  }
}
