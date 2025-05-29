const { BodyPart } = require('../models');

class BodyPartController {
    static async getAllBodyParts(req, res, next) {
        try {
            const bodyParts = await BodyPart.findAll({
                attributes: ['id', 'name'] // Hanya ambil id dan name
            });
            res.status(200).json(bodyParts);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BodyPartController;