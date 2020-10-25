const Sequelize = require('sequelize');
const formatDateTime = require('../etc/formatDateTime');

module.exports = class Alarm extends Sequelize.Model{
    static init(sequelize){
        return super.init({
            content:{
                type:Sequelize.STRING,
                allowNull:false,
            },
            isChecked:{
                type:Sequelize.BOOLEAN,
                allowNull:false,
                defaultValue:false,
            },
            createdAt:{
                type:Sequelize.STRING(20),
                allowNull:false,
                defaultValue:formatDateTime(Date())
            }
        },{
            sequelize,
            timestamps:false,
            underscored:false,
            modelName:'Alarm',
            tableName:'alarms',
            paranoid:false,
            charset:'utf8',
            collate:'utf8_general_ci',
        });
    }
    static associate(db){
        db.Alarm.belongsTo(db.User,{foreignKey:'uid',targetKey:'id'});
        db.Alarm.belongsTo(db.Club,{foreignKey:'club_id',targetKey:'id'}); //공지사항, 이벤트, 댓글
        db.Alarm.belongsTo(db.Post,{foreignKey:'pid',targetKey:'id'}); //공지사항, 이벤트, 댓글
        db.Alarm.belongsTo(db.Comment,{foreignKey:'comment_id',targetKey:'id'}); //댓글
        db.Alarm.belongsTo(db.ApplicationForm,{foreignKey:'form_id',targetKey:'id'}); //신청서
        db.Alarm.belongsTo(db.Question,{foreignKey:'question_id',targetKey:'id'}); //QnA, 문의사항
    }
};