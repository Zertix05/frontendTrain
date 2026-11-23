import { StyleSheet, FlatList, Pressable } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedCard from '../../components/ThemedCard'
import Spacer from '../../components/Spacer'
import { useBooks } from '../../HOOKS/useBooks'
import { Colors } from '../../constants/Colors'
const Books = () => {
  const {books}= useBooks();
  return (
    <ThemedView style={styles.container} safe={true}>
        <ThemedText title={true} style={styles.heading}>
            Your reading list
        </ThemedText>
        <Spacer/>
        <FlatList data={books} keyExtractor={(item)=>item.$id} contentContainerStyle={styles.list} renderItem={({item})=>(
          <Pressable>
            <ThemedCard style={styles.card}>
              <ThemedText style={styles.title}>
                {item.title}
              </ThemedText>
               <ThemedText>
                Written by {item.author}
              </ThemedText>
            </ThemedCard>
          </Pressable>
        )}/>
    </ThemedView>
  )
}

export default Books

const styles = StyleSheet.create({
    container:{
        flex:1,
      //  justifyContent:'center',
        alignItems:'stretch'
    },
    heading:{
        fontWeight:'bold',
        fontSize:18,
        textAlign:'center'
    },
    list:{
      marginTop:40
    },
    card:{
      width:"90%",
      marginHorizontal:"5%",
      marginVertical:10,
      padding:10,
      paddingLeft:14,
      borderLeftColor: Colors.primary,
      borderLeftWidth:4
    },
    title:{
      fontSize:20,
      fontWeight:'bold',
      marginBottom:10
    }
})