import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';

const StackNavigation = () => {
    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer  initialRouteName="Home">
        <Stack.Navigator>
          <Stack.Screen name="Home"
          options={{
            headerShown: false
          }}
          component={HomeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    )
}

export default StackNavigation
 