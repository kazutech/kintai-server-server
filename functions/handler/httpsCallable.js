const admin = require("firebase-admin");
const functions = require('firebase-functions');

exports.createUser = functions.region("asia-northeast1").https.onCall((data) => {
  return admin.auth().createUser(data)
    .catch((error) => {
      throw new functions.https.HttpsError('internal', error.message)
    });
});
