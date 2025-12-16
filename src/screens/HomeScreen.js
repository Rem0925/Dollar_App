import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, StyleSheet, StatusBar, ActivityIndicator, SafeAreaView, 
    TouchableOpacity, ScrollView, Animated, Alert, Dimensions, Modal,Platform
} from 'react-native';
import { COLORS } from '../theme';
import { getTasas, getDiasDisponibles } from '../services/api';
import CurrencyCard from '../components/CurrencyCard';
import NumPad from '../components/NumPad';
import { formatInput } from '../utils/helpers';
// Iconos
import { Calculator, X, ArrowsClockwise, ArrowsLeftRight, ShareNetwork, CaretLeft, CaretRight, CalendarBlank } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    // --- ESTADOS PARA EL CALENDARIO ---
    const [modalVisible, setModalVisible] = useState(false);
    const [calMonth, setCalMonth] = useState(new Date().getMonth());
    const [calYear, setCalYear] = useState(new Date().getFullYear());
    const [availableDays, setAvailableDays] = useState([]); 
    const [loadingCalendar, setLoadingCalendar] = useState(false);
    const [selectedDateStr, setSelectedDateStr] = useState(null); 
    
    const [showCalculator, setShowCalculator] = useState(false);
    const [amount, setAmount] = useState('0');
    const [baseCurrency, setBaseCurrency] = useState('USD'); 
    
    const fadeAnim = useRef(new Animated.Value(1)).current;
    
    // Referencia para la foto
    const hiddenCaptureRef = useRef();

    // --- CÁLCULO DEL PROMEDIO (Restaurado) ---
    // Se calcula dinámicamente si hay data
    const promedioRate = data ? (parseFloat(data.bcv) + parseFloat(data.binance)) / 2 : 0;

    useEffect(() => { 
        initialLoad(); 
    }, []);

    useEffect(() => {
        if (modalVisible) {
            cargarDiasCalendario();
        }
    }, [calMonth, calYear, modalVisible]);

    const initialLoad = async () => {
        try {
            const cached = await AsyncStorage.getItem('@last_rates');
            if (cached) {
                setData(JSON.parse(cached));
                setLoading(false);
            }
        } catch (e) { console.log('Error caché', e); }
        fetchFreshData();
    };

    const fetchFreshData = async (dateString = null) => {
        if (!data) setLoading(true);
        else setIsUpdating(true);
        
        try {
            const res = await getTasas(dateString);
            if (res && res.bcv) {
                setData(res);
                if (!dateString) {
                    await AsyncStorage.setItem('@last_rates', JSON.stringify(res));
                    setSelectedDateStr(null);
                } else {
                    setSelectedDateStr(dateString);
                }
            } else {
                if (dateString) Alert.alert("Aviso", "No hay datos para esta fecha.");
            }
        } catch (error) {
            console.error("Error API:", error);
            Alert.alert("Error", "Error de conexión.");
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    // --- CALENDARIO LOGIC ---
    const cargarDiasCalendario = async () => {
        setLoadingCalendar(true);
        const dias = await getDiasDisponibles(calMonth, calYear);
        setAvailableDays(dias);
        setLoadingCalendar(false);
    };

    const changeMonth = (delta) => {
        let newMonth = calMonth + delta;
        let newYear = calYear;
        if (newMonth > 11) { newMonth = 0; newYear++; }
        else if (newMonth < 0) { newMonth = 11; newYear--; }
        setCalMonth(newMonth);
        setCalYear(newYear);
    };

    const handleDayPress = (day) => {
        const mesFmt = String(calMonth + 1).padStart(2, '0');
        const diaFmt = String(day).padStart(2, '0');
        const fechaFull = `${calYear}-${mesFmt}-${diaFmt}`;
        setModalVisible(false);
        fetchFreshData(fechaFull);
    };

    const handleResetToToday = () => {
        setModalVisible(false);
        const hoy = new Date();
        setCalMonth(hoy.getMonth());
        setCalYear(hoy.getFullYear());
        fetchFreshData(null);
    };

    const fixDate = (dateString, justDate = false) => {
        if (!dateString) return 'Cargando...';
        const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{2}).*?(\d{1,2}):(\d{2})/);

        if (match) {
            const [_, day, month, year, hour, minute] = match;
            const d = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
            d.setHours(d.getHours() + 8);
            
            if (justDate) {
                return d.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit', year: '2-digit' });
            }
            return d.toLocaleString('es-VE', { 
                day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute:'2-digit', hour12: true 
            });
        }
        return dateString;
    };

    const shareRates = async () => {
        try {
            const uri = await captureRef(hiddenCaptureRef, { format: 'png', quality: 1, result: 'tmpfile' });
            await Sharing.shareAsync(uri);
        } catch (error) { Alert.alert("Error", "No se pudo crear la imagen."); }
    };

    const toggleCalculator = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
        setShowCalculator(!showCalculator);
        if (!showCalculator) { setAmount('0'); setBaseCurrency('USD'); }
    };

    const toggleBaseCurrency = () => { setBaseCurrency(prev => prev === 'USD' ? 'VES' : 'USD'); setAmount('0'); };

    const handleKeyPress = (key) => {
        if (key === 'DEL') { setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0'); } 
        else {
            if (key === ',' && amount.includes(',')) return;
            if (amount.replace(/[^0-9]/g, '').length > 11) return;
            setAmount(prev => prev === '0' && key !== ',' ? key : prev + key);
        }
    };

    const parseAmount = () => parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
    
    const getFormattedDisplay = () => {
        if (!amount) return '0';
        const parts = amount.split(',');
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        if (parts.length > 1) return `${integerPart},${parts[1]}`;
        return integerPart + (amount.endsWith(',') ? ',' : '');
    };

    const calculate = (rate) => {
        const val = parseAmount();
        const rateVal = parseFloat(rate);
        if (!val || !rateVal) return 0;
        return baseCurrency === 'USD' ? val * rateVal : val / rateVal;
    };

    const renderCalendarGrid = () => {
        const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
        const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
        const grid = [];
        for (let i = 0; i < firstDayIndex; i++) grid.push(<View key={`empty-${i}`} style={styles.calDay} />);
        for (let d = 1; d <= daysInMonth; d++) {
            const hasData = availableDays.includes(d);
            grid.push(
                <TouchableOpacity 
                    key={`day-${d}`} 
                    style={[styles.calDay, hasData && styles.calDayActive]}
                    disabled={!hasData}
                    onPress={() => handleDayPress(d)}
                >
                    <Text style={[styles.calDayText, hasData && styles.calDayTextActive]}>{d}</Text>
                </TouchableOpacity>
            );
        }
        return grid;
    };

    if (loading) return ( <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.accent} /></View> );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* --- HEADER --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.brand}>Monitor Vzla</Text>
                    {isUpdating ? (
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                            <ActivityIndicator size="small" color={COLORS.binance} style={{marginRight: 5}} />
                            <Text style={{color: COLORS.binance, fontSize: 10, fontWeight: 'bold'}}>ACTUALIZANDO...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity style={styles.dateSelector} onPress={() => setModalVisible(true)}>
                            <CalendarBlank color={COLORS.textSecondary} size={14} weight="bold" style={{marginRight:4}} />
                            <Text style={styles.date}>
                                {selectedDateStr ? `Histórico: ${fixDate(data?.fecha, true)}` : fixDate(data?.fecha)}
                            </Text>
                            <CaretRight color={COLORS.textSecondary} size={12} style={{marginLeft:2, marginTop:1}} />
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity style={styles.iconBtn} onPress={shareRates}>
                        <ShareNetwork color={COLORS.textSecondary} size={20} weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => fetchFreshData(selectedDateStr)}>
                        <ArrowsClockwise color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, showCalculator && styles.activeBtn]} onPress={toggleCalculator}>
                        {showCalculator ? <X color="#FFF" size={20}/> : <Calculator color="#FFF" size={20}/>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- INTERFAZ --- */}
            <View style={{flex: 1}}>
                {!showCalculator && (
                    <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
                        <Animated.View style={{ opacity: fadeAnim, padding: 20 }}>
                            {selectedDateStr && (
                                <TouchableOpacity onPress={handleResetToToday} style={styles.backToTodayBtn}>
                                    <Text style={styles.backToTodayText}>Volver al precio actual</Text>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.sectionTitle}>
                                {selectedDateStr ? 'Tasas Históricas' : 'Tasas del Día'}
                            </Text>
                            
                            <CurrencyCard title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} rate={data?.bcv} />
                            <CurrencyCard title="Binance P2P" symbol="🪙" color={COLORS.binance} rate={data?.binance} />
                            {/* Promedio Restaurado */}
                            <CurrencyCard title="Promedio" symbol="⚖️" color={COLORS.promedio} rate={promedioRate} />
                            <CurrencyCard title="Euro (BCV)" symbol="🇪🇺" color={COLORS.euro} rate={data?.euro} />
                        </Animated.View>
                    </ScrollView>
                )}

                {showCalculator && (
                    <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
                        <View style={styles.inputDisplay}>
                            <View style={styles.inputLabelRow}>
                                <Text style={styles.inputLabel}>{baseCurrency === 'USD' ? 'USD A BOLÍVARES' : 'BOLÍVARES A USD'}</Text>
                                <TouchableOpacity style={styles.swapBtn} onPress={toggleBaseCurrency}>
                                    <ArrowsLeftRight color={COLORS.accent} size={16} weight="bold" />
                                    <Text style={styles.swapText}>Invertir</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.inputValue} numberOfLines={1} adjustsFontSizeToFit>
                                {baseCurrency === 'USD' ? '$' : 'Bs'} {getFormattedDisplay()}
                            </Text>
                        </View>

                        <View style={{ height: 160, marginTop: 10 }}> 
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
                                <CurrencyCard variant="mini" title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} calculatedValue={calculate(data?.bcv)} />
                                <CurrencyCard variant="mini" title="Binance P2P" symbol="🪙" color={COLORS.binance} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : 'USDT'} calculatedValue={calculate(data?.binance)} />
                                {/* Promedio en Calculadora Restaurado */}
                                <CurrencyCard 
                                    variant="mini" 
                                    title="Promedio" 
                                    symbol="⚖️" 
                                    color={COLORS.promedio} 
                                    conversionMode={true} 
                                    resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} 
                                    calculatedValue={calculate(promedioRate)} 
                                />
                                <CurrencyCard variant="mini" title="Euro (BCV)" symbol="🇪🇺" color={COLORS.euro} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '€'} calculatedValue={calculate(data?.euro)} />
                            </ScrollView>
                        </View>

                        <View style={styles.keyboardContainer}>
                            <NumPad onPress={handleKeyPress} />
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* --- MODAL CALENDARIO --- */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Histórico</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={COLORS.textPrimary} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.calControls}>
                            <TouchableOpacity style={styles.calBtn} onPress={() => changeMonth(-1)}><CaretLeft size={20} color={COLORS.textPrimary} /></TouchableOpacity>
                            <Text style={styles.calMonthTitle}>{new Date(calYear, calMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</Text>
                            <TouchableOpacity style={styles.calBtn} onPress={() => changeMonth(1)}><CaretRight size={20} color={COLORS.textPrimary} /></TouchableOpacity>
                        </View>
                        <View style={styles.calGridHeader}>
                            {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map((d,i) => <Text key={i} style={styles.calHeaderDay}>{d}</Text>)}
                        </View>
                        <View style={styles.calGridContainer}>
                            {loadingCalendar ? (
                                <View style={{flex: 1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="small" color={COLORS.accent} /></View>
                            ) : (
                                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>{renderCalendarGrid()}</View>
                            )}
                        </View>
                        <TouchableOpacity style={styles.calTodayBtn} onPress={handleResetToToday}>
                            <Text style={styles.calTodayBtnText}>Ver Precio Actual</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- CAPTURE OCULTO (Con Promedio Restaurado) --- */}
            <View ref={hiddenCaptureRef} style={styles.hiddenCaptureContainer} collapsable={false}>
                <View style={styles.captureHeader}>
                    <Text style={styles.captureBrand}>Monitor Vzla</Text>
                    <Text style={styles.captureDate}>{fixDate(data?.fecha, true)}</Text>
                </View>

                {showCalculator ? (
                    <View>
                        <View style={[styles.inputDisplay, {paddingHorizontal: 0, paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333'}]}>
                            <Text style={styles.inputLabel}>{baseCurrency === 'USD' ? 'USD A BOLÍVARES' : 'BOLÍVARES A USD'}</Text>
                            <Text style={[styles.inputValue, {marginTop: 0, fontSize: 40}]}>{baseCurrency === 'USD' ? '$' : 'Bs'} {getFormattedDisplay()}</Text>
                        </View>
                        <CurrencyCard title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} rate={data?.bcv} conversionMode={true} showRate={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} calculatedValue={calculate(data?.bcv)} />
                        <CurrencyCard title="Binance P2P" symbol="🪙" color={COLORS.binance} rate={data?.binance} conversionMode={true} showRate={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : 'USDT'} calculatedValue={calculate(data?.binance)} />
                        {/* Promedio Capture Calc */}
                        <CurrencyCard 
                            title="Promedio" 
                            symbol="⚖️" 
                            color={COLORS.promedio} 
                            rate={promedioRate} 
                            conversionMode={true} 
                            showRate={true} 
                            resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} 
                            calculatedValue={calculate(promedioRate)} 
                        />
                        <CurrencyCard title="Euro (BCV)" symbol="🇪🇺" color={COLORS.euro} rate={data?.euro} conversionMode={true} showRate={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '€'} calculatedValue={calculate(data?.euro)} />
                    </View>
                ) : (
                    <View>
                        <Text style={[styles.sectionTitle, {marginTop: 10}]}>Tasas del Día</Text>
                        <CurrencyCard title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} rate={data?.bcv} />
                        <CurrencyCard title="Binance P2P" symbol="🪙" color={COLORS.binance} rate={data?.binance} />
                        {/* Promedio Capture Home */}
                        <CurrencyCard title="Promedio" symbol="⚖️" color={COLORS.promedio} rate={promedioRate} />
                        <CurrencyCard title="Euro (BCV)" symbol="🇪🇺" color={COLORS.euro} rate={data?.euro} />
                    </View>
                )}
                <Text style={styles.footerText}>Generado por Monitor Vzla App</Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    
    header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333', backgroundColor: COLORS.background },
    brand: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    
    dateSelector: { flexDirection: 'row', alignItems: 'center', marginTop: 2, paddingVertical: 4 },
    date: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '500' },

    iconBtn: { width: 38, height: 38, backgroundColor: COLORS.cardBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    activeBtn: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },

    scrollArea: { flex: 1, backgroundColor: COLORS.background }, 
    sectionTitle: { color: COLORS.textSecondary, marginBottom: 15, fontSize: 14, textTransform: 'uppercase', fontWeight: '600' },
    inputDisplay: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: COLORS.background },
    inputLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    inputLabel: { color: COLORS.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    swapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    swapText: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold' },
    inputValue: { color: COLORS.textPrimary, fontSize: 48, fontWeight: '900', textAlign: 'right' },
    keyboardContainer: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 85, paddingTop: 5, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 20 },

    hiddenCaptureContainer: { position: 'absolute', left: -9999, top: 0, width: width, backgroundColor: COLORS.background, padding: 20, paddingBottom: 40 },
    captureHeader: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
    captureBrand: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900' },
    captureDate: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, fontWeight: '500' },
    footerText: { textAlign: 'center', color: '#555', marginTop: 25, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { width: '100%', maxWidth: 360, backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#333', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    
    calControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: COLORS.cardBg, padding: 5, borderRadius: 15 },
    calBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center' },
    calMonthTitle: { color: COLORS.textPrimary, fontWeight: '700', fontSize: 14, letterSpacing: 0.5 },
    calGridHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, paddingHorizontal: 5 },
    calHeaderDay: { width: '14.28%', textAlign: 'center', color: COLORS.textSecondary, fontSize: 12, fontWeight: 'bold' },
    calGridContainer: { minHeight: 260 },
    calDay: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10, marginVertical: 2 },
    calDayActive: { backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.textSecondary },
    calDayText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '500' },
    calDayTextActive: { color: COLORS.textPrimary, fontWeight: 'bold' },
    
    calTodayBtn: { marginTop: 15, backgroundColor: COLORS.accent, padding: 14, borderRadius: 16, alignItems: 'center' },
    calTodayBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    backToTodayBtn: { backgroundColor: '#1E1E1E', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#333' },
    backToTodayText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
});