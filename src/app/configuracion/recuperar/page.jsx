"use client";
import { useState } from "react";
import {
  solicitarTokenRecuperacion,
  restablecerPassword,
} from "@/app/services/authService";
import { toast } from "react-toastify";
import BotonVolver from "@/app/components/BotonVolver";

export default function RecuperarPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [tokenGenerado, setTokenGenerado] = useState("");

  // Validación
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*\d).{6,}$/;

  const handleSolicitarToken = async () => {
    setErrors({});
    if (!emailRegex.test(email)) {
      setErrors({ email: "Ingrese un correo electrónico válido." });
      return;
    }
    try {
      const res = await solicitarTokenRecuperacion(email);
      setTokenGenerado(res.token);
      toast.success(
        "Token generado. Copie el token para restablecer la contraseña."
      );
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRestablecerPassword = async () => {
    setErrors({});
    if (!token) {
      setErrors({ token: "Ingrese el token de recuperación." });
      return;
    }
    if (!passwordRegex.test(newPassword)) {
      setErrors({
        newPassword:
          "La contraseña debe tener mínimo 6 caracteres y al menos un número.",
      });
      return;
    }
    try {
      await restablecerPassword({ email, token, newPassword });
      toast.success("Contraseña restablecida correctamente.");
      setStep(1);
      setEmail("");
      setToken("");
      setNewPassword("");
      setTokenGenerado("");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="container py-4">
      <div className="card shadow mx-auto" style={{ maxWidth: "500px" }}>
        <div className="card-body">
          <h2 className="card-title mb-4 text-center">Recuperar Contraseña</h2>
          {step === 1 ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSolicitarToken();
              }}
            >
              <div className="mb-3">
                <label className="form-label">Correo electrónico:</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email}</div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-warning w-100 text-white"
              >
                Solicitar token de recuperación
              </button>
              <div className="text-center mt-4">
                <BotonVolver
                  texto="← Volver a Configuración"
                  to="/configuracion"
                />
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRestablecerPassword();
              }}
            >
              <div className="mb-3">
                <label className="form-label">Token de recuperación:</label>
                <input
                  type="text"
                  className={`form-control ${errors.token ? "is-invalid" : ""}`}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
                {errors.token && (
                  <div className="invalid-feedback">{errors.token}</div>
                )}
                {tokenGenerado && (
                  <div className="alert alert-info mt-2">
                    <strong>Token generado:</strong>
                    <div className="small text-break">{tokenGenerado}</div>
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Nueva contraseña:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-control ${
                    errors.newPassword ? "is-invalid" : ""
                  }`}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {errors.newPassword && (
                  <div className="invalid-feedback">{errors.newPassword}</div>
                )}
                <div className="form-check mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="verPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <label className="form-check-label" htmlFor="verPassword">
                    Mostrar contraseña
                  </label>
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100">
                Restablecer contraseña
              </button>
              <div className="text-center mt-4">
                <BotonVolver
                  texto="← Volver a Configuración"
                  to="/configuracion"
                />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
