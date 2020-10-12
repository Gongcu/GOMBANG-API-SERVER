const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime');

module.exports = class Chatroom_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Chatroom_user',
            tableName:'chatroom_users',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Chatroom_user.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Chatroom_user.belongsTo(db.Chatroom,{foreignKey:'chatroomId',targetKey:'id'});
    }
};