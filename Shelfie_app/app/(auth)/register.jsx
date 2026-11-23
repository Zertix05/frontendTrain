import { 
  StyleSheet, 
  Text, 
  View, 
  Keyboard, 
  TouchableWithoutFeedback, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useState } from 'react';
import ThemedView from '../../components/ThemedView';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { Link } from 'expo-router';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';
import { useUser } from '../../HOOKS/useUse';
import { Colors } from '../../constants/Colors';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]=useState(null);
  const {register} = useUser()



  const handleSubmit =async () => {
    setError(null)
    try{
         await register(email,password)
        }
        catch(error){
          setError(error.message)
        }
  };

  return (
    // 👇 Закрытие клавиатуры при клике вне поля
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* 👇 Автоматически двигает контент вверх при появлении клавиатуры */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ThemedView style={styles.container}>
          <Spacer />

          <ThemedText title={true} style={styles.title}>
            Register for an account
          </ThemedText>

          <ThemedTextInput
            style={styles.input}
            keyboardType='email-address'
            onChangeText={setEmail}
            value={email}
            placeholder='Email'
          />

          <ThemedTextInput
            style={styles.input}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            placeholder='Password'
          />

          <ThemedButton onPress={handleSubmit}>
            <Text style={{ color: '#f2f2f2' }}>Press me</Text>
          </ThemedButton>
           <Spacer/>
           {error && <Text style={styles.error}>{error}</Text>}
          <Spacer height={100} />

          <Link href='/login'>
            <ThemedText style={{ textAlign: 'center' }}>
              Login instead
            </ThemedText>
          </Link>
        </ThemedView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    width: '80%',
    marginBottom: 20,
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
});
