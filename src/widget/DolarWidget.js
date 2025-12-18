import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function DolarWidget({ bcv, binance, lastUpdate }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1E1E1E', // Color de fondo de tarjeta de tu app
        borderRadius: 16,
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 12,
        borderWidth: 2,
        borderColor: '#333333'
      }}
    >
      {/* Título y Hora */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, width: 'match_parent' }}>
        <TextWidget
          text="Monitor Vzla"
          style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' }}
        />
        <TextWidget
          text={lastUpdate}
          style={{ fontSize: 10, color: '#888888' }}
        />
      </FlexWidget>

      {/* Separador */}
      <FlexWidget style={{ height: 1, width: 'match_parent', backgroundColor: '#333333', marginBottom: 10 }} />

      {/* Fila BCV */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, width: 'match_parent' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget style={{ width: 4, height: 16, backgroundColor: '#2ecc71', marginRight: 8, borderRadius: 2 }} />
          <TextWidget text="BCV" style={{ fontSize: 13, color: '#CCCCCC', fontWeight: 'bold' }} />
        </FlexWidget>
        <TextWidget text={`${bcv} Bs`} style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }} />
      </FlexWidget>

      {/* Fila Binance */}
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 'match_parent' }}>
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <FlexWidget style={{ width: 4, height: 16, backgroundColor: '#f1c40f', marginRight: 8, borderRadius: 2 }} />
          <TextWidget text="Binance" style={{ fontSize: 13, color: '#CCCCCC', fontWeight: 'bold' }} />
        </FlexWidget>
        <TextWidget text={`${binance} Bs`} style={{ fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' }} />
      </FlexWidget>

    </FlexWidget>
  );
}