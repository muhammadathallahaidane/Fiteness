'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WorkoutList extends Model {
    static associate(models) {
      WorkoutList.belongsTo(models.User, { foreignKey: 'UserId' });
      WorkoutList.belongsTo(models.BodyPart, { foreignKey: 'BodyPartId' });
      WorkoutList.hasMany(models.Exercise, { foreignKey: 'WorkoutListId' });

      // WorkoutList.belongsToMany(models.Equipment, {
      //   through: models.Exercise,
      //   foreignKey: 'WorkoutListId',
      //   otherKey: 'EquipmentId'
      // });
    }
  }
  WorkoutList.init({
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'UserId is required'
        }
      }
    },
    BodyPartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'BodyParts',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'BodyPartId is required'
        }
      }
    },
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WorkoutList',
    tableName: 'WorkoutLists'
  });
  return WorkoutList;
};