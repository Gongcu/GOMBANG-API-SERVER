function fcmPushGenerator(token, content, id, type) {
    if(token.length === 0)
        return;
    const admin = require('./admin')
    const message = {
        notification:{
            title: '곰방',
            body: content
        },
        data: {
            type: type, //보여줄 layout 
            id: id.toString() //club, post, chatroom, application, Q&A
        },
        tokens: token
    };
    admin.messaging().sendMulticast(message)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });
}

module.exports = fcmPushGenerator;