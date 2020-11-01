const Sequelize = require('sequelize');

module.exports = class File extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            type:{
                type:Sequelize.STRING(10),
                allowNull:false,
                //banner, image, file, video
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'File',
            tableName:'files',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.File.belongsTo(db.Post,{foreignKey:'postId',targetKey:'id'});
        db.File.belongsTo(db.Chat,{foreignKey:'chatId',targetKey:'id'});
    }
};