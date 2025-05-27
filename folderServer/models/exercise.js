'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    static associate(models) {
      Exercise.belongsTo(models.WorkoutList, { foreignKey: 'WorkoutListId' });
    }
  }
  Exercise.init({
    WorkoutListId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'WorkoutLists',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'WorkoutListId is required'
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Exercise name is required'
        },
        notEmpty: {
          msg: 'Exercise name is required'
        }
      }
    },
    steps: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Steps are required'
        },
        notEmpty: {
          msg: 'Steps are required'
        }
      }
    },
    imageUrl: DataTypes.STRING,
    youtubeUrl: DataTypes.STRING,
    repetitions: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Repetitions are required'
        },
        notEmpty: {
          msg: 'Repetitions are required'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Exercise',
  });
  return Exercise;
};