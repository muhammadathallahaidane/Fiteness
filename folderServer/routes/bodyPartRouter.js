const express = require('express');
const BodyPartController = require('../controllers/bodyPartController');
const router = express.Router();

// Semua rute body part memerlukan otentikasi
router.get('/', BodyPartController.getAllBodyParts);

module.exports = router;