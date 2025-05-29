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

// Tambahkan YouTube login async thunk setelah googleLogin
export const youtubeLogin = createAsyncThunk(
  'auth/youtubeLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/users/youtube-login`, {
        idToken,
      });
      localStorage.setItem('token', response.data.access_token);
      
      // Show success message
      Swal.fire({
        icon: 'success',
        title: 'YouTube Login Berhasil!',
        text: `Selamat datang, ${response.data.user.username}!`,
        timer: 2000,
        showConfirmButton: false
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'YouTube login failed';
      
      Swal.fire({
        icon: 'error',
        title: 'YouTube Login Gagal',
        text: errorMessage,
      });
      
      return rejectWithValue(errorMessage);
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
      // Google Login - TAMBAHAN BARU
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
      // YouTube login cases
      .addCase(youtubeLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(youtubeLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(youtubeLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;