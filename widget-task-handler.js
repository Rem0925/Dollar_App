import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { DolarWidget } from './src/widget/DolarWidget';
import { getTasas } from './src/services/api'; 

export async function widgetTaskHandler(props) {
  const widgetInfo = props.widgetInfo;

  if (widgetInfo.widgetName === 'DolarWidget') {
    try {
        // 1. Buscamos datos frescos
        const data = await getTasas();
        
        // 2. Preparamos los valores
        const bcvVal = data?.bcv ? parseFloat(data.bcv).toFixed(2) : '--';
        const binanceVal = data?.binance ? parseFloat(data.binance).toFixed(2) : '--';
        
        // Hora actual corta (Ej: 14:30)
        const d = new Date();
        const timeStr = `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;

        // 3. Pintamos el widget
        props.renderWidget(
          <DolarWidget 
            bcv={bcvVal} 
            binance={binanceVal} 
            lastUpdate={timeStr} 
          />
        );
    } catch (error) {
        // En caso de error, mostramos aviso
        props.renderWidget(
          <DolarWidget bcv="Error" binance="--" lastUpdate="Sin red" />
        );
    }
  }
}