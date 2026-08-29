import { baseApi } from '../../api/baseApi';

export const tagsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTags: builder.query({
      query: () => '/tags',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Tag', id })),
        { type: 'Tag', id: 'LIST' },
      ],
    }),
  }),
});

export const { useGetTagsQuery } = tagsApi;