import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import EmptyState from '@/components/EmptyState'
import { deleteInvoice, fetchInvoices } from '@/services/user-center'
import { MockInvoiceItem } from '@/mock/storage'
import './index.scss'

export default function InvoiceListPage() {
  const [items, setItems] = useState<MockInvoiceItem[]>([])

  const load = () => fetchInvoices().then(setItems)

  useDidShow(() => {
    load()
  })

  const goEdit = (id?: string) => {
    const query = id ? `?id=${id}` : ''
    Taro.navigateTo({ url: `/pages/invoice-edit/index${query}` })
  }

  const handleDelete = async (id: string) => {
    const res = await Taro.showModal({ title: '删除该发票信息？' })
    if (!res.confirm) return
    await deleteInvoice(id)
    load()
  }

  return (
    <ScrollView className='invoice-list secondary-page page' scrollY>
      {items.length === 0 ? (
        <EmptyState
          title='暂无发票信息'
          subtitle='添加常用抬头，开票更方便'
          actionText='新增发票'
          onAction={() => goEdit()}
        />
      ) : (
        items.map((item) => (
          <View key={item.id} className='secondary-page__card'>
            <Text className='secondary-page__title'>
              {item.title}
              {item.isDefault && <Text className='invoice-list__default'>默认</Text>}
            </Text>
            {item.taxNo && (
              <Text className='secondary-page__desc'>税号：{item.taxNo}</Text>
            )}
            {item.email && (
              <Text className='secondary-page__desc'>邮箱：{item.email}</Text>
            )}
            <View className='secondary-page__row' style={{ marginTop: 12 }}>
              <Text className='secondary-page__link' onClick={() => goEdit(item.id)}>
                编辑
              </Text>
              <Text
                className='secondary-page__action'
                onClick={() => handleDelete(item.id)}
              >
                删除
              </Text>
            </View>
          </View>
        ))
      )}

      <View className='form-page__footer'>
        <Button type='primary' block onClick={() => goEdit()}>
          新增发票
        </Button>
      </View>
    </ScrollView>
  )
}
