import { useEffect } from "react"
import { useUser } from "../../HOOKS/useUse"
import { useRouter } from "expo-router"
import { Text } from "react-native"

const GuestOnly = ({ children }) => {
  const { user, authChecked } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (authChecked && user !== null) {
      router.replace("/profile")
    }
  }, [user, authChecked])

  // показываем загрузку, пока проверка не завершена
  if (!authChecked) {
    return <Text>Loading...</Text>
  }

  // если пользователь не залогинен, показываем children (гостевую страницу)
  return children
}

export default GuestOnly
