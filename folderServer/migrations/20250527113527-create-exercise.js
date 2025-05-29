'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Exercises', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      WorkoutListId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'WorkoutLists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      EquipmentId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Equipments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      steps: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      sets: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      repetitions: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      youtubeUrl: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Exercises');
  }
};