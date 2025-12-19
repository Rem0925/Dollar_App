import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage"; // 1. Importamos AsyncStorage
import { DolarWidget } from "./src/widget/DolarWidget";
import { getTasas } from "./src/services/api";

export async function widgetTaskHandler(props) {
  const widgetInfo = props.widgetInfo;

  if (widgetInfo.widgetName === "DolarWidget") {
    // Función auxiliar para formatear y pintar
    const renderWithData = (data, statusText) => {
      const bcvVal = data?.bcv ? parseFloat(data.bcv).toFixed(2) : "--";
      const binanceVal = data?.binance
        ? parseFloat(data.binance).toFixed(2)
        : "--";

      // Si no pasamos statusText, ponemos la hora actual
      let footerText = statusText;
      if (!footerText) {
        const d = new Date();
        footerText = `${d.getHours()}:${String(d.getMinutes()).padStart(
          2,
          "0"
        )}`;
      }

      props.renderWidget(
        <DolarWidget
          bcv={bcvVal}
          binance={binanceVal}
          lastUpdate={footerText}
        />
      );
    };

    try {
      // --- PASO 1: INTENTAR LEER DATOS LOCALES (CACHÉ) ---
      // Esto es casi instantáneo, así el usuario nunca ve el widget vacío.
      const cachedJson = await AsyncStorage.getItem("@last_rates");
      let hasCache = false;

      if (cachedJson) {
        const cachedData = JSON.parse(cachedJson);
        // Pintamos inmediatamente con la data guardada + un indicativo discreto (opcional)
        renderWithData(cachedData);
        hasCache = true;
      } else {
        // Si no hay caché (primera vez instalada), mostramos cargando
        props.renderWidget(
          <DolarWidget bcv="..." binance="..." lastUpdate="Cargando..." />
        );
      }

      // --- PASO 2: INTENTAR ACTUALIZAR DESDE EL SERVIDOR ---
      // Ahora sí, buscamos data fresca en segundo plano
      const freshData = await getTasas();

      if (freshData) {
        // Si hay internet y servidor responde, actualizamos el widget con lo nuevo
        renderWithData(freshData);

        // Y actualizamos el caché para la próxima
        await AsyncStorage.setItem("@last_rates", JSON.stringify(freshData));
      }
    } catch (error) {
      console.log("Widget Error:", error);
      // Si falla el servidor pero teníamos caché, NO hacemos nada (dejamos la data vieja visible).
      // Solo si NO había caché mostramos error.
      const cachedCheck = await AsyncStorage.getItem("@last_rates");
      if (!cachedCheck) {
        props.renderWidget(
          <DolarWidget bcv="Error" binance="Red" lastUpdate="Reintentar" />
        );
      }
    }
  }
}
