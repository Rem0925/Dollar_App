import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, ChartLineUp } from 'phosphor-react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
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

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
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
            bottom: insets.bottom, 
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
  );
}

export default function App() {
  return (
    // 2. Envuelve todo en SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <MainTabs /> 
      </NavigationContainer>
    </SafeAreaProvider>
  );
}