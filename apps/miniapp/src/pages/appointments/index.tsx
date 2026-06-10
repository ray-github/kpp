import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import EmptyState from '@/components/EmptyState'
import { APPOINTMENT_STATUS_LABEL } from '@/constants/user-center'
import {
  cancelAppointment,
  createAppointment,
  fetchAppointments,
  MockAppointmentItem,
} from '@/services/user-center'
import { HOME_COURSES } from '@/mock/home'
import './index.scss'

export default function AppointmentsPage() {
  const [items, setItems] = useState<MockAppointmentItem[]>([])

  const load = () => fetchAppointments().then(setItems)

  useDidShow(() => {
    load()
  })

  const handleCancel = async (id: string) => {
    const res = await Taro.showModal({ title: '取消该预约？' })
    if (!res.confirm) return
    await cancelAppointment(id)
    load()
    Taro.showToast({ title: '已取消', icon: 'success' })
  }

  const handleCreate = async () => {
    const course = HOME_COURSES[1]
    const appointmentAt = new Date(Date.now() + 86400000 * 3).toISOString()
    await createAppointment({
      courseId: course.id,
      title: course.title,
      appointmentAt,
      remark: '体验课预约',
    })
    load()
    Taro.showToast({ title: '预约已提交', icon: 'success' })
  }

  return (
    <ScrollView className='appointments secondary-page page' scrollY>
      {items.length === 0 ? (
        <EmptyState
          title='暂无预约'
          subtitle='预约试听课或到店体验'
          actionText='新建预约'
          onAction={handleCreate}
        />
      ) : (
        items.map((item) => (
          <View key={item.id} className='secondary-page__card'>
            <View className='secondary-page__row'>
              <View>
                <Text className='secondary-page__title'>{item.title}</Text>
                <Text className='secondary-page__meta'>
                  {new Date(item.appointmentAt).toLocaleString()}
                </Text>
                {item.remark && (
                  <Text className='secondary-page__desc'>{item.remark}</Text>
                )}
                <Text
                  className={`secondary-page__tag ${
                    item.status === 'CANCELLED' ? 'secondary-page__tag--muted' : ''
                  }`}
                >
                  {APPOINTMENT_STATUS_LABEL[item.status] || item.status}
                </Text>
              </View>
              {item.status !== 'CANCELLED' && (
                <Text
                  className='secondary-page__action'
                  onClick={() => handleCancel(item.id)}
                >
                  取消
                </Text>
              )}
            </View>
          </View>
        ))
      )}

      {items.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <Button type='primary' block onClick={handleCreate}>
            新建预约（模拟）
          </Button>
        </View>
      )}
    </ScrollView>
  )
}
