const Sequelize = require('sequelize');

module.exports = class Club_User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            nickname:{
                type:Sequelize.STRING(30),
                allowNull:false,
                defaultValue:"",
            },
            member:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            manager:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            alarm:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:true,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Club_user',
            tableName:'club_user',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Club_user.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Club_user.belongsTo(db.Club,{foreignKey:'club_id',targetKey:'id'});
    }
};