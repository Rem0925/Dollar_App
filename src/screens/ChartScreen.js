import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions,ActivityIndicator} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '../theme';
import { getHistorial } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Color específico para el promedio (Morado)
const PROMEDIO_COLOR = '#8e44ad';

export default function ChartScreen() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yAxisOffset, setYAxisOffset] = useState(0);
    
    // Estadísticas generales del periodo (Fijas)
    const [periodStats, setPeriodStats] = useState({
        avgGapPercent: 0,
        avgGapAmount: 0
    });

    // Estado para la leyenda dinámica (Cambia al tocar)
    const [currentValues, setCurrentValues] = useState({ 
        date: '--/--', 
        bcv: 0, 
        binance: 0, 
        euro: 0,
        promedio: 0
    });

    useEffect(() => {
        processChartData();
    }, []);

    const processChartData = async () => {
        const rawData = await getHistorial();
        
        const dataMap = {};
        rawData.forEach(item => { dataMap[item.fecha] = item; });

        const bcvData = [];
        const binanceData = [];
        const euroData = [];
        const promedioData = []; 
        const allValues = []; 

        // Variables para calcular estadísticas del periodo
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

            // Calcular promedio del día (Línea morada)
            const avgVal = (lastBCV + lastBinance) / 2;

            // Calcular estadísticas de brecha para este punto
            const gapAmt = lastBinance - lastBCV;
            const gapPct = lastBCV > 0 ? (gapAmt / lastBCV) * 100 : 0;
            
            totalGapAmount += gapAmt;
            totalGapPercent += gapPct;
            count++;

            bcvData.push({ 
                value: lastBCV, 
                originalValue: lastBCV, 
                label: i % 6 === 0 ? dateLabel : '', 
                date: dateLabel 
            });
            binanceData.push({ 
                value: lastBinance, 
                originalValue: lastBinance, 
                date: dateLabel 
            });
            promedioData.push({ 
                value: avgVal, 
                originalValue: avgVal, 
                date: dateLabel 
            });
            euroData.push({ 
                value: lastEuro, 
                originalValue: lastEuro, 
                date: dateLabel 
            });

            allValues.push(lastBCV, lastBinance, lastEuro, avgVal);
        }

        // CALCULAR OFFSET (ZOOM)
        const minVal = Math.min(...allValues);
        const calculatedOffset = Math.floor(minVal * 0.98);
        setYAxisOffset(calculatedOffset);

        const datasets = [
            {
                data: bcvData,
                color: COLORS.bcv,
                dataPointsColor: COLORS.bcv,
                thickness: 3,
                startFillColor: COLORS.bcv,
                endFillColor: COLORS.bcv,
                startOpacity: 0.2,
                endOpacity: 0.0,
                areaChart: true,
            },
            {
                data: binanceData,
                color: COLORS.binance,
                dataPointsColor: COLORS.binance,
                thickness: 3,
                startFillColor: COLORS.binance,
                endFillColor: COLORS.binance,
                startOpacity: 0.15,
                endOpacity: 0.0,
                areaChart: true,
            },
            {
                data: promedioData, // Dataset Promedio
                color: PROMEDIO_COLOR,
                dataPointsColor: PROMEDIO_COLOR,
                thickness: 3,
                startFillColor: PROMEDIO_COLOR,
                endFillColor: PROMEDIO_COLOR,
                startOpacity: 0.1,
                endOpacity: 0.0,
                areaChart: true,
            },
            {
                data: euroData,
                color: COLORS.euro,
                dataPointsColor: COLORS.euro,
                thickness: 3,
                startFillColor: COLORS.euro,
                endFillColor: COLORS.euro,
                startOpacity: 0.15,
                endOpacity: 0.0,
                areaChart: true,
            }
        ];

        setChartData(datasets);
        
        // Guardar estadísticas del periodo
        setPeriodStats({
            avgGapPercent: count > 0 ? totalGapPercent / count : 0,
            avgGapAmount: count > 0 ? totalGapAmount / count : 0
        });

        // Inicializar leyenda con el último dato
        setCurrentValues({
            date: bcvData[bcvData.length - 1].date,
            bcv: lastBCV,
            binance: lastBinance,
            euro: lastEuro,
            promedio: (lastBCV + lastBinance) / 2
        });

        setLoading(false);
    };

    // Cálculo dinámico de la brecha (según lo que toques)
    const gapAmount = currentValues.binance - currentValues.bcv;
    const gapPercent = currentValues.bcv > 0 ? (gapAmount / currentValues.bcv) * 100 : 0;

    if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>;

    return (
    <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
            <View style={styles.headerText}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <Text style={styles.title}>Mercado Cambiario</Text>
                    {/* ESTADÍSTICA DEL MES (Pequeña a la derecha) */}
                    <View style={{alignItems: 'flex-end'}}>
                         <Text style={{color: COLORS.textSecondary, fontSize: 10, fontWeight: 'bold'}}>PROM. MENSUAL</Text>
                         <Text style={{color: COLORS.textPrimary, fontSize: 12, fontWeight: 'bold'}}>{periodStats.avgGapPercent.toFixed(2)}%</Text>
                    </View>
                </View>

                {/* --- SECCIÓN DE DIFERENCIA (Destacando el Monto en Bs) --- */}
                <View style={styles.gapContainer}>
                    <Text style={styles.subtitle}>Brecha (BCV / Binance): </Text>
                    <View style={[
                        styles.gapBadge, 
                        { backgroundColor: gapAmount >= 0 ? 'rgba(46, 204, 113, 0.15)' : 'rgba(231, 76, 60, 0.15)' }
                    ]}>
                        {/* Aquí mostramos primero los Bs, que es lo útil para calcular */}
                        <Text style={[
                            styles.gapText,
                            { color: gapAmount >= 0 ? '#2ecc71' : '#e74c3c' }
                        ]}>
                            {formatCurrency(gapAmount)} Bs  
                            <Text style={{fontSize: 12, opacity: 0.8}}> ({gapPercent.toFixed(2)}%)</Text>
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.chartContainer}>
                <LineChart
                    dataSet={chartData}
                    height={280}
                    width={width - 10}
                    spacing={width / 35}
                    initialSpacing={10}
                    
                    // OFFSET (ZOOM)
                    yAxisOffset={yAxisOffset}

                    formatYLabel={(val) => {
                        if (!val) return '';
                        const realValue = parseFloat(val) + yAxisOffset;
                        return Math.round(realValue).toString();
                    }}
                    
                    hideYAxisText={false}
                    yAxisColor="transparent"
                    xAxisColor="#333"
                    yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                    xAxisLabelTextStyle={{ color: COLORS.textSecondary, fontSize: 10 }}
                    rulesColor="#333333"
                    rulesType="dashed"
                    
                    pointerConfig={{
                        pointerStripHeight: 280,
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
                                    <Text style={styles.tooltipNote}>↓ Ver abajo</Text>
                                </View>
                            );
                        },
                    }}
                />
            </View>

            <View style={styles.dynamicLegendContainer}>
                <View style={styles.legendHeader}>
                    <Text style={styles.legendTitle}>PRECIOS DEL {currentValues.date}</Text>
                </View>
                
                <View style={styles.legendGrid}>
                    <LegendItem label="BCV" value={currentValues.bcv} color={COLORS.bcv} />
                    <LegendItem label="Binance" value={currentValues.binance} color={COLORS.binance} />
                    <LegendItem label="Promedio" value={currentValues.promedio} color={PROMEDIO_COLOR} />
                    <LegendItem label="Euro" value={currentValues.euro} color={COLORS.euro} />
                </View>
            </View>
        </View>
    </SafeAreaView>
    );
}

const LegendItem = ({ label, value, color }) => (
    <View style={[styles.legendCard, { borderTopColor: color }]}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <View>
            <Text style={[styles.legendLabel, { color: color }]}>{label}</Text>
            <Text style={styles.legendValue}>{formatCurrency(value)}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 10 },
    center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    
    headerText: { paddingHorizontal: 20, marginBottom: 20 },
    title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
    subtitle: { color: COLORS.textSecondary, fontSize: 14 },
    
    // Contenedor de la Brecha
    gapContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
    gapBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
    gapText: { fontWeight: 'bold', fontSize: 16 }, 

    chartContainer: { marginLeft: -5 },
    
    tooltip: {
        width: 90,
        backgroundColor: COLORS.cardBg,
        borderRadius: 8,
        padding: 6,
        borderWidth: 1,
        borderColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    tooltipDate: { color: 'white', fontSize: 12, fontWeight: 'bold' },
    tooltipNote: { color: COLORS.textSecondary, fontSize: 9, marginTop: 2 },

    dynamicLegendContainer: {
        marginTop: 20,
        marginHorizontal: 20,
        backgroundColor: COLORS.cardBg,
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
        borderColor: '#333',
        shadowColor: "#000", shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5,
    },
    legendHeader: { borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10, marginBottom: 10, alignItems: 'center' },
    legendTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
    
    legendGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
    legendCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '45%', 
        paddingTop: 5,
        borderTopWidth: 2, 
        marginBottom: 5
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, marginTop: 4 },
    legendLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    legendValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 2 }
});