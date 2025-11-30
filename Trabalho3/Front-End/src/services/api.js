// src/services/api.js
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Pega o token de autenticação do localStorage.
 * @returns {string|null} O token ou null se não existir.
 */
const getToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Realiza uma requisição para a API, adicionando o token de autenticação.
 * @param {string} endpoint - O endpoint da API para o qual fazer a requisição (ex: '/materias').
 * @param {object} options - As opções da requisição (method, headers, body, etc.).
 * @returns {Promise<any>} Os dados da resposta em JSON.
 * @throws {Error} Lança um erro se a requisição falhar.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const defaultHeaders = { ...options.headers };

  // Não definir Content-Type para FormData, o browser faz isso.
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: defaultHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido na API' }));
    throw new Error(errorData.detail || 'A requisição para a API falhou.');
  }

  // Se a resposta não tiver corpo (ex: status 204), retorna um objeto vazio.
  if (response.status === 204) {
    return {};
  }

  return response.json();
};

export default apiRequest;
