import { StyleSheet, Text, useColorScheme, View } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import GuestOnly from './GuestOnly';

const AuthLayout = () => {
       const colorScheme = useColorScheme();
  return (
    <GuestOnly>
     <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    <Stack screenOptions={{
        headerShown: false,
        animation: "none"
        }}>
       
    </Stack>
    </GuestOnly>
  )
}
export default AuthLayout

const styles = StyleSheet.create({})