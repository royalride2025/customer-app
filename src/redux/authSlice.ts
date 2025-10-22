import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearProfile } from './profileSlice';

interface UserInfo {
  id: string;
  role: string;
  phone: string;
  is_verified?: boolean;
}

interface AuthState {
  token: string | null;
  user: UserInfo | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUser: (state, action: PayloadAction<UserInfo | null>) => {
      state.user = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setToken, setUser, clearToken } = authSlice.actions;
export default authSlice.reducer; 