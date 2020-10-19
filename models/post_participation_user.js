const Sequelize = require('sequelize');

module.exports = class Post_participation_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            payment:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Post_participation_user',
            tableName:'post_participation_user',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Post_participation_user.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Post_participation_user.belongsTo(db.Post,{foreignKey:'pid',targetKey:'id'});
    }
};