import Taro from '@tarojs/taro'

const CART_RETURN_URL_KEY = 'kpp_cart_return_url'

export function setCartReturnUrl(url: string) {
  Taro.setStorageSync(CART_RETURN_URL_KEY, url)
}

export function getCartReturnUrl(): string {
  try {
    return Taro.getStorageSync(CART_RETURN_URL_KEY) || ''
  } catch {
    return ''
  }
}

export function clearCartReturnUrl() {
  try {
    Taro.removeStorageSync(CART_RETURN_URL_KEY)
  } catch {
    // ignore
  }
}

export function goToCartWithReturn(returnUrl: string) {
  setCartReturnUrl(returnUrl)
  Taro.switchTab({ url: '/pages/cart/index' })
}

export function backFromCart(fallbackUrl = '/pages/home/index') {
  const returnUrl = getCartReturnUrl()
  clearCartReturnUrl()
  if (returnUrl) {
    Taro.navigateTo({ url: returnUrl })
    return
  }
  Taro.switchTab({ url: fallbackUrl })
}
