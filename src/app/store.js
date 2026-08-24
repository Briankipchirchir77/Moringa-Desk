import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from '../api/baseApi';
import { stackExchangeApi } from '../features/community/stackExchangeApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    [stackExchangeApi.reducerPath]: stackExchangeApi.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, stackExchangeApi.middleware),
});