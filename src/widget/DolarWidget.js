import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export function DolarWidget({ bcv, binance, lastUpdate }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#1E1E1E", // COLORS.cardBg
        borderRadius: 22, // Bordes un poco más redondeados
        flexDirection: "column",
        justifyContent: "space-between", // Esto elimina los espacios vacíos forzados
        padding: 14,
      }}
    >
      {/* HEADER: Título y Fecha */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Pequeño punto indicador de "Live" o activo */}
          <FlexWidget
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#10B981", // COLORS.accent
              marginRight: 6,
            }}
          />
          <TextWidget
            text="Monitor Vzla"
            style={{
              fontSize: 13,
              color: "#A0A0A0", // COLORS.textSecondary
              fontWeight: "bold",
            }}
          />
        </FlexWidget>

        <TextWidget
          text={lastUpdate}
          style={{ fontSize: 11, color: "#666666" }}
        />
      </FlexWidget>

      {/* CONTENEDOR DE PRECIOS: Ocupa el espacio central */}
      <FlexWidget
        style={{
          flexDirection: "column",
          justifyContent: "space-around", // Distribuye los precios equitativamente
          height: "match_parent", // Usa el espacio disponible verticalmente
          paddingVertical: 4,
        }}
      >
        {/* Fila BCV */}
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextWidget
            text="BCV"
            style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "bold" }}
          />
          <TextWidget
            text={` ${bcv}`}
            style={{
              fontSize: 24, // Número grande
              color: "#10B981", // COLORS.bcv
              fontWeight: "bold",
            }}
          />
        </FlexWidget>

        {/* Fila Binance */}
        <FlexWidget
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextWidget
            text="Binance"
            style={{ fontSize: 16, color: "#FFFFFF", fontWeight: "bold" }}
          />
          <TextWidget
            text={` ${binance}`}
            style={{
              fontSize: 24, // Número grande
              color: "#FBBF24", // COLORS.binance
              fontWeight: "bold",
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
