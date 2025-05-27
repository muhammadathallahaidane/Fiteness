'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const bodyPartData = [
      { name: 'Chest'},
      { name: 'Back'},
      { name: 'Shoulders'},
      { name: 'Biceps'},
      { name: 'Triceps'},
      { name: 'Legs'},
      { name: 'Abs'},
      { name: 'Full Body'}
    ];

        bodyPartData.forEach((el) => {
        (el.createdAt = new Date()),
        (el.updatedAt = new Date());
    });

    await queryInterface.bulkInsert('BodyParts', bodyPartData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('BodyParts', null, {});
  }
};