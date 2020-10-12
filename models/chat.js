const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime');

module.exports = class Chat extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            message:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDateTime(Date())
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Chat',
            tableName:'chats',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Chat.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Chat.belongsTo(db.Chatroom,{foreignKey:'chatroomId',targetKey:'id'});
        db.Chat.hasMany(db.Chat_unread_user,{foreignKey:'chatId',sourceKey:'id'});
    }
};