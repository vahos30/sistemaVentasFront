const API_URL =
  "https://sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Ciudad";
//const API_URL = "https://localhost:7062/api/Ciudad";

export async function obtenerDepartamentosYCiudades() {
  const response = await fetch(`${API_URL}/departamentos`);
  if (!response.ok)
    throw new Error("No se pudo obtener la información de ciudades");
  return await response.json();
}
