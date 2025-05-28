'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      Equipment.hasMany(models.Exercise, { foreignKey: 'EquipmentId' });
      // Equipment.belongsToMany(models.WorkoutList, {
      //   through: models.Exercise,  // Gunakan models.Exercise bukan "Exercises"
      //   foreignKey: 'EquipmentId',
      //   otherKey: 'WorkoutListId'
      // });
    }
  }
  Equipment.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Equipment name is required'
        },
        notEmpty: {
          msg: 'Equipment name cannot be empty'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Equipment',
    tableName: "Equipments"
  });
  return Equipment;
};