import { createContext, useState, useEffect } from "react";
import { account} from "../lib/appwrite";
import { ID } from "appwrite";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 🔹 ЛОГИН (новый объектный стиль)
  async function login(email, password) {
    try {
      // Новый способ создания сессии через объект
      await account.createEmailPasswordSession({ email, password });

      // Получаем информацию о пользователе
      const response = await account.get();
      setUser(response);
    } catch (error) {
      console.log("Ошибка при входе:", error.message);
      throw new Error(error.message);
    }
  }

  // 🔹 РЕГИСТРАЦИЯ (новый объектный стиль)
  async function register(email, password, name) {
    try {
      // Создаём пользователя объектным стилем
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name,
      });

      // Логиним сразу после регистрации
      await login(email, password);
    } catch (error) {
      console.log("Ошибка при регистрации:", error.message);
      throw new Error(error.message);
    }
  }

  // 🔹 ВЫХОД
  async function logout() {
    try {
      // Удаляем все сессии пользователя (React Native friendly)
      await account.deleteSessions();
    } catch (error) {
      console.log("Ошибка при logout:", error.message);
    } finally {
      setUser(null);
    }
  }

  // 🔹 ПРОВЕРКА ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
  async function getInitialUserValue() {
    try {
      const response = await account.get();
      setUser(response);
    } catch (error) {
      setUser(null);
    } finally {
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    getInitialUserValue();
  }, []);

  return (
    <UserContext.Provider value={{ user, login, register, logout, authChecked }}>
      {children}
    </UserContext.Provider>
  );
}
