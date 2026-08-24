import { safeJson } from '../../utils/http';

const API_BASE_URL = '/api/auth';

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to log in — is the server running?');
  }

  return data; // Expected payload: { user, token }
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to register — is the server running?');
  }

  return data;
};
