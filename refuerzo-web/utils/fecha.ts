/**
 * Utilidades para el "día de asistencia".
 *
 * Una asistencia es un DÍA de calendario, no un instante. Antes se guardaba
 * `new Date().toISOString()`, así que un registro hecho a las 9pm en El Salvador
 * (UTC-6) se guardaba con fecha del día siguiente en UTC y desaparecía de la
 * pantalla al recargar (parecía que no se guardaba).
 *
 * La convención es anclar la fecha al MEDIODÍA UTC del día local: así el
 * `YYYY-MM-DD` en UTC siempre es el mismo día que ve el usuario, sin importar
 * su zona horaria, y coincide con cómo la API agrupa por fecha.
 */

/** Devuelve "YYYY-MM-DD" del día local de una fecha (sin convertir a UTC). */
export const toLocalDay = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Día local de hoy en formato "YYYY-MM-DD". */
export const getTodayLocalDay = (): string => toLocalDay(new Date());

/**
 * Convierte un día ("YYYY-MM-DD") o un ISO completo al ancla de mediodía UTC
 * que se envía a la API.
 */
export const toDiaAsistencia = (fecha: string | Date): string => {
  const dia =
    fecha instanceof Date ? toLocalDay(fecha) : fecha.split("T")[0];
  return `${dia}T12:00:00.000Z`;
};

/** Extrae el día ("YYYY-MM-DD") de una fecha de asistencia que viene de la API. */
export const getDiaAsistencia = (fecha: string): string => fecha.split("T")[0];
