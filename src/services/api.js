import axios from "axios";

// Instancia con Timeout de 10 segundos
const api = axios.create({
  baseURL: "https://api-dollar-0f0i.onrender.com",
  timeout: 10000,
});

// Se agrega el parámetro 'proximo' para consultar la tasa adelantada
export const getTasas = async (fecha = null, proximo = false) => {
  try {
    let url = `/api/dolar/ves`;
    const params = [];
    
    if (fecha) params.push(`fecha=${fecha}`);
    if (proximo) params.push(`proximo=true`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
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
    console.error("Error días disponibles:", error);
    return [];
  }
};