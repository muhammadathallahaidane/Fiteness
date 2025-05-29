import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWorkoutLists, deleteWorkoutList } from '../store/slices/workoutSlice';
import { fetchEquipments } from '../store/slices/equipmentSlice'; // Ubah dari fetchEquipment ke fetchEquipments
import { fetchBodyParts } from '../store/slices/bodyPartSlice';
import WorkoutCard from '../components/WorkoutCard';
import CreateWorkoutModal from '../components/CreateWorkoutModal';
import './WorkoutList.css';

const WorkoutList = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const dispatch = useDispatch();
  
  const { workoutLists, isLoading, error } = useSelector((state) => state.workout);
  const { equipments } = useSelector((state) => state.equipment); // Ubah dari equipment ke equipments
  const { bodyParts } = useSelector((state) => state.bodyPart);

  useEffect(() => {
    dispatch(fetchWorkoutLists());
    dispatch(fetchEquipments()); // Ubah dari fetchEquipment ke fetchEquipments
    dispatch(fetchBodyParts());
  }, [dispatch]);

  const handleDeleteWorkout = (id) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      dispatch(deleteWorkoutList(id));
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading workouts...</p>
      </div>
    );
  }

  return (
    <div className="workout-list-container">
      <div className="workout-header">
        <h1>My Workout Lists</h1>
        <button 
          className="create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create New Workout
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="workout-grid">
        {workoutLists.length === 0 ? (
          <div className="empty-state">
            <h3>No workouts yet</h3>
            <p>Create your first AI-generated workout!</p>
            <button 
              className="create-btn"
              onClick={() => setShowCreateModal(true)}
            >
              Get Started
            </button>
          </div>
        ) : (
          workoutLists.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onDelete={() => handleDeleteWorkout(workout.id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateWorkoutModal
          equipment={equipments} // Ubah dari equipment ke equipments
          bodyParts={bodyParts}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default WorkoutList;