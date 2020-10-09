const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime.js');

module.exports = class ApplicationForm extends Sequelize.Model{
    static init(sequelize){//동아리경험 100자 이내 유의
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            nickname:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            gender:{
                type:Sequelize.STRING(2),
                allowNull:false,
            },
            birth:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            campus:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            college:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            department:{
                type:Sequelize.STRING(10),
                allowNull:true,
            },
            student_number:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            phone:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
            residence:{
                type:Sequelize.STRING(30),
                allowNull:false,
                defaultValue:"",
            },
            experience:{
                type:Sequelize.STRING(100),
                allowNull:false,
                defaultValue:"",
            },
            isApproved:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDateTime(Date()),
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'ApplicationForm',
            tableName:'applicationforms',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.ApplicationForm.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.ApplicationForm.belongsTo(db.Club,{foreignKey:'cid',targetKey:'id'});
    }
};
