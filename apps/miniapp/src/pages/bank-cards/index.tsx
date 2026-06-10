import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import { Button } from '@nutui/nutui-react-taro'
import EmptyState from '@/components/EmptyState'
import { addBankCard, deleteBankCard, fetchBankCards } from '@/services/user-center'
import { MockBankCardItem } from '@/mock/storage'
import './index.scss'

export default function BankCardsPage() {
  const [items, setItems] = useState<MockBankCardItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [bankName, setBankName] = useState('')
  const [cardNo, setCardNo] = useState('')
  const [holderName, setHolderName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => fetchBankCards().then(setItems)

  useDidShow(() => {
    load()
  })

  const handleDelete = async (id: string) => {
    const res = await Taro.showModal({ title: '解绑该银行卡？' })
    if (!res.confirm) return
    await deleteBankCard(id)
    load()
  }

  const handleAdd = async () => {
    if (!bankName || !cardNo || !holderName) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    setSaving(true)
    try {
      await addBankCard({ bankName, cardNo, holderName, isDefault: items.length === 0 })
      setBankName('')
      setCardNo('')
      setHolderName('')
      setShowForm(false)
      load()
      Taro.showToast({ title: '添加成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : '添加失败',
        icon: 'none',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ScrollView className='bank-cards secondary-page page' scrollY>
      {items.length === 0 && !showForm ? (
        <EmptyState
          title='暂无银行卡'
          subtitle='绑定银行卡用于退款或提现'
          actionText='添加银行卡'
          onAction={() => setShowForm(true)}
        />
      ) : (
        items.map((item) => (
          <View key={item.id} className='secondary-page__card'>
            <Text className='secondary-page__title'>
              {item.bankName}
              {item.isDefault && (
                <Text className='secondary-page__tag' style={{ marginLeft: 8 }}>
                  默认
                </Text>
              )}
            </Text>
            <Text className='bank-cards__card-no'>**** **** **** {item.cardNoLast4}</Text>
            <Text className='secondary-page__desc'>持卡人：{item.holderName}</Text>
            <Text
              className='secondary-page__action'
              style={{ marginTop: 12 }}
              onClick={() => handleDelete(item.id)}
            >
              解绑
            </Text>
          </View>
        ))
      )}

      {showForm ? (
        <View className='form-page__group'>
          <Text className='form-page__label'>开户银行</Text>
          <Input className='form-page__input' value={bankName} onInput={(e) => setBankName(e.detail.value)} />
          <Text className='form-page__label' style={{ marginTop: 12 }}>
            银行卡号
          </Text>
          <Input className='form-page__input' type='number' value={cardNo} onInput={(e) => setCardNo(e.detail.value)} />
          <Text className='form-page__label' style={{ marginTop: 12 }}>
            持卡人姓名
          </Text>
          <Input className='form-page__input' value={holderName} onInput={(e) => setHolderName(e.detail.value)} />
          <View style={{ marginTop: 16 }}>
            <Button type='primary' block loading={saving} onClick={handleAdd}>
              确认添加
            </Button>
          </View>
        </View>
      ) : (
        items.length > 0 && (
          <Text className='bank-cards__form-toggle' onClick={() => setShowForm(true)}>
            + 添加银行卡
          </Text>
        )
      )}
    </ScrollView>
  )
}
