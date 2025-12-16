import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '../theme';
import { getHistorial } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const { width } = Dimensions.get('window');

export default function ChartScreen() {
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [yAxisOffset, setYAxisOffset] = useState(0);
    
    // Estado para la leyenda dinámica
    const [currentValues, setCurrentValues] = useState({ 
        date: '--/--', 
        bcv: 0, 
        binance: 0, 
        euro: 0 
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
        const allValues = []; 

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

            // --- CORRECCIÓN CLAVE: Guardamos 'originalValue' ---
            // 'value' se usa para dibujar (será afectado por el offset)
            // 'originalValue' se usa para mostrar el texto real
            bcvData.push({ 
                value: lastBCV, 
                originalValue: lastBCV, // <--- Dato real
                label: i % 6 === 0 ? dateLabel : '', 
                date: dateLabel 
            });
            binanceData.push({ 
                value: lastBinance, 
                originalValue: lastBinance, 
                date: dateLabel 
            });
            euroData.push({ 
                value: lastEuro, 
                originalValue: lastEuro, 
                date: dateLabel 
            });

            allValues.push(lastBCV, lastBinance, lastEuro);
        }

        // CALCULAR OFFSET (ZOOM)
        const minVal = Math.min(...allValues);
        // Restamos un poco menos para dejar aire abajo
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
        
        // Inicializar leyenda
        setCurrentValues({
            date: bcvData[bcvData.length - 1].date,
            bcv: lastBCV,
            binance: lastBinance,
            euro: lastEuro
        });

        setLoading(false);
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color={COLORS.accent} /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.headerText}>
                <Text style={styles.title}>Mercado Cambiario</Text>
                <Text style={styles.subtitle}>Desliza para ver detalles</Text>
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
                    
                    // --- CORRECCIÓN EJE Y: Sumamos el offset para mostrar el valor real ---
                    formatYLabel={(val) => {
                        // Si val es un string vacío, retornar vacío
                        if (!val) return '';
                        // Sumamos el offset que la librería restó
                        const realValue = parseFloat(val) + yAxisOffset;
                        return Math.round(realValue).toString(); // Mostramos enteros para limpieza
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
                            const item1 = items[0];
                            const item2 = items[1];
                            const item3 = items[2];

                            setTimeout(() => {
                                setCurrentValues({
                                    date: item1.date,
                                    // --- USAMOS 'originalValue' AQUÍ ---
                                    bcv: item1.originalValue,
                                    binance: item2?.originalValue || 0,
                                    euro: item3?.originalValue || 0
                                });
                            }, 0);

                            return (
                                <View style={styles.tooltip}>
                                    <Text style={styles.tooltipDate}>{item1.date}</Text>
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
                    <LegendItem 
                        label="BCV" 
                        value={currentValues.bcv} 
                        color={COLORS.bcv} 
                    />
                    <LegendItem 
                        label="Binance" 
                        value={currentValues.binance} 
                        color={COLORS.binance} 
                    />
                    <LegendItem 
                        label="Euro" 
                        value={currentValues.euro} 
                        color={COLORS.euro} 
                    />
                </View>
            </View>
        </View>
    );
}

const LegendItem = ({ label, value, color }) => (
    <View style={[styles.legendCard, { borderTopColor: color }]}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <View>
            <Text style={[styles.legendLabel, { color: color }]}>{label}</Text>
            {/* Aquí usamos formatCurrency que ya maneja los puntos y comas */}
            <Text style={styles.legendValue}>{formatCurrency(value)}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, paddingTop: 60 },
    center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
    headerText: { paddingHorizontal: 20, marginBottom: 20 },
    title: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800' },
    subtitle: { color: COLORS.textSecondary, fontSize: 14 },
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
    legendGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    legendCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '32%', 
        paddingTop: 5,
        borderTopWidth: 2, 
    },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8, marginTop: 4 },
    legendLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    legendValue: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', marginTop: 2 }
});