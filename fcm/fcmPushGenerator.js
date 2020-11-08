function fcmPushGenerator(token, content, id, type) {
    if(token.length === 0)
        return;
    const admin = require('./admin')
    const message = {
        data: {
            message: content,
            id: id.toString(), //club, post, chatroom, application, Q&A
            type: type //보여줄 layout 
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