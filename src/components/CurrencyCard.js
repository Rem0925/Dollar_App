import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from "react-native";
import { COLORS, SIZES } from "../theme";
import { formatCurrency } from "../utils/helpers";
import * as Clipboard from "expo-clipboard"; // Importamos el portapapeles
import * as Haptics from "expo-haptics"; // Para dar feedback táctil al copiar
import { Copy } from "phosphor-react-native"; // Icono de copiar

export default function CurrencyCard({
  title,
  rate,
  symbol,
  color,
  conversionMode,
  calculatedValue,
  resultSymbol,
  variant = "full",
  style,
  showRate = false,
}) {
  // Función para copiar el monto calculado
  const handleCopy = async () => {
    if (calculatedValue) {
      const valueToCopy = formatCurrency(calculatedValue);
      await Clipboard.setStringAsync(valueToCopy);
      await Haptics.selectionAsync(); // Pequeña vibración para confirmar

      // MENSAJE VISUAL (Toast)
      if (Platform.OS === "android") {
        // Muestra el mensaje nativo de Android abajo
        ToastAndroid.show("Copiado al portapapeles", ToastAndroid.SHORT);
      }
    }
  };

  // --- DISEÑO MINI (CARRUSEL / CALCULADORA) ---
  if (variant === "mini") {
    return (
      <TouchableOpacity
        style={[styles.miniContainer, { borderTopColor: color }, style]}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        {/* Header modificado para incluir el icono a la derecha */}
        <View style={[styles.miniHeader, { justifyContent: "space-between" }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={[styles.miniIcon, { backgroundColor: color + "20" }]}>
              <Text style={{ fontSize: 16 }}>{symbol}</Text>
            </View>
            <Text style={[styles.miniTitle, { color: color }]}>
              {title.split(" ")[0]}
            </Text>
          </View>

          {/* Icono pequeño de Copiar */}
          <Copy size={14} color={color} weight="bold" />
        </View>

        <View style={styles.miniBody}>
          <Text style={styles.miniLabel}>Recibes</Text>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={[
                styles.miniSymbol,
                { color: COLORS.textSecondary, fontSize: 10, marginRight: 2 },
              ]}
            >
              {resultSymbol}
            </Text>
            <Text style={[styles.miniValue, { color: color }]}>
              {formatCurrency(calculatedValue)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // --- DISEÑO NORMAL (LISTA / CAPTURE) ---
  return (
    <View style={[styles.container, { borderLeftColor: color }, style]}>
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: color + "20" }]}>
          <Text style={{ fontSize: 18 }}>{symbol}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.body}>
        {conversionMode ? (
          <View style={{ alignItems: "flex-end" }}>
            {/* Resultado de la conversión */}
            <View
              style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}
            >
              <Text style={{ color: color, fontSize: 14, fontWeight: "bold" }}>
                {resultSymbol}
              </Text>
              <Text style={[styles.value, { color: color }]}>
                {formatCurrency(calculatedValue)}
              </Text>
            </View>
            <Text style={styles.label}>Recibes Aprox.</Text>

            {/* Solo se muestra si activamos showRate (para el capture) */}
            {showRate && (
              <Text
                style={[
                  styles.label,
                  { marginTop: 4, opacity: 0.7, fontSize: 11 },
                ]}
              >
                (Tasa: {formatCurrency(rate)})
              </Text>
            )}
          </View>
        ) : (
          <View>
            <Text style={styles.value}>{formatCurrency(rate)}</Text>
            <Text style={styles.label}>Tasa del día</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radius,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  header: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: { color: COLORS.textPrimary, fontSize: SIZES.body, fontWeight: "700" },
  body: { alignItems: "flex-end" },
  value: { color: COLORS.textPrimary, fontSize: 22, fontWeight: "800" },
  label: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textTransform: "uppercase",
    fontWeight: "600",
    marginTop: 2,
    textAlign: "right",
  },

  miniContainer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 12,
    width: 140,
    marginRight: 15,
    height: 130,
    borderTopWidth: 4,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  miniHeader: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  miniIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  miniTitle: { fontSize: 12, fontWeight: "bold" },
  miniBody: { alignItems: "flex-start" },
  miniLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    textTransform: "uppercase",
  },
  miniSymbol: { fontWeight: "bold" },
  miniValue: { fontSize: 17, fontWeight: "900", marginTop: 2 },
});
