import { StyleSheet, Keyboard,  Text,TouchableWithoutFeedback, 
  KeyboardAvoidingView, 
  Platform,
ActivityIndicator } from 'react-native'
import { useState } from 'react'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { Link } from 'expo-router'
import ThemedButton from '../../components/ThemedButton'
import {TextInput } from 'react-native-web'
import ThemedTextInput from '../../components/ThemedTextInput'
import { useUser } from '../../HOOKS/useUse'
import { Colors } from '../../constants/Colors'


const login = () => {
  const [email, setEmail]=useState('');
  const [password, setPassword]=useState('');
  const [error, setError]=useState(null);

  const {login} = useUser()
  
    const handleSubmit=async()=>{
      setError(null)
       try{
            await login(email,password)
        }
        catch(error){
          setError(error.message)
        } 
 }
  return (
      // 👇 Закрытие клавиатуры при клике вне поля
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* 👇 Автоматически двигает контент вверх при появлении клавиатуры */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
    <ThemedView style={styles.container}>
        <Spacer/>
        <ThemedText title={true} style={styles.title}>
            Login to your account
        </ThemedText>

        <ThemedTextInput style={{width: '80%', marginBottom: 20}} keyboardType='email-address' onChangeText={setEmail} value={email} placeholder='Email'/>
        <ThemedTextInput style={{width: '80%', marginBottom: 20}} secureTextEntry onChangeText={setPassword} value={password} placeholder='Password'/>

       <ThemedButton onPress={handleSubmit}>
         <Text style={{color: '#f2f2f2'}}>Pressed me</Text>
       </ThemedButton>
       <Spacer/>
       {error && <Text style={styles.error}>{error}</Text>}
        <Spacer height={100}/>
        <Link href='/register'>
        <ThemedText style={{textAlign:'center'}}>
            Register instead  
        </ThemedText>
        </Link>


    </ThemedView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  )
}

export default login

const styles = StyleSheet.create({
    container:{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title:{
        textAlign: 'center',
        fontSize: 18,
        marginBottom:30
    },
   error:{
    color: Colors.warning,
    padding:20,
    backgroundColor:"#f5c1c8",
    borderColor: Colors.warning,
    borderWidth:1,
    borderRadius:6,
    marginHorizontal:10
   }
})