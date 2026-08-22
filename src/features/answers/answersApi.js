import { baseApi } from '../../api/baseApi';
import { problemsApi } from '../problems/problemsApi';
import { notificationsApi } from '../notifications/notificationsApi';
import { sameId } from '../../utils/id';

// There's no backend to raise notifications server-side yet, so
// createAnswer/voteAnswer below fire them client-side as a side effect
// via onQueryStarted, once the write itself has succeeded.
function notify(dispatch, notification) {
  dispatch(
    notificationsApi.endpoints.createNotification.initiate({
      read: false,
      createdAt: new Date().toISOString(),
      ...notification,
    }),
  );
}

export const answersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnswers: builder.query({
      query: () => '/answers',
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Answer', id })),
        { type: 'Answer', id: 'LIST' },
      ],
    }),
    getAnswersByProblem: builder.query({
      query: (problemId) => `/answers?problemId=${problemId}`,
      providesTags: (result = [], error, problemId) => [
        ...result.map(({ id }) => ({ type: 'Answer', id })),
        { type: 'Answer', id: `PROBLEM-${problemId}` },
      ],
    }),
    createAnswer: builder.mutation({
      query: (newAnswer) => ({
        url: '/answers',
        method: 'POST',
        body: newAnswer,
      }),
      invalidatesTags: (result, error, { problemId }) => [
        { type: 'Answer', id: `PROBLEM-${problemId}` },
        { type: 'Answer', id: 'LIST' },
      ],
      async onQueryStarted(newAnswer, { dispatch, getState, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch {
          return;
        }

        const state = getState();
        const actor = state.auth.user;
        const problem = problemsApi.endpoints.getProblemById.select(newAnswer.problemId)(
          state,
        )?.data;
        if (!actor || !problem) return;

        // notify the question owner that a new answer came in...
        const recipients = new Map();
        if (!sameId(problem.userId, actor.id)) {
          recipients.set(String(problem.userId), {
            type: 'answer',
            message: `${actor.name} replied to your question "${problem.title}"`,
          });
        }

        // ...and everyone else following the question, without double-
        // notifying the owner or the person who just answered
        (problem.followerIds ?? []).forEach((followerId) => {
          if (sameId(followerId, actor.id) || sameId(followerId, problem.userId)) return;
          const key = String(followerId);
          if (recipients.has(key)) return;
          recipients.set(key, {
            type: 'follow_response',
            message: `A new answer was posted on "${problem.title}", which you follow`,
          });
        });

        recipients.forEach((notification, userId) => {
          notify(dispatch, { userId, ...notification });
        });
      },
    }),
    updateAnswer: builder.mutation({
      query: ({ id, ...patch }) => ({
        url: `/answers/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Answer', id },
        { type: 'Answer', id: 'LIST' },
      ],
    }),
    voteAnswer: builder.mutation({
      query: ({ id, votes }) => ({
        url: `/answers/${id}`,
        method: 'PATCH',
        body: { votes },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Answer', id }],
      async onQueryStarted(_args, { dispatch, getState, queryFulfilled }) {
        let updatedAnswer;
        try {
          ({ data: updatedAnswer } = await queryFulfilled);
        } catch {
          return;
        }

        const actor = getState().auth.user;
        if (!actor || !updatedAnswer || sameId(updatedAnswer.userId, actor.id)) return;

        notify(dispatch, {
          userId: String(updatedAnswer.userId),
          type: 'vote',
          message: `${actor.name} voted on your answer`,
        });
      },
    }),
    flagAnswer: builder.mutation({
      query: (id) => ({
        url: `/answers/${id}`,
        method: 'PATCH',
        body: { flagged: true },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Answer', id }],
    }),
    deleteAnswer: builder.mutation({
      query: (id) => ({
        url: `/answers/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Answer', id },
        { type: 'Answer', id: 'LIST' },
      ],
    }),
    // marking an answer as the accepted solution patches the parent problem
    markAsSolution: builder.mutation({
      query: ({ problemId, answerId }) => ({
        url: `/problems/${problemId}`,
        method: 'PATCH',
        body: { solvedAnswerId: answerId },
      }),
      invalidatesTags: (result, error, { problemId }) => [
        { type: 'Problem', id: problemId },
      ],
    }),
  }),
});

export const {
  useGetAnswersQuery,
  useGetAnswersByProblemQuery,
  useCreateAnswerMutation,
  useUpdateAnswerMutation,
  useVoteAnswerMutation,
  useFlagAnswerMutation,
  useDeleteAnswerMutation,
  useMarkAsSolutionMutation,
} = answersApi;
