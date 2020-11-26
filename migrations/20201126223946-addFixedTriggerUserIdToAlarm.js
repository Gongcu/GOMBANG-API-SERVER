'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    var addFixedFkeySql = "ALTER TABLE `alarms`" +
    " ADD CONSTRAINT `fktUerIdInAlarms` FOREIGN KEY (`triggerUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE CASCADE";

    return queryInterface.sequelize.query(addFixedFkeySql, {
      type: Sequelize.QueryTypes.RAW
    });
  },

  down: async (queryInterface, Sequelize) => {
    var dropFkeySql = "ALTER TABLE `alarms`" +
    " DROP FOREIGN KEY `fktUerIdInAlarms`";

    return queryInterface.sequelize.query(dropFkeySql, {
      type: Sequelize.QueryTypes.RAW
    });
  }
};
