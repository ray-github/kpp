import { Injectable, NotFoundException } from '@nestjs/common'
import { EnrollmentStatus } from '@prisma/client'
import { createHash } from 'crypto'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class ConsumeService {
  constructor(private readonly prisma: PrismaService) {}

  async getConsumeCodes(userId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        userId,
        status: EnrollmentStatus.ACTIVE,
      },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    return enrollments
      .filter((item) => item.lessonUsed < item.lessonTotal)
      .map((item) => ({
        enrollmentId: item.id,
        courseTitle: item.course.title,
        remainingLessons: item.lessonTotal - item.lessonUsed,
        code: this.buildCode(userId, item.id),
      }))
  }

  async getConsumeCode(userId: string, enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, userId, status: EnrollmentStatus.ACTIVE },
      include: { course: true },
    })

    if (!enrollment) {
      throw new NotFoundException('课程不存在或已用完')
    }

    if (enrollment.lessonUsed >= enrollment.lessonTotal) {
      throw new NotFoundException('课时已用完')
    }

    return {
      enrollmentId: enrollment.id,
      courseTitle: enrollment.course.title,
      lessonTotal: enrollment.lessonTotal,
      lessonUsed: enrollment.lessonUsed,
      remainingLessons: enrollment.lessonTotal - enrollment.lessonUsed,
      code: this.buildCode(userId, enrollment.id),
      refreshedAt: new Date().toISOString(),
    }
  }

  private buildCode(userId: string, enrollmentId: string) {
    const raw = `${userId}:${enrollmentId}:${Math.floor(Date.now() / 60000)}`
    const hash = createHash('sha256').update(raw).digest('hex').slice(0, 12).toUpperCase()
    return `KPP${hash}`
  }
}
