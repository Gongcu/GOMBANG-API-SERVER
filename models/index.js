const Sequelize = require('sequelize');
const User = require('./user');
const Club = require('./club');
const Club_user = require('./club_user');
const Hashtag = require('./hashtag');
const ApplicationForm = require('./applicationForm');
const Calendar = require('./calendar');
const User_favorite_club = require('./user_favorite_club');


const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

const sequelize = new Sequelize(config.database,config.username,config.password,config)

db.sequelize = sequelize;

db.User=User;
db.Club=Club;
db.Club_user=Club_user;
db.Hashtag=Hashtag;
db.ApplicationForm=ApplicationForm;
db.Calendar=Calendar;
db.User_favorite_club=User_favorite_club;


User.init(sequelize);
Club.init(sequelize);
Club_user.init(sequelize);
Hashtag.init(sequelize);
ApplicationForm.init(sequelize);
Calendar.init(sequelize);
User_favorite_club.init(sequelize);


User.associate(db);
Club.associate(db);
Club_user.associate(db);
Hashtag.associate(db);
ApplicationForm.associate(db);
Calendar.associate(db);
User_favorite_club.associate(db);

module.exports = db;
