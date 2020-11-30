const admin = require("firebase-admin");

const serviceAccount = require("./kintai-server-ae3757dc857e.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "http://localhost:8080",
  /* "https://kintai-server.firebaseio.com" */
});

const db = admin.firestore();

module.exports = { admin, db };
