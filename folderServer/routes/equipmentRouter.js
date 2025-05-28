const express = require('express');
const EquipmentController = require('../controllers/equipmentController');
const router = express.Router();

// Semua rute equipment memerlukan otentikasi (sudah diatur di routes/index.js)
router.get('/', EquipmentController.getAllEquipments);

module.exports = router;