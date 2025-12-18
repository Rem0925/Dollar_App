import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '../theme';
import { getHistorial } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';
// Importamos iconos, agregando 'ArrowsDownUp' para el Rango
import { TrendUp, CalendarPlus, ArrowsDownUp, WarningCircle } from 'phosphor-react-native';

const { width } = Dimensions.get('window');
const PROMEDIO_COLOR = '#8e44ad';

export default function ChartScreen() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yAxisOffset, setYAxisOffset] = useState(0);
    
    // Estado ampliado con la nueva métrica (minMax)
    const [periodStats, setPeriodStats] = useState({
        avgGapPercent: 0,
        avgGapAmount: 0,
        avgDailyRise: 0,
        totalMonthRise: 0,
        totalMonthPct: 0,
        minPrice: 0, // Nuevo
        maxPrice: 0  // Nuevo
    });

    const [currentValues, setCurrentValues] = useState({ 
        date: '--/--', bcv: 0, binance: 0, euro: 0, promedio: 0
    });

    useEffect(() => { processChartData(); }, []);

    const processChartData = async () => {
        const rawData = await getHistorial();
        const dataMap = {};
        rawData.forEach(item => { dataMap[item.fecha] = item; });

        const bcvData = [];
        const binanceData = [];
        const euroData = [];
        const promedioData = []; 
        const allValues = []; 

        let totalGapPercent = 0;
        let totalGapAmount = 0;
        let count = 0;

        let lastBCV = rawData.length > 0 ? parseFloat(rawData[0].bcv) : 0;
        let lastBinance = rawData.length > 0 ? parseFloat(rawData[0].binance) : 0;
        let lastEuro = rawData.length > 0 ? parseFloat(rawData[0].euro) : 0;

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const dateLabel = `${day}/${month}`;
            const key = dateLabel;

            if (dataMap[key]) {
                lastBCV = parseFloat(dataMap[key].bcv);
                lastBinance = parseFloat(dataMap[key].binance);
                lastEuro = parseFloat(dataMap[key].euro);
            }

            const avgVal = (lastBCV + lastBinance) / 2;
            const gapAmt = lastBinance - lastBCV;
            const gapPct = lastBCV > 0 ? (gapAmt / lastBCV) * 100 : 0;
            
            totalGapAmount += gapAmt;
            totalGapPercent += gapPct;
            count++;

            bcvData.push({ value: lastBCV, originalValue: lastBCV, label: i % 6 === 0 ? dateLabel : '', date: dateLabel });
            binanceData.push({ value: lastBinance, originalValue: lastBinance, date: dateLabel });
            promedioData.push({ value: avgVal, originalValue: avgVal, date: dateLabel });
            euroData.push({ value: lastEuro, originalValue: lastEuro, date: dateLabel });

            allValues.push(lastBCV, lastBinance, lastEuro, avgVal);
        }

        // --- CÁLCULOS ESTADÍSTICOS ---
        let dailyIncreases = 0;
        let daysCounted = 0;
        const bcvValues = bcvData.map(d => d.value);

        for (let k = 1; k < bcvData.length; k++) {
            const diff = bcvData[k].value - bcvData[k-1].value;
            if (diff !== 0) { dailyIncreases += diff; daysCounted++; }
        }
        
        const avgDailyRise = daysCounted > 0 ? dailyIncreases / daysCounted : 0;
        const totalMonthRise = bcvData[bcvData.length - 1].value - bcvData[0].value;
        const totalMonthPct = bcvData[0].value > 0 ? (totalMonthRise / bcvData[0].value) * 100 : 0;

        // NUEVO: Mínimo y Máximo del periodo
        const minPrice = Math.min(...bcvValues);
        const maxPrice = Math.max(...bcvValues);

        const minValGlobal = Math.min(...allValues);
        const calculatedOffset = Math.floor(minValGlobal * 0.98);
        setYAxisOffset(calculatedOffset);

        const datasets = [
            { data: bcvData, color: COLORS.bcv, dataPointsColor: COLORS.bcv, thickness: 3, startFillColor: COLORS.bcv, endFillColor: COLORS.bcv, startOpacity: 0.2, endOpacity: 0.0, areaChart: true },
            { data: binanceData, color: COLORS.binance, dataPointsColor: COLORS.binance, thickness: 3, startFillColor: COLORS.binance, endFillColor: COLORS.binance, startOpacity: 0.15, endOpacity: 0.0, areaChart: true },
            { data: promedioData, color: PROMEDIO_COLOR, dataPointsColor: PROMEDIO_COLOR, thickness: 3, startFillColor: PROMEDIO_COLOR, endFillColor: PROMEDIO_COLOR, startOpacity: 0.1, endOpacity: 0.0, areaChart: true },
            { data: euroData, color: COLORS.euro, dataPointsColor: COLORS.euro, thickness: 3, startFillColor: COLORS.euro, endFillColor: COLORS.euro, startOpacity: 0.15, endOpacity: 0.0, areaChart: true }
        ];

        setChartData(datasets);
        
        setPeriodStats({
            avgGapPercent: count > 0 ? totalGapPercent / count : 0,
            avgGapAmount: count > 0 ? totalGapAmount / count : 0,
            avgDailyRise,
            totalMonthRise,
            totalMonthPct,
            minPrice, // <---
            maxPrice  // <---
        });

        setCurrentValues({
            date: bcvData[bcvData.length - 1].date,
            bcv: lastBCV,
            binance: lastBinance,
            euro: lastEuro,
            promedio: (lastBCV + lastBinance) / 2
        });

        setLoading(false);
    };

    // Cálculos dinámicos para la tarjeta de Brecha
    const gapAmount = currentValues.binance - currentValues.bcv;
    const gapPercent = currentValues.bcv > 0 ? (gapAmount / currentValues.bcv) * 100 : 0;

    if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>;

    return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            
            {/* 1. CABECERA LIMPIA */}
            <View style={styles.header}>
                <Text style={styles.title}>Historial Cambiario</Text>
                <Text style={styles.dateSubtitle}>Datos al {currentValues.date}</Text>
            </View>

            {/* 2. GRÁFICO (CENTRAL) */}
            <View style={styles.chartWrapper}>
                <LineChart
                    dataSet={chartData}
                    height={240}
                    width={width - 10}
                    spacing={width / 35}
                    initialSpacing={10}
                    yAxisOffset={yAxisOffset}
                    formatYLabel={(val) => {
                        if (!val) return '';
                        return Math.round(parseFloat(val) + yAxisOffset).toString();
                    }}
                    hideYAxisText={false}
                    yAxisColor="transparent"
                    xAxisColor="#333"
                    yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                    rulesColor="#333333"
                    rulesType="dashed"
                    pointerConfig={{
                        pointerStripHeight: 240,
                        pointerStripColor: 'rgba(255,255,255,0.3)',
                        pointerStripWidth: 2,
                        pointerColor: 'white',
                        radius: 6,
                        pointerLabelWidth: 100,
                        pointerLabelHeight: 90,
                        activatePointersOnLongPress: false,
                        autoAdjustPointerLabelPosition: false,
                        shiftPointerLabelY: -40, 
                        pointerLabelComponent: items => {
                            const itemBCV = items[0];
                            const itemBinance = items[1];
                            const itemPromedio = items[2];
                            const itemEuro = items[3];

                            setTimeout(() => {
                                setCurrentValues({
                                    date: itemBCV.date,
                                    bcv: itemBCV.originalValue,
                                    binance: itemBinance?.originalValue || 0,
                                    promedio: itemPromedio?.originalValue || 0,
                                    euro: itemEuro?.originalValue || 0
                                });
                            }, 0);

                            return (
                                <View style={styles.tooltip}>
                                    <Text style={styles.tooltipDate}>{itemBCV.date}</Text>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            {/* LEYENDA DINÁMICA (Justo debajo del gráfico para referencia rápida) */}
            <View style={styles.legendContainer}>
                <LegendItem label="BCV" value={currentValues.bcv} color={COLORS.bcv} />
                <LegendItem label="Binance" value={currentValues.binance} color={COLORS.binance} />
                <LegendItem label="Promedio" value={currentValues.promedio} color={PROMEDIO_COLOR} />
                <LegendItem label="Euro" value={currentValues.euro} color={COLORS.euro} />
            </View>

            {/* 3. PANEL DE ESTADÍSTICAS (GRID 2x2) - TODO ORGANIZADO ABAJO */}
            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>MÉTRICAS DEL PERIODO (30 DÍAS)</Text>
                
                <View style={styles.grid}>
                    {/* CARD 1: BRECHA ACTUAL */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: gapAmount >= 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)' }]}>
                                <WarningCircle size={18} color={gapAmount >= 0 ? '#2ecc71' : '#e74c3c'} weight="fill" />
                            </View>
                            <Text style={styles.statLabel}>BRECHA</Text>
                        </View>
                        <Text style={[styles.statValue, { color: gapAmount >= 0 ? '#2ecc71' : '#e74c3c' }]}>
                            {gapPercent.toFixed(2)}%
                        </Text>
                        <Text style={styles.statSubValue}>{formatCurrency(gapAmount)} Bs</Text>
                    </View>

                    {/* CARD 2: SUBIDA DIARIA */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(52, 152, 219, 0.15)' }]}>
                                <TrendUp size={18} color="#3498db" weight="fill" />
                            </View>
                            <Text style={styles.statLabel}>PROM. DIARIO</Text>
                        </View>
                        <Text style={styles.statValue}>+{formatCurrency(periodStats.avgDailyRise)}</Text>
                        <Text style={styles.statSubValue}>Bolívares / día</Text>
                    </View>

                    {/* CARD 3: ACUMULADO MENSUAL */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(241, 196, 15, 0.15)' }]}>
                                <CalendarPlus size={18} color="#f1c40f" weight="fill" />
                            </View>
                            <Text style={styles.statLabel}>ACUM. MES</Text>
                        </View>
                        <Text style={styles.statValue}>+{formatCurrency(periodStats.totalMonthRise)}</Text>
                        <Text style={styles.statSubValue}>Total ({periodStats.totalMonthPct.toFixed(1)}%)</Text>
                    </View>

                    {/* CARD 4: RANGO (NUEVA MÉTRICA) */}
                    <View style={styles.statCard}>
                        <View style={styles.statHeader}>
                            <View style={[styles.iconBox, { backgroundColor: 'rgba(155, 89, 182, 0.15)' }]}>
                                <ArrowsDownUp size={18} color="#9b59b6" weight="fill" />
                            </View>
                            <Text style={styles.statLabel}>RANGO (MIN-MAX)</Text>
                        </View>
                        <View style={{flexDirection:'row', alignItems:'baseline', gap: 4}}>
                            <Text style={styles.statValueSmall}>{formatCurrency(periodStats.minPrice)}</Text>
                            <Text style={{color:'#666'}}>-</Text>
                            <Text style={styles.statValueSmall}>{formatCurrency(periodStats.maxPrice)}</Text>
                        </View>
                        <Text style={styles.statSubValue}>Fluctuación BCV</Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    </SafeAreaView>
    );
}

// Componente pequeño para la leyenda
const LegendItem = ({ label, value, color }) => (
    <View style={styles.legendItem}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={[styles.lLabel, { color: color }]}>{label}</Text>
        <Text style={styles.lValue}>{formatCurrency(value)}</Text>
    </View>
);

const styles = StyleSheet.create({
    center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    
    // Header Limpio
    header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
    title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '800' },
    dateSubtitle: { color: COLORS.textSecondary, fontSize: 13, marginTop: 2 },

    // Gráfico
    chartWrapper: { marginTop: 20, marginLeft: -10 }, // Ajuste para margen izquierdo
    tooltip: { backgroundColor: COLORS.cardBg, borderRadius: 6, padding: 4, borderWidth: 1, borderColor: '#555' },
    tooltipDate: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    // Leyenda Horizontal Compacta
    legendContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', paddingHorizontal: 10, marginTop: 10, marginBottom: 20 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    dot: { width: 6, height: 6, borderRadius: 3 },
    lLabel: { fontSize: 11, fontWeight: '700' },
    lValue: { color: COLORS.textPrimary, fontSize: 12, fontWeight: 'bold' },

    // Sección de Stats (Grid)
    statsContainer: { paddingHorizontal: 20, paddingBottom: 20 },
    sectionTitle: { color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10, textTransform: 'uppercase' },
    
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    
    // Estilo de Tarjeta
    statCard: { 
        width: '48%', 
        backgroundColor: COLORS.cardBg, 
        borderRadius: 16, 
        padding: 12, 
        borderWidth: 1, 
        borderColor: '#2a2a2a' 
    },
    statHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    iconBox: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    statLabel: { color: COLORS.textSecondary, fontSize: 9, fontWeight: '800' },
    
    statValue: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
    statValueSmall: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '800' }, // Para el rango que son 2 números
    statSubValue: { color: COLORS.textSecondary, fontSize: 11, marginTop: 2, fontWeight: '500' }
});