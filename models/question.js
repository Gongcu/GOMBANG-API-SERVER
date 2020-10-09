const Sequelize = require('sequelize');
const formatDate = require('../etc/formatDate');

module.exports = class Question extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            question:{
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
            modelName:'Question',
            tableName:'questions',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Question.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Question.belongsTo(db.Club,{foreignKey:'club_id',targetKey:'id'});
        db.Question.belongsTo(db.Answer,{foreignKey:'aid',targetKey:'id'});//1:1
    }
};