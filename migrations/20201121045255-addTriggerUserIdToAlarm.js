'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

     var sql = "ALTER TABLE `alarms`" +
        "  ADD COLUMN `triggerUserId` INT DEFAULT NULL" +
        ", ADD CONSTRAINT `fktUerIdInAlarms` FOREIGN KEY (`triggerUserId`) REFERENCES `users` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT";

    // 쿼리 실행
    return queryInterface.sequelize.query(sql, {
      type: Sequelize.QueryTypes.RAW
    });
  },

  down: async (queryInterface, Sequelize) => {
    var sql = "ALTER TABLE `alarms`" +
        "  DROP FOREIGN KEY `fktUerIdInAlarms`, DROP COLUMN `triggerUserId`";

    return queryInterface.sequelize.query(sql, {
      type: Sequelize.QueryTypes.RAW
    });
  }
};
