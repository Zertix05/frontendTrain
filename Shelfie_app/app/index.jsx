import { StyleSheet, Text, View,Image } from 'react-native'
import Logo from '../assets/favicon.png'
import ThemedView from '../components/ThemedView'
import ThemedText from '../components/ThemedText'
import {Link} from 'expo-router'
import Spacer from '../components/Spacer'
 const index = () => {
  return (
    <ThemedView style={styles.container}>
      <Image source={Logo}/>
      <Spacer height={20} />
      <ThemedText style={styles.title} title={true}>The number 1</ThemedText>
      <Spacer height={10}/>
      <ThemedText>index</ThemedText>

      <Link style={styles.link} href="/login">
        <ThemedText>
        Login page
        </ThemedText>
      </Link>
       <Link style={styles.link} href="/register">
        <ThemedText>
          Register page
        </ThemedText>
        </Link>
        <Link style={styles.link} href="/profile">
        <ThemedText>
          Profile page
        </ThemedText>
        </Link>
    </ThemedView>

   
  )
}

export default index

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title:{
    fontWeight:'bold',
    fontSize:18
  },
  card:{
    padding:20,
    borderRadius:5,
    boxShadow:'4px 4px rgba(0,0,0,0.1)'
  },
  link:{
    margin:10,
    color:"#c63333ff"
  }
})