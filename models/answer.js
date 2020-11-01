const Sequelize = require('sequelize');
const formatDate = require('../etc/formatDate');

module.exports = class Answer extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            answer:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDate(Date())
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Answer',
            tableName:'answers',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Answer.hasOne(db.Question,{foreignKey:'answerId',sourceKey:'id'});
    }
};