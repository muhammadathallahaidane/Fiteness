import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://aidane.site';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchBodyParts = createAsyncThunk(
  'bodyPart/fetchBodyParts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/bodyParts`, getAuthHeaders()); // Ubah dari /bodyparts ke /bodyParts
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch body parts');
    }
  }
);

const bodyPartSlice = createSlice({
  name: 'bodyPart',
  initialState: {
    bodyParts: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBodyParts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBodyParts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bodyParts = action.payload;
      })
      .addCase(fetchBodyParts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = bodyPartSlice.actions;
export default bodyPartSlice.reducer;