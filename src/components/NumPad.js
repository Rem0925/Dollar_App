import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../theme';
import { Backspace } from 'phosphor-react-native';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'DEL'];

export default function NumPad({ onPress }) {
    const keyWidth = Dimensions.get('window').width / 3;
    const keyHeight = Dimensions.get('window').height * 0.065;

    return (
        <View style={styles.grid}>
            {keys.map((k) => (
                <TouchableOpacity 
                    key={k} 
                    style={[styles.key, { width: keyWidth, height: keyHeight }]} 
                    onPress={() => onPress(k)}
                    activeOpacity={0.5} 
                >
                    {k === 'DEL' ? (
                        <View style={[styles.delBtn, { height: keyHeight * 0.7 }]}>
                            <Backspace color={COLORS.danger} weight="bold" size={22} />
                        </View>
                    ) : k === ',' ? (
                        // Mostramos la coma grande
                        <Text style={[styles.keyText, { paddingBottom: 10 }]}>,</Text>
                    ) : (
                        <Text style={styles.keyText}>{k}</Text>
                    )}
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
        paddingTop: 5, backgroundColor: COLORS.cardBg,
    },
    key: { justifyContent: 'center', alignItems: 'center' },
    keyText: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '500' },
    delBtn: {
        width: 60, justifyContent: 'center', alignItems: 'center',
        borderRadius: 15, backgroundColor: 'rgba(239, 68, 68, 0.1)',
    }
});