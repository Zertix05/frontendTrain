import { StyleSheet, TextInput, useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors'

const ThemedTextInput = ({style, children, ...props}) => {
    const colorScheme = useColorScheme();
    const theme= Colors[colorScheme];
  return (
    <TextInput 
        style={[{
            backgroundColor: theme.uiBackground,
            color: theme.text,
            boorderRadius:6,
            padding:20
        },style]}
        {...props}
    >
        {children}
    </TextInput>
  )
}

export default ThemedTextInput

const styles = StyleSheet.create({})