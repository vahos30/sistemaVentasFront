//const API_URL = "https://localhost:7062/api/Usuarios";
const API_URL =
  "https://sistemainventarioapi20251005143405-fbcybrh3f2f8caeu.centralus-01.azurewebsites.net/api/Usuarios";

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

export async function crearVendedor({ userName, email, password }) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/crear-vendedor`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userName,
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    let errorMsg = "No se pudo crear el vendedor.";
    if (data.errores && Array.isArray(data.errores)) {
      errorMsg = data.errores.join(" ");
    }
    throw new Error(errorMsg);
  }

  return data.mensaje || "Vendedor creado correctamente";
}

export async function listarUsuarios() {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/listar`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("No se pudo obtener la lista de usuarios.");
  }

  return await response.json();
}
