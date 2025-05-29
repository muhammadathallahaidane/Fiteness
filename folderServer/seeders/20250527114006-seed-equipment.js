"use strict";

const axios = require("axios");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const response = await axios.get("https://wger.de/api/v2/equipment/");

    const equipmentsData = response.data.results

    equipmentsData.map(el => {
        delete el.id
        el.name
        el.createdAt = new Date()
        el.updatedAt = new Date();
        return el
    });

    await queryInterface.bulkInsert("Equipments", equipmentsData, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Equipments", null, {});
  },
};
