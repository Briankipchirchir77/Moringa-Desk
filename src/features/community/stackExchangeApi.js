import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Real external API integration: Stack Exchange (public, unauthenticated,
// no key required for this volume of traffic). Separate createApi instance
// (own reducerPath, own baseUrl) since it's a different service entirely
// from this app's own mocked baseApi ('/api', served by MSW).
export const stackExchangeApi = createApi({
  reducerPath: 'stackExchangeApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.stackexchange.com/2.3' }),
  endpoints: (builder) => ({
    // Real, live Stack Overflow questions, optionally filtered by tag —
    // lets a MoringaDesk user see what the wider dev community is
    // actively discussing on the same topics as their own cohort questions.
    getTrendingQuestions: builder.query({
      query: (tag) => {
        const params = new URLSearchParams({
          order: 'desc',
          sort: 'activity',
          site: 'stackoverflow',
          pagesize: '10',
          filter: 'default',
        });
        if (tag) params.set('tagged', tag);
        return `/questions?${params.toString()}`;
      },
      transformResponse: (response) => response.items ?? [],
    }),
  }),
});

export const { useGetTrendingQuestionsQuery } = stackExchangeApi;
