const express = require('express');
const WorkoutListController = require('../controllers/workoutListController');
const router = express.Router();

// Semua rute workout list memerlukan otentikasi
router.post('/', WorkoutListController.createWorkoutList);
router.get('/', WorkoutListController.getAllWorkoutLists);
router.get('/:id', WorkoutListController.getWorkoutListById);
router.patch('/:workoutListId/exercises/:exerciseId', WorkoutListController.updateExerciseRepetitions); // Update sets/repetitions
router.delete('/:id', WorkoutListController.deleteWorkoutList);

module.exports = router;