const Sequelize = require('sequelize');

module.exports = class Club_User extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            nickname:{
                type:Sequelize.STRING(30),
                allowNull:false,
                defaultValue:"",
            },
            authority:{
                type:Sequelize.STRING(5), //"회장,부회장,관리자,회원"
                allowNull:false,
                defaultValue:"멤버",
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