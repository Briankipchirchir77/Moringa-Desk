import { safeJson } from '../../../utils/http';
import { baseApi } from '../../../api/baseApi';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => '/users',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'User', id })),
        { type: 'User', id: 'LIST' },
      ],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = usersApi;

const API_BASE_URL = '/api/users';

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
