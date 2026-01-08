import React, { useEffect, useCallback, useState } from "react";
import { View } from "react-native"; // Importar View
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { House, ChartLineUp } from "phosphor-react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import HomeScreen from "./src/screens/HomeScreen";
import ChartScreen from "./src/screens/ChartScreen";
import * as Haptics from "expo-haptics";
import * as SplashScreen from "expo-splash-screen"; // IMPORTAR ESTO
import { COLORS } from "./src/theme";

// 1. Mantiene el Splash Screen visible mientras se carga el JS
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
  },
};

// ... (Tu función MainTabs se queda igual, no hace falta tocarla) ...
function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: "#555",
        tabBarStyle: {
          backgroundColor: COLORS.cardBg,
          borderTopWidth: 0,
          height: 55,
          paddingTop: 0,
          position: "absolute",
          bottom: insets.bottom,
          left: 40,
          right: 40,
          borderRadius: 25,
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
          alignItems: "center",
          justifyContent: "center",
        },
      })}
    >
      <Tab.Screen
        name="Inicio"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <House
              weight={focused ? "fill" : "bold"}
              size={24}
              color={color}
              style={{ marginTop: 15 }}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
      <Tab.Screen
        name="Graficos"
        component={ChartScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <ChartLineUp
              weight={focused ? "fill" : "bold"}
              size={24}
              color={color}
              style={{ marginTop: 15 }}
            />
          ),
        }}
        listeners={{
          tabPress: () => {
            Haptics.selectionAsync();
          },
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aquí podrías cargar fuentes o hacer llamadas API iniciales si quisieras
        // Por ahora solo simulamos una carga rápida o esperamos a que React monte
        await new Promise(resolve => setTimeout(resolve, 100)); 
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  // 2. Esta función se ejecuta cuando la vista raíz ya se "pintó" en pantalla
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // Solo en este momento ocultamos el Splash Screen nativo
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* 3. Envolvemos todo en una View con onLayout y el color de fondo correcto */}
      <View 
        style={{ flex: 1, backgroundColor: COLORS.background }} 
        onLayout={onLayoutRootView}
      >
        <NavigationContainer theme={MyTheme}>
          <MainTabs />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}