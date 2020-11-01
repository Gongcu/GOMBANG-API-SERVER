const Sequelize = require('sequelize');

module.exports = class Calendar extends Sequelize.Model{
    static init(sequelize){//동아리경험 100자 이내 유의
        return super.init({
            title:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            color:{
                type:Sequelize.STRING(10),
                allowNull:false,
            },
            startDate:{
                type:Sequelize.STRING(20),
                allowNull:false,
            },
            endDate:{
                type:Sequelize.STRING(20),
                allowNull:false,
            },
            place:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
            memo:{
                type:Sequelize.STRING(100),
                allowNull:true,
            },
           
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Calendar',
            tableName:'calendars',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Calendar.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
    }
};