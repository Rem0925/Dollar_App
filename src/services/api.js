import axios from 'axios';

// Endpoint de la API
const API_URL = 'https://api-dollar-0f0i.onrender.com'; 

export const getTasas = async () => {
    try {
        const response = await axios.get(`${API_URL}/api/dolar/ves`);
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