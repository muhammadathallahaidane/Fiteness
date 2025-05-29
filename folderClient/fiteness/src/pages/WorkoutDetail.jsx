import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkoutListById, updateExercise } from '../store/slices/workoutSlice';
import ExerciseCard from '../components/ExerciseCard';
import './WorkoutDetail.css';

// PINDAHKAN FUNGSI INI KE ATAS!
const formatDate = (dateString) => {
  console.log('Formatting date:', dateString, 'Type:', typeof dateString);
  
  if (!dateString || dateString === null || dateString === undefined) {
    return 'Date not available';
  }
  
  // Handle jika dateString adalah object Date
  let date;
  if (dateString instanceof Date) {
    date = dateString;
  } else {
    date = new Date(dateString);
  }
  
  if (isNaN(date.getTime())) {
    return 'Invalid date format';
  }
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Perbaiki selector - gunakan currentWorkoutList bukan currentWorkout
  const { currentWorkoutList, isLoading, error } = useSelector((state) => state.workout);
  const [editMode, setEditMode] = useState(false);
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    if (id) {
      console.log('Fetching workout with ID:', id); // Debug log
      dispatch(fetchWorkoutListById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentWorkoutList?.Exercises) {
      console.log('Setting exercises:', currentWorkoutList.Exercises); // Debug log
      setExercises(currentWorkoutList.Exercises);
    }
  }, [currentWorkoutList]);

  const handleUpdateExercise = (exerciseIndex, field, value) => {
    setExercises(prev => 
      prev.map((exercise, index) => 
        index === exerciseIndex 
          ? { ...exercise, [field]: value }
          : exercise
      )
    );
  };

  const handleSaveChanges = async () => {
    try {
      // Update setiap exercise satu per satu
      for (const exercise of exercises) {
        await dispatch(updateExercise({
          workoutListId: id,
          exerciseId: exercise.id,
          sets: exercise.sets,
          repetitions: exercise.repetitions
        }));
      }
      setEditMode(false);
      // Refresh data setelah update
      dispatch(fetchWorkoutListById(id));
    } catch (error) {
      console.error('Error updating exercises:', error);
    }
  };

  // Debug logs
  useEffect(() => {
    console.log('Current state:', { currentWorkoutList, isLoading, error });
  }, [currentWorkoutList, isLoading, error]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading workout details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/workouts')}>Back to Workouts</button>
      </div>
    );
  }

  if (!currentWorkoutList) {
    return (
      <div className="error-container">
        <h2>Workout not found</h2>
        <button onClick={() => navigate('/workouts')}>Back to Workouts</button>
      </div>
    );
  }

  return (
    <div className="workout-detail-container">
      <div className="workout-detail-header">
        <button onClick={() => navigate('/workouts')} className="back-btn">
          ← Back to Workouts
        </button>
        <div className="header-actions">
          {editMode ? (
            <>
              <button onClick={() => setEditMode(false)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleSaveChanges} className="save-btn">
                Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="edit-btn">
              Edit Workout
            </button>
          )}
        </div>
      </div>

      <div className="workout-info">
        <h1>{currentWorkoutList.name}</h1>
        <div className="workout-meta">
          <p><strong>Target Body Part:</strong> {currentWorkoutList.BodyPart?.name}</p>
          <p><strong>Total Exercises:</strong> {exercises.length}</p>
          <p><strong>Created:</strong> {formatDate(currentWorkoutList.createdAt)}</p>
        </div>
      </div>

      <div className="exercises-section">
        <h2>Exercises</h2>
        <div className="exercises-grid">
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              editMode={editMode}
              onUpdate={(field, value) => handleUpdateExercise(index, field, value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutDetail;

// HAPUS FUNGSI formatDate YANG DI BAWAH INI!