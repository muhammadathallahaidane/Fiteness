import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import workoutSlice from './slices/workoutSlice';
import equipmentSlice from './slices/equipmentSlice';
import bodyPartSlice from './slices/bodyPartSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    workout: workoutSlice,
    equipment: equipmentSlice,
    bodyPart: bodyPartSlice,
  },
});

export default store;