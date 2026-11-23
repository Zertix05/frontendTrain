import { StyleSheet, Text } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedButton from '../../components/ThemedButton'
import ThemedText from '../../components/ThemedText'
import Spacer from '../../components/Spacer'
import { useUser } from '../../HOOKS/useUse'


const profile = () => {
    const {logout, user}= useUser()
  return (
    <ThemedView style={styles.container}>
        <ThemedText title={true} style={styles.heading}>
            {user.email}
        </ThemedText>
        <Spacer/>
        <ThemedText>Time to start reading some books...</ThemedText>
        <Spacer/>
        <ThemedButton onPress={logout}>
            <Text style={{color:'#f2f2f2'}}>Logout</Text>
        </ThemedButton>
    </ThemedView>
  )
}

export default profile

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center'
    },
    heading:{
        fontWeight:'bold',
        fontSize:18,
        textAlign:'center'
    }
})