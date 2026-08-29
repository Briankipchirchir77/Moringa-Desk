import { baseApi } from '../../api/baseApi';

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFaqs: builder.query({
      query: (params) => ({ url: '/faqs', params }),
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Faq', id })),
        { type: 'Faq', id: 'LIST' },
      ],
    }),
    // admin-only in practice; the backend is expected to enforce that via
    // role-based access, this is just the client-side call shape
    createFaq: builder.mutation({
      query: (newFaq) => ({
        url: '/faqs',
        method: 'POST',
        body: newFaq,
      }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
    updateFaq: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/faqs/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Faq', id }],
    }),
    deleteFaq: builder.mutation({
      query: (id) => ({
        url: `/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Faq', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} = faqApi;
