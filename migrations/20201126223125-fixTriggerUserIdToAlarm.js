'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    var dropFkeySql = "ALTER TABLE `alarms`" +
    "  DROP FOREIGN KEY `fktUerIdInAlarms`";

    // 쿼리 실행
    return queryInterface.sequelize.query(dropFkeySql, {
      type: Sequelize.QueryTypes.RAW
    });
  },

  down: async (queryInterface, Sequelize) => {
    var addFkeySql = "ALTER TABLE `alarms`" +
      " ADD CONSTRAINT `fktUerIdInAlarms` FOREIGN KEY (`triggerUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT";

    // 쿼리 실행
    return queryInterface.sequelize.query(addFkeySql, {
      type: Sequelize.QueryTypes.RAW
    });
  }
};
