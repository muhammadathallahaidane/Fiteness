import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:3000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchEquipments = createAsyncThunk(
  'equipment/fetchEquipments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/equipments`, getAuthHeaders()); // Tambahkan auth headers
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch equipments');
    }
  }
);

const equipmentSlice = createSlice({
  name: 'equipment',
  initialState: {
    equipments: [],
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
      .addCase(fetchEquipments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEquipments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.equipments = action.payload;
      })
      .addCase(fetchEquipments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = equipmentSlice.actions;
export default equipmentSlice.reducer;