//const API_URL = "https://localhost:7062/api/Usuarios";
const API_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Usuarios";

export async function obtenerPerfil() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/mi-perfil`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener el perfil.");
  }

  return await response.json();
}
