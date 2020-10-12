const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime');

module.exports = class Comment extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            comment:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDateTime(Date())
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Comment',
            tableName:'comments',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Comment.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Comment.belongsTo(db.Post,{foreignKey:'pid',targetKey:'id'});
    }
};