import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean; // true until the initial "am I logged in?" check resolves
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isInitializing: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isInitializing = false;
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isInitializing = false;
    },
    finishInitializing: (state) => {
      state.isInitializing = false;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, setAccessToken, setUser, finishInitializing, clearAuth } = authSlice.actions;
export default authSlice.reducer;
