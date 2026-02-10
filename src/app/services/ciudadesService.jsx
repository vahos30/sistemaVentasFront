const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/Ciudad`;
export async function obtenerDepartamentosYCiudades() {
  const response = await fetch(`${API_URL}/departamentos`);
  if (!response.ok)
    throw new Error("No se pudo obtener la información de ciudades");
  return await response.json();
}
