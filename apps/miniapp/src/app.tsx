import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import '@nutui/nutui-react-taro/dist/style.css'
import { useUserStore } from '@/stores/user'
import './app.scss'

function App({ children }: PropsWithChildren) {
  const ensureLogin = useUserStore((s) => s.ensureLogin)

  useLaunch(() => {
    ensureLogin()
  })

  return children
}

export default App
