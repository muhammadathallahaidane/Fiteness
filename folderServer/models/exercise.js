'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Exercise extends Model {
    static associate(models) {
      // Exercise belongs to WorkoutList
      Exercise.belongsTo(models.WorkoutList, { foreignKey: 'WorkoutListId' });
      // Exercise belongs to Equipment
      Exercise.belongsTo(models.Equipment, { foreignKey: 'EquipmentId' });
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
    EquipmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Equipment',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'EquipmentId is required'
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
          msg: 'Exercise name cannot be empty'
        }
      }
    },
    steps: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Exercise steps are required'
        },
        notEmpty: {
          msg: 'Exercise steps cannot be empty'
        }
      }
    },
    sets: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Sets are required'
        },
        min: {
          args: [1],
          msg: 'Sets must be at least 1'
        }
      }
    },
    repetitions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Repetitions is required'
        },
        min: {
          args: [1],
          msg: 'Repetitions must be at least 1'
        }
      }
    },
    youtubeUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'Must be a valid URL'
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Exercise',
    tableName: 'Exercises'
  });
  return Exercise;
};