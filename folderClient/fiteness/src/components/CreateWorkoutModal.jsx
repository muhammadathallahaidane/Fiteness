import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createWorkoutList } from '../store/slices/workoutSlice';
import './CreateWorkoutModal.css';

const CreateWorkoutModal = ({ equipment, bodyParts, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    BodyPartId: '',  // ← Ubah ke PascalCase
    equipmentIds: []
  });
  
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.workout);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Dan update semua referensi bodyPartId menjadi BodyPartId:
    if (!formData.name || !formData.BodyPartId) {
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
        onClose();
      }
    });
  };

  const handleEquipmentChange = (equipmentId) => {
    setFormData(prev => {
      const newEquipmentIds = prev.equipmentIds.includes(equipmentId)
        ? prev.equipmentIds.filter(id => id !== equipmentId)
        : [...prev.equipmentIds, equipmentId];
      
      // Limit to 2 equipment
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Workout</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
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
              value={formData.BodyPartId}
              onChange={(e) => setFormData({...formData, BodyPartId: e.target.value})}
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
          
          <div className="form-group">
            <label>Equipment (Select 1-2) *</label>
            <div className="equipment-grid">
              {equipment.map((item) => (
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
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
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

export default CreateWorkoutModal;