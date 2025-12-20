import axios from "axios";

// Instancia con Timeout de 10 segundos
// Esto evita que la app se quede pegada si el internet es lento
const api = axios.create({
  baseURL: "https://api-dollar-0f0i.onrender.com",
  timeout: 10000,
});

export const getTasas = async (fecha = null) => {
  try {
    let url = `/api/dolar/ves`;
    if (fecha) {
      url += `?fecha=${fecha}`;
    }
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    // Si es por timeout, podemos loguearlo o manejarlo específico
    if (error.code === "ECONNABORTED") {
      console.log("La solicitud tardó demasiado.");
    }
    console.error("Error conectando con API:", error);
    return null;
  }
};

export const getHistorial = async () => {
  try {
    const response = await api.get(`/api/dolar/historial`);
    return response.data;
  } catch (error) {
    console.error("Error historial:", error);
    return [];
  }
};

export const getDiasDisponibles = async (mes, anio) => {
  try {
    const response = await api.get(
      `/api/dolar/ves?modo=calendario&mes=${mes}&anio=${anio}`
    );
    return response.data.dias || [];
  } catch (error) {
    console.error("Error calendario:", error);
    return [];
  }
};
