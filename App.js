import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, ChartLineUp } from 'phosphor-react-native';
import HomeScreen from './src/screens/HomeScreen';
import ChartScreen from './src/screens/ChartScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: '#555',
          tabBarStyle: {
            backgroundColor: COLORS.cardBg,
            borderTopWidth: 0,
            height: 55, 
            paddingTop: 0, 
            position: 'absolute', 
            bottom: 15, 
            left: 40,   
            right: 40,
            borderRadius: 25,
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 5,
            alignItems: 'center',
            justifyContent: 'center'
          },
        })}
      >
        <Tab.Screen 
            name="Inicio" 
            component={HomeScreen} 
            options={{
                tabBarIcon: ({ color, focused }) => (
                    <House weight={focused ? "fill" : "bold"} size={24} color={color} style={{marginTop: 15}} /> 
                )
            }}
        />
        <Tab.Screen 
            name="Graficos" 
            component={ChartScreen} 
            options={{
                tabBarIcon: ({ color, focused }) => (
                    <ChartLineUp weight={focused ? "fill" : "bold"} size={24} color={color} style={{marginTop: 15}} />
                )
            }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}