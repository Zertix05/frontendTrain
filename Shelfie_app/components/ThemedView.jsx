import { View,useColorScheme } from 'react-native'
import { Colors } from '../constants/Colors';
import { Children } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ThemedView = ({style,safe=false, children, ...props}) => {
    const colorScheme = useColorScheme();
    const theme= Colors[colorScheme];
  if(!safe) return (
    <View 
    style={[{backgroundColor: theme.background}, style]} {...props}>
    {children}
    </View>
  )
  const insets= useSafeAreaInsets();

  return(
    <View 
    style={[{
      backgroundColor: theme.background,
      paddingTop: insets.top,
      paddingBottom: insets.bottom
    },
     style
     ]} {...props}>
    {children}
    </View>
  )
}

export default ThemedView