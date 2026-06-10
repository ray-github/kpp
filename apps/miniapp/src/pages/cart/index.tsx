import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import {
  CartItem,
  fetchCartItems,
  updateCartItem,
  removeCartItem,
  calcCartTotal,
  getSelectedCount,
  isAllSelected,
} from '@/services/cart'
import { createOrderFromCart } from '@/services/order'
import { useUserStore } from '@/stores/user'
import { backFromCart, getCartReturnUrl } from '@/utils/cart-nav'
import { syncTabBarSelected } from '@/utils/tab-bar'
import './index.scss'

export default function CartPage() {
  const ensureLogin = useUserStore((s) => s.ensureLogin)
  const [items, setItems] = useState<CartItem[]>([])
  const [manageMode, setManageMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showBack, setShowBack] = useState(false)

  const loadItems = async () => {
    try {
      await ensureLogin()
      const data = await fetchCartItems()
      setItems(data)
    } catch {
      setItems([])
    }
  }

  useDidShow(() => {
    syncTabBarSelected()
    setShowBack(!!getCartReturnUrl())
    loadItems()
  })

  useEffect(() => {
    const page = Taro.getCurrentInstance().page
    if (!page) return

    page.onBackPress = () => {
      if (getCartReturnUrl()) {
        backFromCart()
        return true
      }
      return false
    }

    return () => {
      delete page.onBackPress
    }
  }, [])

  const goHome = () => {
    Taro.switchTab({ url: '/pages/home/index' })
  }

  const toggleItem = async (item: CartItem) => {
    await updateCartItem(item.id, { selected: !item.selected })
    loadItems()
  }

  const toggleAll = async () => {
    const next = !isAllSelected(items)
    await Promise.all(items.map((item) => updateCartItem(item.id, { selected: next })))
    loadItems()
  }

  const changeQuantity = async (item: CartItem, delta: number) => {
    const quantity = Math.max(1, item.quantity + delta)
    await updateCartItem(item.id, { quantity })
    loadItems()
  }

  const handleRemove = async (item: CartItem) => {
    await removeCartItem(item.id)
    Taro.showToast({ title: '已删除', icon: 'none' })
    loadItems()
  }

  const handleCheckout = async () => {
    const selectedCount = getSelectedCount(items)
    if (selectedCount === 0) {
      Taro.showToast({ title: '请选择课程', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const order = await createOrderFromCart()
      Taro.navigateTo({
        url: `/pages/order-result/index?orderNo=${order.orderNo}`,
      })
    } catch (error) {
      Taro.showToast({
        title: error instanceof Error ? error.message : '下单失败',
        icon: 'none',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const total = calcCartTotal(items)
  const selectedCount = getSelectedCount(items)
  const allSelected = isAllSelected(items)

  return (
    <View className='cart page'>
      <PageHeader
        title='购物车'
        showBack={showBack}
        onBack={() => backFromCart()}
        right={
          items.length > 0 ? (
            <View
              className={`cart__manage ${manageMode ? 'cart__manage--active' : ''}`}
              onClick={() => setManageMode(!manageMode)}
            >
              <Text className='cart__manage-text'>{manageMode ? '完成' : '管理'}</Text>
            </View>
          ) : null
        }
      />

      {items.length === 0 ? (
        <View className='cart__empty-wrap'>
          <EmptyState
            compact
            title='购物车是空的'
            subtitle='快去添加心仪的课程吧'
            actionText='去逛逛'
            onAction={goHome}
          />
        </View>
      ) : (
        <>
          <ScrollView className='cart__list' scrollY enableFlex>
            <View className='cart__list-inner'>
              {items.map((item) => (
                <View key={item.id} className='cart__item'>
                  <View
                    className={`cart__checkbox ${item.selected ? 'cart__checkbox--checked' : ''}`}
                    onClick={() => toggleItem(item)}
                  >
                    {item.selected ? <Text>✓</Text> : null}
                  </View>

                  {item.course.coverImage ? (
                    <Image
                      className='cart__cover'
                      src={item.course.coverImage}
                      mode='aspectFill'
                      onClick={() =>
                        Taro.navigateTo({
                          url: `/pages/course-detail/index?id=${item.courseId}`,
                        })
                      }
                    />
                  ) : (
                    <View
                      className='cart__cover cart__cover--fallback'
                      style={{ background: item.course.coverBg }}
                      onClick={() =>
                        Taro.navigateTo({
                          url: `/pages/course-detail/index?id=${item.courseId}`,
                        })
                      }
                    />
                  )}

                  <View className='cart__info'>
                    <Text className='cart__title' numberOfLines={2}>
                      {item.course.title}
                    </Text>
                    <Text className='cart__subtitle' numberOfLines={1}>
                      {item.course.subtitle}
                    </Text>
                    <View className='cart__row'>
                      <Text className='cart__price'>¥{item.course.price.toFixed(2)}</Text>
                      {!manageMode ? (
                        <View className='cart__stepper'>
                          <Text
                            className='cart__stepper-btn'
                            onClick={() => changeQuantity(item, -1)}
                          >
                            -
                          </Text>
                          <Text className='cart__stepper-num'>{item.quantity}</Text>
                          <Text
                            className='cart__stepper-btn'
                            onClick={() => changeQuantity(item, 1)}
                          >
                            +
                          </Text>
                        </View>
                      ) : (
                        <Text className='cart__delete' onClick={() => handleRemove(item)}>
                          删除
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View className='cart__list-space' />
          </ScrollView>

          <View className='cart__footer'>
            <View className='cart__footer-left' onClick={toggleAll}>
              <View
                className={`cart__checkbox ${allSelected ? 'cart__checkbox--checked' : ''}`}
              >
                {allSelected ? <Text>✓</Text> : null}
              </View>
              <Text className='cart__select-all'>全选</Text>
            </View>

            {!manageMode ? (
              <View className='cart__footer-right'>
                <View className='cart__total-wrap'>
                  <Text className='cart__total-label'>合计：</Text>
                  <Text className='cart__total'>¥{total.toFixed(2)}</Text>
                </View>
                <View
                  className={`cart__checkout-btn ${submitting ? 'cart__checkout-btn--disabled' : ''}`}
                  onClick={() => !submitting && handleCheckout()}
                >
                  <Text>{submitting ? '提交中…' : `结算(${selectedCount})`}</Text>
                </View>
              </View>
            ) : (
              <View
                className='cart__checkout-btn cart__checkout-btn--danger'
                onClick={async () => {
                  const selected = items.filter((item) => item.selected)
                  if (selected.length === 0) {
                    Taro.showToast({ title: '请选择要删除的课程', icon: 'none' })
                    return
                  }
                  await Promise.all(selected.map((item) => removeCartItem(item.id)))
                  Taro.showToast({ title: '已删除', icon: 'none' })
                  loadItems()
                }}
              >
                <Text>删除所选</Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}
