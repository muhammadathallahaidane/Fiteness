const { Equipment } = require('../models');

class EquipmentController {
    static async getAllEquipments(req, res, next) {
        try {
            const equipments = await Equipment.findAll({
                attributes: ['id', 'name'] // Hanya ambil id dan name
            });
            res.status(200).json(equipments);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = EquipmentController;