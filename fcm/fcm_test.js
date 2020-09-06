const admin = require("firebase-admin");

const serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)});

const registrationToken = 'edW16yqA3GE:APA91bEFzk8-WXcIJj4qFTK03uvlNYoNLzYfFjar14-Ly-qvn2AlSHQx8wzbvE-m0mIVaGau4xQg5eU5s6yuSfMRhFIeyWhBdF1Pa-CSFRKZ6iyQ1jzh5AvElZtgVyeSWSOvsMLlhnZx';

const message = {
  data: {
    score: '850',
    time: '2:45'
  },
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
});
