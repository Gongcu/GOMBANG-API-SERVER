const Sequelize = require('sequelize');

module.exports = class Post_paid_user extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Post_paid_user',
            tableName:'post_paid_user',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Post_paid_user.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Post_paid_user.belongsTo(db.Post,{foreignKey:'pid',targetKey:'id'});
    }
};