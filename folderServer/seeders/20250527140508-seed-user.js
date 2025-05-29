"use strict";

const { hashPassword } = require("../helpers/bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = [
      {
        username: "pancoran",
        email: "pancoran@yopmail.com",
        password: "pancoran",
      },
      {
        username: "monas",
        email: "monas@yopmail.com",
        password: "monas123",
      },
    ];

    data.forEach((el) => {
      (el.password = hashPassword(el.password)),
        (el.createdAt = new Date()),
        (el.updatedAt = new Date());
    });

    await queryInterface.bulkInsert("Users", data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  },
};
