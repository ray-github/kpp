import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  ApplicationStatus,
  FollowTargetType,
  MerchantType,
} from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { decimalToNumber } from '../../common/utils/helpers'

function mapCourseCard(course: {
  id: string
  title: string
  subtitle: string | null
  tags: string[]
  price: { toNumber?: () => number } | number
  coverBg: string | null
}) {
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle || '',
    tags: course.tags,
    price: decimalToNumber(course.price as never),
    coverBg:
      course.coverBg ||
      'linear-gradient(135deg, #66ccff 0%, #38bdf8 100%)',
  }
}

@Injectable()
export class UserCenterService {
  constructor(private readonly prisma: PrismaService) {}

  async getBrowseHistory(userId: string) {
    const items = await this.prisma.browseHistory.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { viewedAt: 'desc' },
      take: 50,
    })

    return items.map((item) => ({
      id: item.id,
      viewedAt: item.viewedAt,
      course: mapCourseCard(item.course),
    }))
  }

  async recordBrowseHistory(userId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, published: true },
    })
    if (!course) throw new NotFoundException('课程不存在')

    await this.prisma.browseHistory.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: { viewedAt: new Date() },
    })

    return { success: true }
  }

  async clearBrowseHistory(userId: string) {
    await this.prisma.browseHistory.deleteMany({ where: { userId } })
    return { success: true }
  }

  async getFavorites(userId: string) {
    const items = await this.prisma.favorite.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      course: mapCourseCard(item.course),
    }))
  }

  async addFavorite(userId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id: courseId, published: true },
    })
    if (!course) throw new NotFoundException('课程不存在')

    await this.prisma.favorite.upsert({
      where: { userId_courseId: { userId, courseId } },
      create: { userId, courseId },
      update: {},
    })

    return { success: true }
  }

  async removeFavorite(userId: string, courseId: string) {
    await this.prisma.favorite.deleteMany({ where: { userId, courseId } })
    return { success: true }
  }

  async isFavorite(userId: string, courseId: string) {
    const item = await this.prisma.favorite.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })
    return { favorited: !!item }
  }

  async getFollows(userId: string) {
    const items = await this.prisma.follow.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    return items.map((item) => ({
      id: item.id,
      targetType: item.targetType,
      targetId: item.targetId,
      targetName: item.targetName,
      targetDesc: item.targetDesc,
      createdAt: item.createdAt,
    }))
  }

  async addFollow(
    userId: string,
    data: {
      targetType: FollowTargetType
      targetId: string
      targetName: string
      targetDesc?: string
    },
  ) {
    await this.prisma.follow.upsert({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: data.targetType,
          targetId: data.targetId,
        },
      },
      create: { userId, ...data },
      update: { targetName: data.targetName, targetDesc: data.targetDesc },
    })
    return { success: true }
  }

  async removeFollow(userId: string, id: string) {
    const item = await this.prisma.follow.findFirst({ where: { id, userId } })
    if (!item) throw new NotFoundException('关注不存在')
    await this.prisma.follow.delete({ where: { id } })
    return { success: true }
  }

  async getAppointments(userId: string) {
    const items = await this.prisma.appointment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { appointmentAt: 'asc' },
    })

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      appointmentAt: item.appointmentAt,
      status: item.status,
      remark: item.remark,
      courseId: item.courseId,
      course: item.course ? mapCourseCard(item.course) : null,
    }))
  }

  async createAppointment(
    userId: string,
    data: {
      courseId?: string
      title: string
      appointmentAt: string
      remark?: string
    },
  ) {
    if (data.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: data.courseId, published: true },
      })
      if (!course) throw new NotFoundException('课程不存在')
    }

    const item = await this.prisma.appointment.create({
      data: {
        userId,
        courseId: data.courseId,
        title: data.title,
        appointmentAt: new Date(data.appointmentAt),
        remark: data.remark,
      },
    })

    return { id: item.id, success: true }
  }

  async cancelAppointment(userId: string, id: string) {
    const item = await this.prisma.appointment.findFirst({ where: { id, userId } })
    if (!item) throw new NotFoundException('预约不存在')
    if (item.status === 'CANCELLED') {
      throw new BadRequestException('预约已取消')
    }

    await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    return { success: true }
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  }

  async createAddress(
    userId: string,
    data: {
      name: string
      phone: string
      province: string
      city: string
      district: string
      detail: string
      isDefault?: boolean
    },
  ) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.address.create({ data: { userId, ...data } })
  }

  async updateAddress(
    userId: string,
    id: string,
    data: {
      name?: string
      phone?: string
      province?: string
      city?: string
      district?: string
      detail?: string
      isDefault?: boolean
    },
  ) {
    const existing = await this.prisma.address.findFirst({ where: { id, userId } })
    if (!existing) throw new NotFoundException('地址不存在')

    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.address.update({ where: { id }, data })
  }

  async deleteAddress(userId: string, id: string) {
    const existing = await this.prisma.address.findFirst({ where: { id, userId } })
    if (!existing) throw new NotFoundException('地址不存在')
    await this.prisma.address.delete({ where: { id } })
    return { success: true }
  }

  async submitMerchantApplication(
    userId: string,
    data: {
      type: MerchantType
      name: string
      contact: string
      phone: string
      city?: string
      description?: string
    },
  ) {
    const pending = await this.prisma.merchantApplication.findFirst({
      where: { userId, status: ApplicationStatus.PENDING },
    })
    if (pending) {
      throw new BadRequestException('已有审核中的入驻申请')
    }

    const item = await this.prisma.merchantApplication.create({
      data: { userId, ...data },
    })

    return { id: item.id, status: item.status, success: true }
  }

  async getMerchantApplication(userId: string) {
    const item = await this.prisma.merchantApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
    return item || null
  }

  async getInvoices(userId: string) {
    return this.prisma.invoice.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  }

  async createInvoice(
    userId: string,
    data: { title: string; taxNo?: string; email?: string; isDefault?: boolean },
  ) {
    if (data.isDefault) {
      await this.prisma.invoice.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }
    return this.prisma.invoice.create({ data: { userId, ...data } })
  }

  async updateInvoice(
    userId: string,
    id: string,
    data: { title?: string; taxNo?: string; email?: string; isDefault?: boolean },
  ) {
    const existing = await this.prisma.invoice.findFirst({ where: { id, userId } })
    if (!existing) throw new NotFoundException('发票信息不存在')

    if (data.isDefault) {
      await this.prisma.invoice.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.invoice.update({ where: { id }, data })
  }

  async deleteInvoice(userId: string, id: string) {
    const existing = await this.prisma.invoice.findFirst({ where: { id, userId } })
    if (!existing) throw new NotFoundException('发票信息不存在')
    await this.prisma.invoice.delete({ where: { id } })
    return { success: true }
  }

  async getBankCards(userId: string) {
    return this.prisma.bankCard.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    })
  }

  async addBankCard(
    userId: string,
    data: { bankName: string; cardNo: string; holderName: string; isDefault?: boolean },
  ) {
    const digits = data.cardNo.replace(/\s/g, '')
    if (digits.length < 16) {
      throw new BadRequestException('银行卡号格式不正确')
    }

    if (data.isDefault) {
      await this.prisma.bankCard.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    return this.prisma.bankCard.create({
      data: {
        userId,
        bankName: data.bankName,
        cardNoLast4: digits.slice(-4),
        holderName: data.holderName,
        isDefault: data.isDefault ?? false,
      },
    })
  }

  async deleteBankCard(userId: string, id: string) {
    const existing = await this.prisma.bankCard.findFirst({ where: { id, userId } })
    if (!existing) throw new NotFoundException('银行卡不存在')
    await this.prisma.bankCard.delete({ where: { id } })
    return { success: true }
  }

  getSupportInfo() {
    return {
      hotline: '400-888-6688',
      wechat: 'kpp_service',
      workHours: '周一至周日 9:00-21:00',
      email: 'support@kpp.example.com',
    }
  }
}
