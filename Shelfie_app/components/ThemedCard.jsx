import { View,useColorScheme,StyleSheet } from 'react-native'
import { Colors } from '../constants/Colors';
import { Children } from 'react';

const ThemedView = ({style, children, ...props}) => {
    const colorScheme = useColorScheme();
    const theme= Colors[colorScheme];
  return (
    <View style={[{backgroundColor: theme.background}, styles.card, style]} {...props}>
    {children}
    </View>
  )
}

export default ThemedView

const styles = StyleSheet.create({
  card:{
    borderRadius:5,
    padding:20
  }
})