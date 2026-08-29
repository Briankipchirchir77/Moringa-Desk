import { baseApi } from '../../api/baseApi';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // covers all three MVP notification triggers (vote left, answer left,
    // response on a followed question) since they all land in one feed
    getNotifications: builder.query({
      query: (userId) => `/notifications?userId=${userId}&_sort=-createdAt`,
      providesTags: (result = []) => [
        ...result.map(({ id }) => ({ type: 'Notification', id })),
        { type: 'Notification', id: 'LIST' },
      ],
    }),
    // there's no backend to raise these server-side yet, so the mutations
    // that trigger a notification (see answersApi) create the record
    // directly via this endpoint as a side effect
    createNotification: builder.mutation({
      query: (notification) => ({
        url: '/notifications',
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
    }),
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: 'PATCH',
        body: { read: true },
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Notification', id }],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
} = notificationsApi;
