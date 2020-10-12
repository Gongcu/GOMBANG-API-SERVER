const Sequelize = require('sequelize');

module.exports = class Chatroom_con_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Chatroom_con_user',
            tableName:'chatroom_con_user',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Chatroom_con_user.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Chatroom_con_user.belongsTo(db.Chatroom,{foreignKey:'chatroomId',targetKey:'id'});
    }
};