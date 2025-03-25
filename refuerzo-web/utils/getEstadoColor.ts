export const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "asistio":
    case "asistió":
      return "bg-green-100 text-green-800";
    case "falto":
      return "bg-red-100 text-red-800";
    case "permiso":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
