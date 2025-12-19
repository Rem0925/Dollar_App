import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

export function DolarWidget({ bcv, binance, lastUpdate }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#1E1E1E",
        borderRadius: 16,
        flexDirection: "column",
        justifyContent: "center",
        paddingHorizontal: 8,
        paddingVertical: 10,
        borderWidth: 2,
        borderColor: "#333333",
      }}
    >
      {/* HEADER COMPACTO */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 6,
          width: "match_parent",
        }}
      >
        <TextWidget
          text="Monitor Vzla"
          style={{ fontSize: 12, color: "#FFFFFF", fontWeight: "bold" }}
        />
        <TextWidget
          text={lastUpdate}
          style={{ fontSize: 10, color: "#888888" }}
        />
      </FlexWidget>

      {/* Separador sutil */}
      <FlexWidget
        style={{
          height: 1,
          width: "match_parent",
          backgroundColor: "#333333",
          marginBottom: 8,
        }}
      />

      {/* Fila BCV */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
          width: "match_parent",
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 3,
              height: 12,
              backgroundColor: "#2ecc71",
              marginRight: 6,
              borderRadius: 2,
            }}
          />
          <TextWidget
            text="BCV"
            style={{ fontSize: 12, color: "#CCCCCC", fontWeight: "bold" }}
          />
        </FlexWidget>
        <TextWidget
          text={`${bcv}`}
          style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "bold" }}
        />
      </FlexWidget>

      {/* Fila Binance */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          width: "match_parent",
        }}
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 3,
              height: 12,
              backgroundColor: "#f1c40f",
              marginRight: 6,
              borderRadius: 2,
            }}
          />
          <TextWidget
            text="Binance"
            style={{ fontSize: 12, color: "#CCCCCC", fontWeight: "bold" }}
          />
        </FlexWidget>
        <TextWidget
          text={`${binance}`}
          style={{ fontSize: 15, color: "#FFFFFF", fontWeight: "bold" }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}