import { baseApi } from '../../api/baseApi';
import { notificationsApi } from '../notifications/notificationsApi';
import { sameId } from '../../utils/id';

export const problemsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProblems: builder.query({
      query: () => '/problems',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Problem', id })),
        { type: 'Problem', id: 'LIST' },
      ],
    }),
    getProblemById: builder.query({
      query: (id) => `/problems/${id}`,
      providesTags: (result, error, id) => [{ type: 'Problem', id }],
    }),
    createProblem: builder.mutation({
      query: (newProblem) => ({
        url: '/problems',
        method: 'POST',
        body: newProblem,
      }),
      invalidatesTags: [{ type: 'Problem', id: 'LIST' }],
    }),
    updateProblem: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/problems/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Problem', id }],
    }),
    // used for both follow/unfollow and marking the accepted solution,
    // since both are just a patch to the problem record
    followProblem: builder.mutation({
      query: ({ id, followerIds }) => ({
        url: `/problems/${id}`,
        method: 'PATCH',
        body: { followerIds },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Problem', id }],
    }),
    // mirrors answersApi's voteAnswer: a plain PATCH plus a client-side
    // notification to the question's owner, since there's no backend to
    // raise that server-side yet
    voteProblem: builder.mutation({
      query: ({ id, votes }) => ({
        url: `/problems/${id}`,
        method: 'PATCH',
        body: { votes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Problem', id }],
      async onQueryStarted(_args, { dispatch, getState, queryFulfilled }) {
        let updatedProblem;
        try {
          ({ data: updatedProblem } = await queryFulfilled);
        } catch {
          return;
        }

        const actor = getState().auth.user;
        if (!actor || !updatedProblem || sameId(updatedProblem.userId, actor.id)) return;

        dispatch(
          notificationsApi.endpoints.createNotification.initiate({
            userId: String(updatedProblem.userId),
            type: 'vote',
            message: `${actor.name} voted on your question "${updatedProblem.title}"`,
            read: false,
            createdAt: new Date().toISOString(),
          }),
        );
      },
    }),
    flagProblem: builder.mutation({
      query: (id) => ({
        url: `/problems/${id}`,
        method: 'PATCH',
        body: { flagged: true },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Problem', id }],
    }),
    deleteProblem: builder.mutation({
      query: (id) => ({
        url: `/problems/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Problem', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetProblemsQuery,
  useGetProblemByIdQuery,
  useCreateProblemMutation,
  useUpdateProblemMutation,
  useFollowProblemMutation,
  useVoteProblemMutation,
  useFlagProblemMutation,
  useDeleteProblemMutation,
} = problemsApi;