const Sequelize = require('sequelize');

module.exports = class Portfolio_folder extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            name:{
                type:Sequelize.STRING(30),
                allowNull:false,
            },
            isFavorite:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            favoriteClickedTime:{
                type:Sequelize.STRING(20),
                allowNull:true,
            },
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Portfolio_folder',
            tableName:'portfolio_folders',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Portfolio_folder.belongsTo(db.User,{foreignKey:'userId',targetKey:'id'});
        db.Portfolio_folder.hasMany(db.Portfolio,{foreignKey:'portfolioFolderId',sourceKey:'id',onDelete: 'CASCADE'});
    }
};
