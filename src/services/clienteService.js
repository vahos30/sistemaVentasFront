import api from "./api";

export const getClientes = async () => {
  return await api.get("/api/Clientes"); // Endpoint completo: https://localhost:7062/api/Clientes
};

export const createCliente = async (clienteData) => {
  return await api.post("/api/Clientes", clienteData);
};

export const getClienteByDocumento = async (numeroDocumento) => {
  return await api.get(`/api/Clientes/por-documento/${numeroDocumento}`);
};
