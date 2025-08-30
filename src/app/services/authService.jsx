//const API_URL = "https://localhost:7062/api/Auth";
const API_URL =
  "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Auth";

export async function login(nombreUsuario, contrasena) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  if (!response.ok) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  return await response.json(); // { token: ... }
}

// Servicio para recuperación de contraseña

export async function solicitarTokenRecuperacion(email) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(email),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "No se pudo solicitar el token.");
  }

  return await response.json(); // { token }
}

export async function restablecerPassword({ email, token, newPassword }) {
  const response = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token, newPassword }),
  });

  if (!response.ok) {
    let errorMsg = "No se pudo restablecer la contraseña.";
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData)) {
        errorMsg = errorData.map((e) => e.description || e).join(" ");
      } else if (typeof errorData === "string") {
        errorMsg = errorData;
      }
    } catch {}
    throw new Error(errorMsg);
  }

  return;
}
