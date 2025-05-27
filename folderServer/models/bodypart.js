'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BodyPart extends Model {
    static associate(models) {
      BodyPart.hasMany(models.WorkoutList, { foreignKey: 'BodyPartId' });
    }
  }
  BodyPart.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Body part name is required'
        },
        notEmpty: {
          msg: 'Body part name is required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'BodyPart',
  });
  return BodyPart;
};