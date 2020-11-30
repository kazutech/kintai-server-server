const { user } = require("firebase-functions/lib/providers/auth");
const { db } = require("../util/admin");
//Time
/*
let time;
const today =
  String(new Date().getFullYear()) +
  "-" +
  String(
    new Date().getMonth() + 1 < 10
      ? "0".concat(new Date().getMonth() + 1)
      : new Date().getMonth()
  ) +
  "-" +
  String(
    new Date().getDate() + 1 < 10
      ? "0".concat(new Date().getDate() + 1)
      : new Date().getDate()
  );
*/
exports.getEvents = (req, res) => {
  const userData = {};
  db.collection(`${req.user.type}`)
    .doc(`${req.user.uid}`)
    .collection("shift")
    .doc(
      `${new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
        .toISOString()
        .slice(0, 10)}`
    )
    .get()
    .then((doc) => {
      userData.events = doc.data().events;
      return res.json(userData);
    });
};

exports.postEvents = (req, res) => {
  db.collection(`${req.user.type}`)
    .doc(`${req.user.uid}`)
    .collection("shift")
    .doc(
      `${new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
        .toISOString()
        .slice(0, 10)}`
    )
    .get()
    .then((doc) => {
      doc.ref.update(doc.data().events.concat(req.body.events));
    })
    .then(() => {
      return res.json({ messeage: "shift sucessfullu updated" });
    })
    .catch((err) => {
      console.error(err);
    });
};

exports.getCalendar = (req, res) => {
  let userData = {};
  console.log(req.user.type);
  console.log(req.user.uid);
  req.user.type === "staff" ?
  res.json(userData.timeline = {})
  :
  db.collection(`${req.user.type}`)
    .doc(`${req.user.uid}`)
    .collection("children")
    .where("thisMonth","==",`${new Date(new Date().toUTCString().split(" GMT")[0].concat(" -0900"))
    .toISOString()
    .slice(0, 7)}`)
    .get()
    .then((data) => { 
      console.log(data.empty)
      userData.timeline = [];
      if(!data.empty) {
      data.forEach((doc) => {
        console.log(doc.data().timeline)
        doc.data().timeline.forEach((obj) => {
          userData.timeline.push(obj)
        })
      })}
      console.log(userData)
      return res.json(userData)
    })
    .catch((err) => {
      console.error(err);
    });
};
