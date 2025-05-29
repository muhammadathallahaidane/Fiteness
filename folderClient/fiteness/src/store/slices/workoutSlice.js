import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Swal from 'sweetalert2';

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

// Async thunks
export const fetchWorkoutLists = createAsyncThunk(
  'workout/fetchWorkoutLists',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/workoutLists`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const fetchWorkoutListById = createAsyncThunk(
  'workout/fetchWorkoutListById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/workoutLists/${id}`, getAuthHeaders());
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createWorkoutList = createAsyncThunk(
  'workout/createWorkoutList',
  async ({ name, BodyPartId, equipmentIds }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/workoutLists`,
        { name, BodyPartId, equipmentIds },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteWorkoutList = createAsyncThunk(
  'workout/deleteWorkoutList',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/workoutLists/${id}`, getAuthHeaders());
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateExercise = createAsyncThunk(
  'workout/updateExercise',
  async ({ workoutListId, exerciseId, sets, repetitions }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(
        `${API_URL}/workoutLists/${workoutListId}/exercises/${exerciseId}`,
        { sets, repetitions },
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const workoutSlice = createSlice({
  name: 'workout',
  initialState: {
    workoutLists: [],
    currentWorkoutList: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentWorkoutList: (state) => {
      state.currentWorkoutList = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch workout lists
      .addCase(fetchWorkoutLists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkoutLists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workoutLists = action.payload;
      })
      .addCase(fetchWorkoutLists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch workout list by ID
      .addCase(fetchWorkoutListById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWorkoutListById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentWorkoutList = action.payload;
      })
      .addCase(fetchWorkoutListById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create workout list
      .addCase(createWorkoutList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createWorkoutList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.workoutLists.unshift(action.payload);
        Swal.fire({
          icon: 'success',
          title: 'Workout List Berhasil Dibuat!',
          text: 'AI telah menggenerate 5 exercise untuk Anda',
          timer: 3000,
        });
      })
      .addCase(createWorkoutList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Gagal Membuat Workout List!',
          text: action.payload,
        });
      })
      // Delete workout list
      .addCase(deleteWorkoutList.fulfilled, (state, action) => {
        state.workoutLists = state.workoutLists.filter(
          (workout) => workout.id !== action.payload
        );
        Swal.fire({
          icon: 'success',
          title: 'Workout List Berhasil Dihapus!',
          timer: 2000,
        });
      })
      .addCase(deleteWorkoutList.rejected, (state, action) => {
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Gagal Menghapus Workout List!',
          text: action.payload,
        });
      })
      // Update exercise
      .addCase(updateExercise.fulfilled, (state, action) => {
        if (state.currentWorkoutList) {
          const exerciseIndex = state.currentWorkoutList.Exercises.findIndex(
            (ex) => ex.id === action.payload.exercise.id
          );
          if (exerciseIndex !== -1) {
            state.currentWorkoutList.Exercises[exerciseIndex] = action.payload.exercise;
          }
        }
        Swal.fire({
          icon: 'success',
          title: 'Exercise Berhasil Diupdate!',
          timer: 2000,
        });
      })
      .addCase(updateExercise.rejected, (state, action) => {
        state.error = action.payload;
        Swal.fire({
          icon: 'error',
          title: 'Gagal Update Exercise!',
          text: action.payload,
        });
      });
  },
});

export const { clearError, clearCurrentWorkoutList } = workoutSlice.actions;
export default workoutSlice.reducer;