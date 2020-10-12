const Sequelize = require('sequelize');

module.exports = class Chatroom extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Chatroom',
            tableName:'chatrooms',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Chatroom.belongsTo(db.Club,{foreignKey:'club_id',targetKey:'id'});
        db.Chatroom.hasMany(db.Chat,{foreignKey:'chatroomId',sourceKey:'id'});
        db.Chatroom.hasMany(db.Chatroom_user,{foreignKey:'chatroomId',sourceKey:'id'});
        db.Chatroom.hasMany(db.Chatroom_con_user,{foreignKey:'chatroomId',sourceKey:'id'});
        db.Chatroom.hasMany(db.Chat_unread_user,{foreignKey:'chatroomId',sourceKey:'id'});
    }
};