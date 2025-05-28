'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      Equipment.belongsToMany(models.WorkoutList, { 
        through: "WorkoutListEquipments",
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
    tableName: 'Equipments'
  });
  return Equipment;
};