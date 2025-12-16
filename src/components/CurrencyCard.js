import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../theme';
import { formatCurrency } from '../utils/helpers'; // <--- IMPORTANTE

export default function CurrencyCard({ title, rate, symbol, color, conversionMode, calculatedValue, resultSymbol, variant = 'full' }) {
    
    // --- DISEÑO MINI (CARRUSEL) ---
    if (variant === 'mini') {
        return (
            <View style={[styles.miniContainer, { borderTopColor: color }]}>
                <View style={styles.miniHeader}>
                    <View style={[styles.miniIcon, { backgroundColor: color + '20' }]}>
                        <Text style={{ fontSize: 16 }}>{symbol}</Text>
                    </View>
                    <Text style={[styles.miniTitle, {color: color}]}>{title.split(' ')[0]}</Text>
                </View>
                
                <View style={styles.miniBody}>
                    <Text style={styles.miniLabel}>Recibes</Text>
                    <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
                        <Text style={[styles.miniSymbol, {color: COLORS.textSecondary, fontSize: 10, marginRight: 2}]}>{resultSymbol}</Text>
                        {/* APLICAMOS EL FORMATO AQUÍ */}
                        <Text style={[styles.miniValue, { color: color }]}>
                            {formatCurrency(calculatedValue)} 
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    // --- DISEÑO NORMAL (LISTA) ---
    return (
        <View style={[styles.container, { borderLeftColor: color }]}>
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                    <Text style={{ fontSize: 18 }}>{symbol}</Text>
                </View>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={styles.body}>
                {conversionMode ? (
                    <View>
                        <View style={{flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 4}}>
                            <Text style={{color: color, fontSize: 14, fontWeight: 'bold'}}>{resultSymbol}</Text>
                            {/* APLICAMOS EL FORMATO AQUÍ */}
                            <Text style={[styles.value, { color: color }]}>{formatCurrency(calculatedValue)}</Text>
                        </View>
                        <Text style={styles.label}>Recibes Aprox.</Text>
                    </View>
                ) : (
                    <View>
                        {/* APLICAMOS EL FORMATO AQUÍ */}
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
        backgroundColor: COLORS.cardBg, borderRadius: SIZES.radius, padding: 16, marginBottom: 12,
        borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 3,
    },
    header: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    title: { color: COLORS.textPrimary, fontSize: SIZES.body, fontWeight: '700' },
    body: { alignItems: 'flex-end' },
    value: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800' },
    label: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase', fontWeight: '600', marginTop: 2, textAlign: 'right' },

    miniContainer: {
        backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 15, marginRight: 15,
        width: 150, height: 130, borderTopWidth: 4, justifyContent: 'space-between',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    miniHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    miniIcon: { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
    miniTitle: { fontSize: 12, fontWeight: 'bold' },
    miniBody: { alignItems: 'flex-start' },
    miniLabel: { color: COLORS.textSecondary, fontSize: 10, textTransform: 'uppercase' },
    miniSymbol: { fontWeight: 'bold' },
    miniValue: { fontSize: 18, fontWeight: '900', marginTop: 2 },
});