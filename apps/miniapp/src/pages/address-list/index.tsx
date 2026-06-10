import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import EmptyState from '@/components/EmptyState'
import { deleteAddress, fetchAddresses } from '@/services/user-center'
import { MockAddressItem } from '@/mock/storage'
import './index.scss'

export default function AddressListPage() {
  const [items, setItems] = useState<MockAddressItem[]>([])

  const load = () => fetchAddresses().then(setItems)

  useDidShow(() => {
    load()
  })

  const goEdit = (id?: string) => {
    const query = id ? `?id=${id}` : ''
    Taro.navigateTo({ url: `/pages/address-edit/index${query}` })
  }

  const handleDelete = async (id: string) => {
    const res = await Taro.showModal({ title: '删除该地址？' })
    if (!res.confirm) return
    await deleteAddress(id)
    load()
  }

  return (
    <ScrollView className='address-list secondary-page page' scrollY>
      {items.length === 0 ? (
        <EmptyState
          title='暂无收货地址'
          subtitle='添加常用地址，下单更便捷'
          actionText='新增地址'
          onAction={() => goEdit()}
        />
      ) : (
        items.map((item) => (
          <View key={item.id} className='secondary-page__card'>
            <View className='secondary-page__row'>
              <View>
                <Text className='secondary-page__title'>
                  {item.name} {item.phone}
                  {item.isDefault && (
                    <Text className='address-list__default'>默认</Text>
                  )}
                </Text>
                <Text className='secondary-page__desc'>
                  {item.province}
                  {item.city}
                  {item.district}
                  {item.detail}
                </Text>
              </View>
            </View>
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
          新增地址
        </Button>
      </View>
    </ScrollView>
  )
}
