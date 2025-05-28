import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { createWorkoutList } from '../store/slices/workoutSlice';
import { fetchEquipments } from '../store/slices/equipmentSlice'; // Ubah dari fetchEquipment
import { fetchBodyParts } from '../store/slices/bodyPartSlice';
import './CreateWorkout.css';

const CreateWorkout = () => {
  const [formData, setFormData] = useState({
    name: '',
    BodyPartId: '', // Ubah dari bodyPartId ke BodyPartId
    equipmentIds: []
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isLoading, error } = useSelector((state) => state.workout);
  const { equipments } = useSelector((state) => state.equipment);
  const { bodyParts } = useSelector((state) => state.bodyPart);

  // Tambahkan debugging
  useEffect(() => {
    console.log('Fetching data...');
    dispatch(fetchEquipments());
    dispatch(fetchBodyParts());
  }, [dispatch]);
  
  // Tambahkan debugging untuk state
  useEffect(() => {
    console.log('Equipment state:', equipments);
    console.log('BodyParts state:', bodyParts);
  }, [equipments, bodyParts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.BodyPartId) { // Ubah dari bodyPartId ke BodyPartId
      alert('Please fill in all required fields');
      return;
    }
    
    if (formData.equipmentIds.length === 0) {
      alert('Please select at least one equipment');
      return;
    }
    
    if (formData.equipmentIds.length > 2) {
      alert('Please select maximum 2 equipment');
      return;
    }
    
    dispatch(createWorkoutList(formData)).then((result) => {
      if (result.type === 'workout/createWorkoutList/fulfilled') {
        navigate('/workouts');
      }
    });
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prev => {
      const newEquipmentIds = prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter(id => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId];
      
      if (newEquipmentIds.length > 2) {
        alert('You can select maximum 2 equipment');
        return prev;
      }
      
      return {
        ...prev,
        equipmentIds: newEquipmentIds
      };
    });
  };

  return (
    <div className="create-workout-container">
      <div className="create-workout-header">
        <button onClick={() => navigate('/workouts')} className="back-btn">
          ← Back to Workouts
        </button>
        <h1>Create New Workout</h1>
      </div>
      
      <div className="create-workout-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Workout Name *</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter workout name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="bodyPart">Target Body Part *</label>
            <select
              id="bodyPart"
              value={formData.BodyPartId} // Ubah dari bodyPartId ke BodyPartId
              onChange={(e) => setFormData({...formData, BodyPartId: e.target.value})} // Ubah dari bodyPartId ke BodyPartId
              required
            >
              <option value="">Select body part</option>
              {bodyParts.map((bodyPart) => (
                <option key={bodyPart.id} value={bodyPart.id}>
                  {bodyPart.name}
                </option>
              ))}
            </select>
          </div>
          
          // Di bagian render, ganti 'equipment' dengan 'equipments'
          <div className="form-group">
            <label>Equipment (Select 1-2) *</label>
            <div className="equipment-grid">
              {equipments.map((item) => ( // Ubah dari equipment ke equipments
                <div key={item.id} className="equipment-item">
                  <input
                    type="checkbox"
                    id={`equipment-${item.id}`}
                    checked={formData.equipmentIds.includes(item.id)}
                    onChange={() => handleEquipmentChange(item.id)}
                  />
                  <label htmlFor={`equipment-${item.id}`}>
                    {item.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" onClick={() => navigate('/workouts')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Creating...' : 'Create Workout'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkout;