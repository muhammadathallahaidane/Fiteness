'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      Equipment.belongsToMany(models.WorkoutList, { 
        through: models.WorkoutListEquipment,
        foreignKey: 'EquipmentId',
        otherKey: 'WorkoutListId'
      });
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
          msg: 'Equipment name is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Equipment',
  });
  return Equipment;
};