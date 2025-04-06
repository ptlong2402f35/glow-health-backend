const { UserRole } = require("../constants/roles");
var bcrypt = require("bcryptjs");

module.exports = {
  up: (queryInterface, Sequelize) => {
    let passwordHashed = bcrypt.hashSync("12345678", 10);
    return queryInterface.bulkInsert('Users', [
      {
        userName: 'admin',
        phone: '0971000000',
        email: 'admin@gmail.com',
        password: passwordHashed,
        role: UserRole.Admin,
        urlImage: "",
        active: true,
        totalMoney: 0,
        gender: 1,
        userCoordinate: null,
        resetKey: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Users', null, {});
  },
};