import { safeJson, apiBaseUrl } from '../../../utils/http';

const API_BASE_URL = `${apiBaseUrl()}/users`;

export const fetchUserProfile = async (token) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to fetch user profile');
  }

  return data;
};

export const updateUserProfile = async (profileData, token) => {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await safeJson(response);
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to update profile');
  }

  return data;
};
