import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, SafeAreaView, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { COLORS } from '../theme';
import { getTasas } from '../services/api';
import CurrencyCard from '../components/CurrencyCard';
import NumPad from '../components/NumPad';
import { Calculator, X, ArrowsClockwise, ArrowsLeftRight } from 'phosphor-react-native';

export default function HomeScreen() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [showCalculator, setShowCalculator] = useState(false);
    const [amount, setAmount] = useState('0'); // Guardamos el string tal cual escribe el usuario (con coma)
    const [baseCurrency, setBaseCurrency] = useState('USD'); 
    
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getTasas();
            setData(res);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
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
            if (key === ',' && amount.includes(',')) return; // Evitar doble coma
            if (amount.replace(/[^0-9]/g, '').length > 12) return; // Limite de dígitos
            setAmount(prev => prev === '0' && key !== ',' ? key : prev + key);
        }
    };

    // Función para mostrar el número bonito en pantalla (con puntos de miles)
    const getFormattedDisplay = () => {
        if (!amount) return '0';
        // Separamos enteros y decimales por la coma
        const parts = amount.split(',');
        // Formateamos la parte entera con puntos
        const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        
        // Si hay coma, la agregamos
        if (parts.length > 1) {
            return `${integerPart},${parts[1]}`;
        }
        return integerPart + (amount.endsWith(',') ? ',' : '');
    };

    // Función para convertir el string visual a número Javascript válido para multiplicar
    const parseAmount = () => {
        // Reemplaza puntos por nada (1.000 -> 1000) y comas por puntos (1000,50 -> 1000.50)
        return parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0;
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
            
            <View style={styles.header}>
                <View>
                    <Text style={styles.brand}>Monitor Vzla</Text>
                    <Text style={styles.date}>{data?.fecha || 'Sin fecha'}</Text>
                </View>
                <View style={{flexDirection: 'row', gap: 10}}>
                    <TouchableOpacity style={styles.iconBtn} onPress={loadData}>
                        <ArrowsClockwise color={COLORS.textSecondary} size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, showCalculator && styles.activeBtn]} onPress={toggleCalculator}>
                        {showCalculator ? <X color="#FFF" size={20}/> : <Calculator color="#FFF" size={20}/>}
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{flex: 1}}>
                {!showCalculator && (
                    <ScrollView style={styles.scrollArea} contentContainerStyle={{ paddingBottom: 100 }}>
                        <Animated.View style={{ opacity: fadeAnim }}>
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
                                <Text style={styles.inputLabel}>{baseCurrency === 'USD' ? 'USD A CONVERTIR' : 'BOLÍVARES A CONVERTIR'}</Text>
                                <TouchableOpacity style={styles.swapBtn} onPress={toggleBaseCurrency}>
                                    <ArrowsLeftRight color={COLORS.accent} size={16} weight="bold" />
                                    <Text style={styles.swapText}>Invertir</Text>
                                </TouchableOpacity>
                            </View>
                            
                            {/* USAMOS LA NUEVA FUNCIÓN DE VISUALIZACIÓN */}
                            <Text style={styles.inputValue} numberOfLines={1} adjustsFontSizeToFit>
                                {baseCurrency === 'USD' ? '$' : 'Bs'} {getFormattedDisplay()}
                            </Text>
                        </View>

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    center: { justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
    brand: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
    date: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
    iconBtn: { width: 38, height: 38, backgroundColor: COLORS.cardBg, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
    activeBtn: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
    scrollArea: { flex: 1, paddingHorizontal: 20, paddingTop: 15 },
    sectionTitle: { color: COLORS.textSecondary, marginBottom: 15, fontSize: 14, textTransform: 'uppercase', fontWeight: '600' },
    inputDisplay: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: COLORS.background },
    inputLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    inputLabel: { color: COLORS.accent, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    swapBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    swapText: { color: COLORS.accent, fontSize: 10, fontWeight: 'bold' },
    inputValue: { color: COLORS.textPrimary, fontSize: 48, fontWeight: '900', textAlign: 'right' },
    keyboardContainer: { backgroundColor: COLORS.cardBg, borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 85, paddingTop: 5, position: 'absolute', bottom: 0, left: 0, right: 0, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 20 }
});