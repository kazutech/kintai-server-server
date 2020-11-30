const functions = require("firebase-functions");

const admin = require("firebase-admin");

const app = require("express")();

const cors = require("cors");

const FBAuth = require("./util/fbAuth");

const { db } = require("./util/admin");

const { signup,signin, submitTime, setAdmin,signUpAsChild } = require("./handler/users");
const { getAllChildSheets, getSheets } = require("./handler/sheets");
const { getCalendar } = require("./handler/calendar");

exports.api = functions.region("asia-northeast1").https.onRequest(app);

//Cors

const corsOptions = {
  origin: "https://kintai-server.web.app",
  allowedHeaders:'Content-Type, Authorization',
  methods: "GET, HEAD, OPTIONS, POST"
  /*
  "http://localhost:3000",
  */
};
app.use(cors(corsOptions));

// users route
app.get("/list", FBAuth, getSheets);
app.post("/childsignup",FBAuth, signUpAsChild);
app.post("/signin", signin);
app.post("/signup",signup);
app.get("/sheets", FBAuth, getAllChildSheets);
app.post("/time", FBAuth, submitTime);
app.post("/admin", FBAuth, setAdmin);
app.get("/calendar", FBAuth, getCalendar);

exports.createUser = functions.region("asia-northeast1").https.onCall((data) => {
  console.log(data);
  return admin.auth().createUser(data)
    .catch((error) => {
      throw new functions.https.HttpsError('internal', error.message)
    });
});

exports.onGroupSubmitCreate = functions
  .region("asia-northeast1")
  .firestore.document("group/{groupId}/date/{submitTime}")
  .onCreate((snapshot, context) => {
    let batch = db.batch();
    return db
      .collection("group")
      .where("groupId", "==", context.params.groupId)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          const group = db.doc(`/group/${doc.id}`);
          const submitTime = snapshot.data().timeline[0].submitTime;
          const submitStatus = snapshot.data().timeline[0].submitStatus;
          batch.update(group, {
            lastTime: submitTime,
            status: submitStatus,
          });
        });
        return batch.commit();
      });
  });

exports.onGroupSubmitChange = functions
  .region("asia-northeast1")
  .firestore.document("group/{userId}/date/{submitTime}")
  .onUpdate((change, context) => {
    /*
    if(change.after.exists && !change.before.exists) {
      db
        .collection("group")
        .where("userId", "==", context.params.userId)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const group = db.doc(`/group/${doc.id}`)
            const submitTime = change.after.data().timeline[
              change.after.data().timeline.length - 1
            ].submitTime;
            const submitStatus = change.after.data().timeline[
              change.after.data().timeline.length - 1
            ].submitStatus;
            batch.update(group, {
              lastTime: submitTime,
              status: submitStatus,
            });
          })
        })
    } else 
    */
    if (change.before.data().timeline !== change.after.data().timeline) {
      let batch = db.batch();
      return db
        .collection("group")
        .where("userId", "==", context.params.userId)
        .get()
        .then((data) => {
          data.forEach((doc) => {
            const group = db.doc(`/group/${doc.id}`);
            const submitTime = change.after.data().timeline[
              change.after.data().timeline.length - 1
            ].submitTime;
            const submitStatus = change.after.data().timeline[
              change.after.data().timeline.length - 1
            ].submitStatus;
            batch.update(group, {
              lastTime: submitTime,
              status: submitStatus,
            });
          });
          return batch.commit();
        });
    } else return true;
  });

/*
exports.onChildrenCreate = functions
  .region("asia-northeast1")
  .firestore.document("group/{userId}")
  .onUpdate((snapshot,context) => {
    let timeline = [];
    return db
    .collection("organization")
    .doc(`/${snapshot.}`)
    .collection("children")
    .doc(
      `/${new Date(
        new Date().toUTCString().split(" GMT")[0].concat(" -0900")
      )
        .toISOString()
        .slice(0, 10)}`
    )
    .create(timeline)
  }
  */

exports.onChildrenChange = functions
  .region("asia-northeast1")
  .firestore.document("group/{userId}")
  .onUpdate((change, context) => {
    console.log("before")
    console.log(change.before.data());
    console.log("after")
    console.log(change.after.data());
    if (change.before.data().lastTime !== change.after.data().lastTime) {
      let batch = db.batch();
      const orgSubCol = db
        .collection("organization")
        .doc(`/${change.after.data().parentId}`)
        .collection("children")
        .doc(
            `/${new Date(
            new Date().toUTCString().split(" GMT")[0].concat(" -0900")
            )
            .toISOString()
            .slice(0, 10)}`
        );
      let timeline;
    
      return orgSubCol.get().then((doc) => {
        if(doc.exists) {
          console.log("hey here")
          console.log(doc.data().timeline)
          timeline = doc.data().timeline
          timeline.push({
            type: change.after.data().type,
            userName: change.after.data().userName,
            userId: change.after.data().userId,
            submitStatus : change.after.data().status,
            submitTime: change.after.data().lastTime,
          });
        } else {
          timeline.push({
            type: change.after.data().type,
            userName: change.after.data().userName,
            userId: change.after.data().userId,
            submitStatus : change.after.data().status,
            submitTime: change.after.data().lastTime,
          });
        }
        batch.update(orgSubCol, { timeline });
        return batch.commit();
      })
    } else return true;
  });
/*
exports.onMonthChange = functions
  .region("asia-northeast1")
  .firestore.document("group/{groupId}/date/{Today}")
  .onUpdate((change, context) => {
    console.log(change.before.data().lastTime);
    console.log(change.after.data().lastTime);
    if (
      change.before
        .split("")
        .filter((element) => {
          return Number.isFinite(Number(element));
        })
        .join("")
        .slice(4, 5) !==
      change.after
        .split("")
        .filter((element) => {
          return Number.isFinite(Number(element));
        })
        .join("")
        .slice(4, 5)
    ) {
      let batch = db.batch();
      let timeline;
      return db
        .collection("organization")
        .doc(`${change.before.data().userId}`)
        .collection("monthlyCh")
        .doc(`${change.before.ref.id.slice(0, 6)}`)
        .get()
        .then(() => {
          if (doc.exists) {
            return (timeline = doc.data().timeline.slice());
          } else return doc.ref.create({ timeline: [] });
        })
        .then(() => {
          const orgSubCol = db
            .collection("organization")
            .doc(`{$change.before.data().orgId}`)
            .collection("monthyCh")
            .doc(`${change.before.ref.id.slice(0, 6)}`);
          timeline.push({
            groupName: change.before.data().groupName,
            status: change.before.data().status,
            lastTime: change.before.data().lastTime,
          });
          batch.update(orgSubCol, { timeline });
          return batch.commit();
        });
    } else return true;
  });

        const organization = db.collection("organization")
        .doc(`${data.docs[0].data().orgId}`)
        .collection("orgTimeline")
        .doc(`${dayjs().format("YYYY-MM-DDTHH:mm")}`)
    
        return organization.get()
        .then(doc => {
            orgTImeline = [];
            batch.update(organization, {
                orgTimeline: change.after.data().timeline[timeline.length - 1]
                .submitTime
            })
        )}
*/
