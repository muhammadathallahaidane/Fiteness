import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = 'http://localhost:3000';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password,
      });
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Add Google login async thunk
export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/google-login`, {
        idToken,
      });
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Tambahkan async thunk untuk Strava login
export const stravaLogin = createAsyncThunk(
  'auth/stravaLogin',
  async (code, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/strava-login`, {
        code,
      });
      localStorage.setItem('token', response.data.access_token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    isLoading: false,
    error: null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: 'Selamat datang di Fitness App',
          timer: 2000,
        });
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal!',
          text: action.payload,
        });
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil!',
          text: 'Silakan login dengan akun Anda',
          timer: 2000,
        });
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Registrasi Gagal!',
          text: action.payload,
        });
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.isAuthenticated = true;
        Swal.fire({
          icon: 'success',
          title: 'Google Login Berhasil!',
          text: 'Selamat datang di Fitness App',
          timer: 2000,
        });
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Google Login Gagal!',
          text: action.payload,
        });
      })
      // Strava Login - DIPINDAHKAN KE DALAM BUILDER
      .addCase(stravaLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(stravaLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        Swal.fire({
          icon: 'success',
          title: 'Strava Login Berhasil!',
          text: 'Selamat datang di Fitness App',
          timer: 2000,
        });
      })
      .addCase(stravaLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Strava Login Gagal!',
          text: action.payload,
        });
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;