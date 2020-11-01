const Sequelize = require('sequelize');

module.exports = class Portfolio extends Sequelize.Model{
    static init(sequelize){
        return super.init({
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Portfolio',
            tableName:'portfolios',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Portfolio.belongsTo(db.Post,{foreignKey:'postId',targetKey:'id'});
        db.Portfolio.belongsTo(db.Portfolio_folder,{foreignKey:'portfolioFolderId',targetKey:'id'});
    }
};
