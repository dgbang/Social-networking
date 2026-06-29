"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Users", "avatarPublicId", {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn("Users", "coverPhotoPublicId", {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Users", "coverPhotoPublicId");
    await queryInterface.removeColumn("Users", "avatarPublicId");
  }
};
