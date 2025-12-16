import axios from 'axios';

// Endpoint de la API
const API_URL = 'https://api-dollar-0f0i.onrender.com'; 

export const getTasas = async (fecha = null) => {
    try {
        let url = `${API_URL}/api/dolar/ves`;
        if (fecha) {
            url += `?fecha=${fecha}`;
        }
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error("Error conectando con API:", error);
        return null;
    }
};

export const getHistorial = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/dolar/historial`);
        return response.data;
    } catch (error) {
        console.error("Error historial:", error);
        return [];
    }
};

export const getDiasDisponibles = async (mes, anio) => {
    try {
        // La API espera mes 0-11
        const response = await axios.get(`${API_URL}/api/dolar/ves?modo=calendario&mes=${mes}&anio=${anio}`);
        return response.data.dias || []; // Retorna array de números [1, 5, 20...]
    } catch (error) {
        console.error("Error calendario:", error);
        return [];
    }
};