import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginUser, registerUser } from './authApi';
import { fetchUserProfile } from './users/usersApi';

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginUser(credentials);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      return await registerUser(userData);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// A page refresh keeps the token (localStorage) but loses the in-memory
// `user` object — Redux state starts fresh. Without re-fetching the user,
// ProtectedRoute (which only checks the token) lets you into pages that
// then render as if logged out, while AdminRoute (which checks the user)
// bounces admins back to /login even though their token is still valid.
// This thunk re-hydrates `user` from the token on startup so both routes
// see consistent state.
export const fetchCurrentUserThunk = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState, rejectWithValue }) => {
    const token = getState().auth.token;
    if (!token) return rejectWithValue('No token to restore a session from.');
    try {
      return await fetchUserProfile(token);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const hasStoredToken = Boolean(localStorage.getItem('token'));

const initialState = {
  user: null,
  token: localStorage.getItem('token') || null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // False only while a stored token still needs to be resolved back into a
  // user on startup. True immediately for a fresh (logged-out) visitor.
  initialized: !hasStoredToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      state.error = null;
      state.initialized = true;
      localStorage.removeItem('token');
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    profileUpdated: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.initialized = true;
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Restore session on startup from a persisted token
      .addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.initialized = true;
      })
      .addCase(fetchCurrentUserThunk.rejected, (state) => {
        // Token is missing, stale, or no longer valid — treat as logged out
        // rather than leaving the app stuck with a token but no user.
        state.user = null;
        state.token = null;
        state.initialized = true;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearAuthError, profileUpdated } = authSlice.actions;
export default authSlice.reducer;

// Selectors — most pages/components read auth state through these rather
// than reaching into state.auth directly.
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthInitialized = (state) => state.auth.initialized;