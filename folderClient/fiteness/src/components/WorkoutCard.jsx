import React from 'react';
import { Link } from 'react-router';
import './WorkoutCard.css';

const WorkoutCard = ({ workout, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="workout-card">
      <div className="workout-card-header">
        <h3>{workout.name}</h3>
        <div className="workout-actions">
          <Link to={`/workouts/${workout.id}`} className="view-btn">
            View
          </Link>
          <button onClick={onDelete} className="delete-btn">
            Delete
          </button>
        </div>
      </div>
      
      <div className="workout-info">
        <p><strong>Target:</strong> {workout.BodyPart?.name}</p>
        <p><strong>Exercises:</strong> {workout.Exercises?.length || 0}</p>
        <p><strong>Created:</strong> {formatDate(workout.createdAt)}</p>
      </div>
      
      {workout.Exercises && workout.Exercises.length > 0 && (
        <div className="exercise-preview">
          <h4>Exercises:</h4>
          <ul>
            {workout.Exercises.slice(0, 3).map((exercise, index) => (
              <li key={index}>{exercise.name}</li>
            ))}
            {workout.Exercises.length > 3 && (
              <li>+{workout.Exercises.length - 3} more...</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkoutCard;