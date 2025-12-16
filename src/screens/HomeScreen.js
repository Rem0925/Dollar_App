import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView, Animated, Alert, Dimensions } from 'react-native';
import { COLORS } from '../theme';
import { getTasas } from '../services/api';
import CurrencyCard from '../components/CurrencyCard';
import NumPad from '../components/NumPad';
import { formatInput } from '../utils/helpers';
import { Calculator, X, ArrowsClockwise, ArrowsLeftRight, ShareNetwork } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const [showCalculator, setShowCalculator] = useState(false);
    const [amount, setAmount] = useState('0');
    const [baseCurrency, setBaseCurrency] = useState('USD'); 
    
    const fadeAnim = useRef(new Animated.Value(1)).current;
    
    // ESTA ES LA REFERENCIA PARA LA FOTO (Apunta a la vista oculta)
    const hiddenCaptureRef = useRef();

    useEffect(() => { 
        initialLoad(); 
    }, []);

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

    const fetchFreshData = async () => {
        if (!data) setLoading(true);
        else setIsUpdating(true);
        
        try {
            const res = await getTasas();
            if (res) {
                setData(res);
                await AsyncStorage.setItem('@last_rates', JSON.stringify(res));
            }
        } catch (error) {
            console.error("Error API:", error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    };

    const fixDate = (dateString, justDate = false) => {
        if (!dateString) return 'Cargando...';
        const match = dateString.match(/(\d{2})\/(\d{2})\/(\d{2}).*?(\d{1,2}):(\d{2})/);

        if (match) {
            const [_, day, month, year, hour, minute] = match;
            const d = new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hour), parseInt(minute));
            d.setHours(d.getHours() - 4);
            
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
            // Capturamos la vista oculta en lugar de la visible
            const uri = await captureRef(hiddenCaptureRef, {
                format: 'png',
                quality: 1,
                result: 'tmpfile'
            });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert("Error", "No se pudo crear la imagen.");
            console.error(error);
        }
    };

    const toggleCalculator = () => {
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true })
        ]).start();
        setShowCalculator(!showCalculator);
        if (!showCalculator) { setAmount('0'); setBaseCurrency('USD'); }
    };

    const toggleBaseCurrency = () => {
        setBaseCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
        setAmount('0');
    };

    const handleKeyPress = (key) => {
        if (key === 'DEL') {
            setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else {
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

    if (loading) return ( <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={COLORS.accent} /></View> );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            
            {/* --- HEADER VISIBLE (Con hora) --- */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.brand}>Monitor Vzla</Text>
                    {isUpdating ? (
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 2}}>
                            <ActivityIndicator size="small" color={COLORS.binance} style={{marginRight: 5}} />
                            <Text style={{color: COLORS.binance, fontSize: 10, fontWeight: 'bold'}}>ACTUALIZANDO...</Text>
                        </View>
                    ) : (
                        <Text style={styles.date}>{fixDate(data?.fecha)}</Text>
                    )}
                </View>
                <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity style={styles.iconBtn} onPress={shareRates}>
                        <ShareNetwork color={COLORS.textSecondary} size={20} weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={fetchFreshData}>
                        <ArrowsClockwise color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, showCalculator && styles.activeBtn]} onPress={toggleCalculator}>
                        {showCalculator ? <X color="#FFF" size={20}/> : <Calculator color="#FFF" size={20}/>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* --- INTERFAZ REAL (INTERACTIVA) --- */}
            <View style={{flex: 1}}>
                {!showCalculator && (
                    <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
                        <Animated.View style={{ opacity: fadeAnim, padding: 20 }}>
                            <Text style={styles.sectionTitle}>Tasas del Día</Text>
                            <CurrencyCard title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} rate={data?.bcv} />
                            <CurrencyCard title="Binance P2P" symbol="🪙" color={COLORS.binance} rate={data?.binance} />
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

                        {/* AQUÍ MANTENEMOS TU CARRUSEL (ScrollView Horizontal) */}
                        <View style={{ height: 160, marginTop: 10 }}> 
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'center' }}>
                                <CurrencyCard variant="mini" title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} calculatedValue={calculate(data?.bcv)} />
                                <CurrencyCard variant="mini" title="Binance P2P" symbol="🪙" color={COLORS.binance} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : 'USDT'} calculatedValue={calculate(data?.binance)} />
                                <CurrencyCard variant="mini" title="Euro (BCV)" symbol="🇪🇺" color={COLORS.euro} conversionMode={true} resultSymbol={baseCurrency === 'USD' ? 'Bs' : '€'} calculatedValue={calculate(data?.euro)} />
                            </ScrollView>
                        </View>

                        <View style={styles.keyboardContainer}>
                            <NumPad onPress={handleKeyPress} />
                        </View>
                    </Animated.View>
                )}
            </View>

            {/* ======================================================== */}
            {/* VISTA FANTASMA PARA EL CAPTURE (INVISIBLE PERO EXISTE) */}
            {/* ======================================================== */}
            <View 
                ref={hiddenCaptureRef}
                style={styles.hiddenCaptureContainer}
                collapsable={false}
            >
                {/* Header limpio para la foto (sin hora) */}
                <View style={styles.captureHeader}>
                    <Text style={styles.captureBrand}>Monitor Vzla</Text>
                    <Text style={styles.captureDate}>{fixDate(data?.fecha, true)}</Text>
                </View>

                {showCalculator ? (
                    // --- CAPTURA MODO CALCULADORA (VERTICAL) ---
                    <View>
                        {/* 1. MOSTRAR EL MONTO A CONVERTIR */}
                        <View style={[styles.inputDisplay, {paddingHorizontal: 0, paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#333'}]}>
                            <Text style={styles.inputLabel}>
                                {baseCurrency === 'USD' ? 'USD A BOLÍVARES' : 'BOLÍVARES A USD'}
                            </Text>
                            <Text style={[styles.inputValue, {marginTop: 0, fontSize: 40}]}>
                                {baseCurrency === 'USD' ? '$' : 'Bs'} {getFormattedDisplay()}
                            </Text>
                        </View>
                        
                        {/* 2. LISTA VERTICAL DE RESULTADOS (Más clara) */}
                        {/* Usamos el diseño "Full" por defecto, no el mini */}
                        <CurrencyCard 
                            title="BCV (Oficial)" 
                            symbol="🏦" 
                            color={COLORS.bcv} 
                            rate={data?.bcv} // Pasamos la tasa también por si acaso
                            conversionMode={true} 
                            showRate={true}
                            resultSymbol={baseCurrency === 'USD' ? 'Bs' : '$'} 
                            calculatedValue={calculate(data?.bcv)} 
                        />
                        <CurrencyCard 
                            title="Binance P2P" 
                            symbol="🪙" 
                            color={COLORS.binance} 
                            rate={data?.binance}
                            conversionMode={true} 
                            showRate={true}
                            resultSymbol={baseCurrency === 'USD' ? 'Bs' : 'USDT'} 
                            calculatedValue={calculate(data?.binance)} 
                        />
                        <CurrencyCard 
                            title="Euro (BCV)" 
                            symbol="🇪🇺" 
                            color={COLORS.euro} 
                            rate={data?.euro}
                            conversionMode={true} 
                            showRate={true}
                            resultSymbol={baseCurrency === 'USD' ? 'Bs' : '€'} 
                            calculatedValue={calculate(data?.euro)} 
                        />
                    </View>
                ) : (
                    // --- CAPTURA MODO HOME (VERTICAL) ---
                    <View>
                        <Text style={[styles.sectionTitle, {marginTop: 10}]}>Tasas del Día</Text>
                        <CurrencyCard title="BCV (Oficial)" symbol="🏦" color={COLORS.bcv} rate={data?.bcv} />
                        <CurrencyCard title="Binance P2P" symbol="🪙" color={COLORS.binance} rate={data?.binance} />
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
    date: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
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

    // --- ESTILOS PARA LA VISTA FANTASMA (CAPTURE) ---
    hiddenCaptureContainer: {
        position: 'absolute',
        left: -9999, // Sacamos la vista de la pantalla
        top: 0,
        width: width, // Ancho exacto del dispositivo
        backgroundColor: COLORS.background, // Fondo negro sólido
        padding: 20,
        paddingBottom: 40,
    },
    captureHeader: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 10 },
    captureBrand: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900' },
    captureDate: { color: COLORS.textSecondary, fontSize: 14, marginTop: 4, fontWeight: '500' },
    footerText: { textAlign: 'center', color: '#555', marginTop: 25, fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
});