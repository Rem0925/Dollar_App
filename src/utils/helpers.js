export const formatCurrency = (amount) => {
  if (amount === "" || amount === null || amount === undefined) return "0,00";

  // Convertimos a número (si es string)
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(num)) return "0,00";

  // Formato Venezuela: 1.234,56
  return num.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Formateador para el Input Grande (sin decimales forzados mientras escribes)
export const formatInput = (value) => {
  if (!value) return "0";
  const num = parseFloat(value);
  // Muestra separadores de miles pero permite escribir decimales libremente
  return num.toLocaleString("es-VE", { maximumFractionDigits: 2 });
};
