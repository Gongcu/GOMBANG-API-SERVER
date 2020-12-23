'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'text', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('chats', 'message', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('applicationForms', 'experience', {
      type:Sequelize.TEXT,
      allowNull:false,
      defaultValue:"",
    });

    await queryInterface.changeColumn('clubs', 'text', {
      type:Sequelize.TEXT,
      allowNull:true,
      defaultValue:"",
    });

    await queryInterface.changeColumn('questions', 'question', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('answers', 'answer', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('comments', 'comment', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('posts', 'text', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('chats', 'message', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('applicationforms', 'experience', {
      type:Sequelize.STRING(100),
      allowNull:false,
      defaultValue:"",
    });

    await queryInterface.changeColumn('clubs', 'text', {
      type:Sequelize.STRING,
      allowNull:true,
      defaultValue:"",
    });

    await queryInterface.changeColumn('questions', 'question', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('answers', 'answer', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('comments', 'comment', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};
