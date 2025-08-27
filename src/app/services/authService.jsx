//https://localhost:7062/api/Auth/login url desarrollo

export async function login(nombreUsuario, contrasena) {
  const response = await fetch(
    "https://sistemainventarioapi20250719110533-dsb7hkfuf3bvhwf7.centralus-01.azurewebsites.net/api/Auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombreUsuario, contrasena }),
    }
  );

  if (!response.ok) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  return await response.json(); // { token: ... }
}
