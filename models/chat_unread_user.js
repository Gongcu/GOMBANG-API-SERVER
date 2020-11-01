const Sequelize = require('sequelize');

module.exports = class Chat_unread_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Chat_unread_user',
            tableName:'chat_unread_users',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Chat_unread_user.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
        db.Chat_unread_user.belongsTo(db.Chat,{foreignKey:'chatId',targetKey:'id'});
        db.Chat_unread_user.belongsTo(db.Chatroom,{foreignKey:'chatroomId',targetKey:'id'});
    }
};